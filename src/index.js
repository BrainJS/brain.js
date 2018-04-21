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

export default {
  crossValidate,
  likely,
  lookup,
  NeuralNetwork,
  NeuralNetworkGPU,
  TrainStream,
  recurrent: {
    RNN,
    LSTM,
    GRU,
    RNNTimeStep,
    LSTMTimeStep,
    GRUTimeStep
  }
};
