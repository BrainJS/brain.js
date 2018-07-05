import activation from './activation'
import crossValidate from './cross-validate'
import * as layer from './layer'
import likely from './likely'
import lookup from './lookup'
import praxis from './praxis'
import FeedForward from './feed-forward'
import NeuralNetwork from './neural-network'
import NeuralNetworkGPU from './neural-network-gpu'
import TrainStream from './train-stream'
import Recurrent from './recurrent'
import RNNTimeStep from './recurrent/rnn-time-step'
import LSTMTimeStep from './recurrent/lstm-time-step'
import GRUTimeStep from './recurrent/gru-time-step'
import RNN from './recurrent/rnn'
import LSTM from './recurrent/lstm'
import GRU from './recurrent/gru'
import max from './utilities/max'
import mse from './utilities/mse'
import ones from './utilities/ones'
import random from './utilities/random'
import randomWeight from './utilities/random-weight'
import randos from './utilities/randos'
import range from './utilities/range'
import toArray from './utilities/to-array'
import DataFormatter from './utilities/data-formatter'
import zeros from './utilities/zeros'
import output from './layer/output'

layer.output = output

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
}

if (typeof window !== 'undefined') {
  window.brain = brain //eslint-disable-line
}

if (typeof module !== 'undefined') {
  module.exports = brain
}
