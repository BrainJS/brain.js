import crossValidate from './cross-validate';
import * as layer from './layer';
import * as activation from './activation';
import likely from './likely';
import lookup from './lookup';
import NeuralNetwork from './neural-network';
import NeuralNetworkGPU from './neural-network-gpu';
import TrainStream from './train-stream';
import RNN from './recurrent/rnn';
import LSTM from './recurrent/lstm';
import GRU from './recurrent/gru';
import FeedForward from './feed-forward';
import Recurrent from './recurrent';
import praxis from './praxis';

const utilities = {
  max: require('./utilities/max').default,
  mse: require('./utilities/mse').default,
  ones: require('./utilities/ones').default,
  random: require('./utilities/random').default,
  randomWeight: require('./utilities/random-weight').default,
  randos: require('./utilities/randos').default,
  range: require('./utilities/range').default,
  toArray: require('./utilities/to-array').default,
  DataFormatter: require('./utilities/data-formatter').default,
  zeros: require('./utilities/zeros').default,
};

const brain = {
  crossValidate,
  likely,
  lookup,
  NeuralNetwork,
  NeuralNetworkGPU,
  TrainStream,
  recurrent: {
    RNNTimeStep,
    LSTMTimeStep,
    GRUTimeStep,
    RNN,
    LSTM,
    GRU,
  },
  utilities,
};

export {
  FeedForward,
  Recurrent,
  activation,
  layer,
  praxis
};
