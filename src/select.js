const config = require('./config');
const blobSchema = require('./schema');
const { Timer, memoryUsage } = require('./helpers');

const { mbConnect, mbClose, mbReadDoc } = require('./components/MongoBlob');

const select = async () => {
  console.log(`Start. ${memoryUsage()}`);
  console.log('Connecting db...');
  await mbConnect(
    config.dbName,
    config.mongoOptions,
    config.modelName,
    blobSchema
  );
  console.log('Connected.');

  console.log(`Reading doc... ${memoryUsage()}`);

  const noOfReadings = 100;

  for (let i = 0; i < noOfReadings; i++) {
    Timer.start();
    const doc = await mbReadDoc(blobSchema);
    console.log(doc);
    console.log(
      `Read ${i + 1} of ${noOfReadings} in ${Timer.stop()}ms  ${memoryUsage()}`
    );
  }

  await mbClose();

  console.log(`Waiting 10s for garbage collector... ${memoryUsage()} `);

  setTimeout(() => {
    console.log(`Finished. ${memoryUsage()}`);
  }, 10000);
};

select();
