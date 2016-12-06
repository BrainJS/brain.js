var crossValidate = require('./dist/cross-validate');
var likely = require('./dist/likely');
var lookup = require('./dist/lookup');
var NeuralNetwork = require('./dist/neural-network');
var TrainStream = require('./dist/train-stream');
var RNN = require('./dist/recurrent/rnn');
var LSTM = require('./dist/recurrent/lstm');
var GRU = require('./dist/recurrent/gru');
var utilities = {
  max: require('./dist/utilities/max'),
  mse: require('./dist/utilities/mse'),
  ones: require('./dist/utilities/ones'),
  random: require('./dist/utilities/random'),
  randomWeight: require('./dist/utilities/random-weight'),
  randos: require('./dist/utilities/randos'),
  range: require('./dist/utilities/range'),
  toArray: require('./dist/utilities/to-array'),
  Vocab: require('./dist/utilities/vocab'),
  zeros: require('./dist/utilities/zeros')
};

module.exports = {
  crossValidate: crossValidate,
  likely: likely,
  lookup: lookup,
  NeuralNetwork: NeuralNetwork,
  TrainStream: TrainStream,
  recurrent: {
    RNN: RNN,
    LSTM: LSTM,
    GRU: GRU,
  },
  utilities: utilities
};

if (typeof window !== 'undefined') {
  var brain = window.brain = {};
  var i;

  for (i in module.exports) {
    brain[i] = module.exports[i].default || module.exports[i];
  }
  for (i in module.exports.utilities) {
    brain.utilities[i] = module.exports.utilities[i].default || module.exports.utilities[i];
  }
  for (i in module.exports.recurrent) {
    brain.recurrent[i] = module.exports.recurrent[i].default || module.exports.recurrent[i];
  }
}
