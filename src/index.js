import crossValidate from './cross-validate';
import likely from './likely';
import lookup from './lookup';
import NeuralNetwork from './neural-network';
import NeuralNetworkGPU from './neural-network-gpu';
import TrainStream from './train-stream';
import RNN from './recurrent/rnn';
import LSTM from './recurrent/lstm';
import GRU from './recurrent/gru';
import RNNTimeStep from './recurrent/rnn-time-step';
import LSTMTimeStep from './recurrent/lstm-time-step';
import GRUTimeStep from './recurrent/gru-time-step';

var utilities = {
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

var brain = {
  crossValidate: crossValidate,
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
  utilities: utilities,
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
