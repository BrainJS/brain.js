var crossValidate = require('./dist/cross-validate');
var likely = require('./dist/likely');
var lookup = require('./dist/lookup');
var NeuralNetwork = require('./dist/neural-network');
var TrainStream = require('./dist/train-stream');

module.exports = {
  crossValidate: crossValidate,
  likely: likely,
  lookup: lookup,
  NeuralNetwork: NeuralNetwork,
  TrainStream: TrainStream
};
