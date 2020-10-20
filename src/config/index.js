const mongoOptions = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const gridFilePrefix = 'gfs:';
const dbName = 'DemoDB';
const modelName = 'mainlyblobs';

module.exports = {
  mongoOptions,
  gridFilePrefix,
  dbName,
  modelName,
};
