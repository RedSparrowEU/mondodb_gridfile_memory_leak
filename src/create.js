const config = require('./config');
const blobSchema = require('./schema');
const { Timer, memoryUsage } = require('./helpers');

const { mbConnect, mbClose, mbWriteDoc } = require('./components/MongoBlob');

const DROP_DB = true;

const prepareDocument = () => {
  const doc = [];
  for (let iField = 0; iField < 10; iField++) {
    const a = new Array(3 * 1024 * 1024);
    a.fill(255);
    const b = Buffer.from(a);

    doc['field' + iField] = b;
  }
  return doc;
};

const create = async () => {
  console.log(`Start. ${memoryUsage()}`);

  let doc = prepareDocument();

  console.log('Connecting db...');
  await mbConnect(
    config.dbName,
    config.mongoOptions,
    config.modelName,
    blobSchema,
    DROP_DB
  );
  console.log('Connected.');

  console.log(`Writing doc... ${memoryUsage()}`);

  const noOfInserts = 1;

  for (let i = 0; i < noOfInserts; i++) {
    Timer.start();
    await mbWriteDoc(doc);
    console.log(
      `Written ${
        i + 1
      } of ${noOfInserts} in ${Timer.stop()}ms  ${memoryUsage()}`
    );
  }

  await mbClose();

  console.log(`Waiting 10s for garbage collector... ${memoryUsage()} `);

  setTimeout(() => {
    console.log(`Finished. ${memoryUsage()}`);
  }, 10000);
};

create();
