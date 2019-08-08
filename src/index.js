const activation = require('./activation');
const crossValidate = require('./cross-validate').crossValidate;
const layer = require('./layer');
const likely = require('./likely');
const lookup = require('./lookup');
const praxis = require('./praxis');
const { FeedForward } = require('./feed-forward');
const NeuralNetwork = require('./neural-network');
const NeuralNetworkGPU = require('./neural-network-gpu');
const TrainStream = require('./train-stream');
const { Recurrent } = require('./recurrent');
const RNNTimeStep = require('./recurrent/rnn-time-step');
const LSTMTimeStep = require('./recurrent/lstm-time-step');
const GRUTimeStep = require('./recurrent/gru-time-step');
const RNN = require('./recurrent/rnn');
const LSTM = require('./recurrent/lstm');
const GRU = require('./recurrent/gru');
const max = require('./utilities/max');
const mse = require('./utilities/mse');
const ones = require('./utilities/ones');
const random = require('./utilities/random');
const randomWeight = require('./utilities/random-weight');
const randos = require('./utilities/randos');
const range = require('./utilities/range');
const toArray = require('./utilities/to-array');
const DataFormatter = require('./utilities/data-formatter');
const zeros = require('./utilities/zeros');

const brain = {
  activation,
  crossValidate,
  likely,
  layer,
  lookup,
  praxis,
  FeedForward,
  NeuralNetwork,
  NeuralNetworkGPU,
  Recurrent,
  TrainStream,
  recurrent: {
    RNNTimeStep,
    LSTMTimeStep,
    GRUTimeStep,
    RNN,
    LSTM,
    GRU,
  },
  utilities: {
    max,
    mse,
    ones,
    random,
    randomWeight,
    randos,
    range,
    toArray,
    DataFormatter,
    zeros,
  },
};

if (typeof window !== 'undefined') {
  window.brain = brain //eslint-disable-line
}

if (typeof module !== 'undefined') {
  module.exports = brain;
}
