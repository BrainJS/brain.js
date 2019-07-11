'use strict';

var activation = require('./activation');
var crossValidate = require('./cross-validate').crossValidate;
var layer = require('./layer');
var likely = require('./likely');
var lookup = require('./lookup');
var praxis = require('./praxis');
var FeedForward = require('./feed-forward');
var NeuralNetwork = require('./neural-network');
var NeuralNetworkGPU = require('./neural-network-gpu');
var TrainStream = require('./train-stream');
var Recurrent = require('./recurrent');
var RNNTimeStep = require('./recurrent/rnn-time-step');
var LSTMTimeStep = require('./recurrent/lstm-time-step');
var GRUTimeStep = require('./recurrent/gru-time-step');
var RNN = require('./recurrent/rnn');
var LSTM = require('./recurrent/lstm');
var GRU = require('./recurrent/gru');
var max = require('./utilities/max');
var mse = require('./utilities/mse');
var ones = require('./utilities/ones');
var random = require('./utilities/random');
var randomWeight = require('./utilities/random-weight');
var randos = require('./utilities/randos');
var range = require('./utilities/range');
var toArray = require('./utilities/to-array');
var DataFormatter = require('./utilities/data-formatter');
var zeros = require('./utilities/zeros');

// layer deps
var feedForward = require('./layer/feed-forward');
var gru = require('./layer/gru');
var lstm = require('./layer/lstm');
var recurrent = require('./layer/recurrent');
var output = require('./layer/output');

layer.feedForward = feedForward;
layer.gru = gru;
layer.lstm = lstm;
layer.recurrent = recurrent;
layer.output = output;

var brain = {
  activation: activation,
  crossValidate: crossValidate,
  likely: likely,
  layer: layer,
  lookup: lookup,
  praxis: praxis,
  FeedForward: FeedForward,
  NeuralNetwork: NeuralNetwork,
  NeuralNetworkGPU: NeuralNetworkGPU,
  Recurrent: Recurrent,
  TrainStream: TrainStream,
  recurrent: {
    RNNTimeStep: RNNTimeStep,
    LSTMTimeStep: LSTMTimeStep,
    GRUTimeStep: GRUTimeStep,
    RNN: RNN,
    LSTM: LSTM,
    GRU: GRU
  },
  utilities: {
    max: max,
    mse: mse,
    ones: ones,
    random: random,
    randomWeight: randomWeight,
    randos: randos,
    range: range,
    toArray: toArray,
    DataFormatter: DataFormatter,
    zeros: zeros
  }
};

if (typeof window !== 'undefined') {
  window.brain = brain; //eslint-disable-line
}

if (typeof module !== 'undefined') {
  module.exports = brain;
}