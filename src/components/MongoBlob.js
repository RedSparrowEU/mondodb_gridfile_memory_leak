const mongoose = require('mongoose');
const { Schema } = mongoose;
const gridSchema = require('gridfile');
const GridFile = mongoose.model('GridFile', gridSchema);
const { Readable } = require('stream');

const gridFilePrefix = 'gfs:';
let dbConnedted = false;
let BlobModel;

const mbConnect = async (dbName, mongoOptions, name, schema) => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(`mongodb://localhost:27017/${dbName}`, mongoOptions)
      .then(() => {
        mongoose.set('bufferCommands', false);
        dbConnedted = true;
        BlobModel = mongoose.model(name, schema);

        mongoose.connection.db.dropDatabase(dbName);
        resolve();
      })
      .catch((err) => reject(err));
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

module.exports = {
  mbConnect,
  mbWriteDoc,
};
