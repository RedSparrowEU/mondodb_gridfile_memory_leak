const mongoose = require('mongoose');
const { Schema } = mongoose;
const gridSchema = require('gridfile');
const GridFile = mongoose.model('GridFile', gridSchema);
const { Readable, Writable } = require('stream');

const gridFilePrefix = 'gfs:';
let dbConnedted = false;
let BlobModel;

const mbConnect = async (dbName, mongoOptions, name, schema, drop) => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(`mongodb://localhost:27017/${dbName}`, mongoOptions)
      .then(() => {
        mongoose.set('bufferCommands', false);
        dbConnedted = true;
        BlobModel = mongoose.model(name, schema);

        if (drop) mongoose.connection.db.dropDatabase(dbName);
        resolve();
      })
      .catch((err) => reject(err));
  });
};

const mbClose = () => {
  return new Promise(async (resolve, reject) => {
    if (!dbConnedted) {
      console.log('No DB connected');
      reject('No DB connected');
      return;
    }
    await mongoose.connection.close();
    resolve();
  });
};

const mbWriteDoc = async (obj) => {
  return new Promise(async (resolve, reject) => {
    if (!dbConnedted) {
      console.log('No DB connected');
      reject('No DB connected');
      return;
    }

    if (!obj) {
      console.log('No doc provided');

      reject('No doc provided');
      return;
    }

    const fields = Object.keys(obj);
    const mongoFields = [];

    console.log(obj);

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (obj[field] instanceof Buffer) {
        const filename = gridFilePrefix + mongoose.Types.ObjectId();
        mongoFields[field] = filename;

        let readable = new Readable();
        readable.push(obj[field]);
        readable.push(null);

        const gridFile = new GridFile({ filename });
        await gridFile.upload(readable);

        readable.destroy();
      } else {
        mongoFields[field] = obj[field];
      }
    }

    const doc = new BlobModel(mongoFields);
    await doc.save();
    resolve();
  });
};

const getBuffer = (id) => {
  return new Promise(async (resolve, rejected) => {
    let gridFileById = await GridFile.findOne({ filename: id });
    if (!gridFileById) {
      rejected('no id');
      return;
    }

    let writable = new Writable();
    let chunks = [];
    writable._write = (chunk, encoding, next) => {
      chunks.push(chunk);
      chunk = [];
      next();
    };
    writable.on('finish', () => {
      resolve(Buffer.concat(chunks));
      // chunks = [];
      // gridFileById = [];
      writable.destroy();
    });
    gridFileById.downloadStream(writable);
  });
};

const mbReadDoc = (schema) => {
  return new Promise(async (resolve, reject) => {
    if (!dbConnedted) {
      console.log('No DB connected');
      reject('No DB connected');
      return;
    }

    doc = await BlobModel.findOne({});
    const fields = Object.keys(schema);

    const obj = [];

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (
        typeof doc[field] === 'string' &&
        doc[field].indexOf(gridFilePrefix) >= 0
      ) {
        obj[field] = await getBuffer(doc[field]);
      } else {
        obj[field] = doc[field];
      }
    }

    resolve(obj);
  });
};

module.exports = {
  mbConnect,
  mbClose,
  mbWriteDoc,
  mbReadDoc,
};
