var CrossValidate = require('./dist/cross-validate').default;
var likely = require('./dist/likely').default;
var lookup = require('./dist/lookup').default;
var NeuralNetwork = require('./dist/neural-network').default;
var NeuralNetworkGPU = require('./dist/neural-network-gpu').default;
var TrainStream = require('./dist/train-stream').default;
var RNNTimeStep = require('./dist/recurrent/rnn-time-step').default;
var LSTMTimeStep = require('./dist/recurrent/lstm-time-step').default;
var GRUTimeStep = require('./dist/recurrent/gru-time-step').default;
var RNN = require('./dist/recurrent/rnn').default;
var LSTM = require('./dist/recurrent/lstm').default;
var GRU = require('./dist/recurrent/gru').default;
var utilities = {
  max: require('./dist/utilities/max').default,
  mse: require('./dist/utilities/mse').default,
  ones: require('./dist/utilities/ones').default,
  random: require('./dist/utilities/random').default,
  randomWeight: require('./dist/utilities/random-weight').default,
  randos: require('./dist/utilities/randos').default,
  range: require('./dist/utilities/range').default,
  toArray: require('./dist/utilities/to-array').default,
  DataFormatter: require('./dist/utilities/data-formatter').default,
  zeros: require('./dist/utilities/zeros').default,
  toSVG: require('./dist/utilities/to-svg').default
};

var brain = {
  CrossValidate: CrossValidate,
  likely: likely,
  lookup: lookup,
  NeuralNetwork: NeuralNetwork,
  NeuralNetworkGPU: NeuralNetworkGPU,
  TrainStream: TrainStream,
  recurrent: {
    RNNTimeStep: RNNTimeStep,
    LSTMTimeStep: LSTMTimeStep,
    GRUTimeStep: GRUTimeStep,
    RNN: RNN,
    LSTM: LSTM,
    GRU: GRU,
  },
  utilities: utilities
};

if (typeof window !== 'undefined') {
  window.brain = brain;
}
if (typeof self !== 'undefined') {
  self.brain = brain;
}
if (typeof module !== 'undefined') {
  module.exports = brain;
}
