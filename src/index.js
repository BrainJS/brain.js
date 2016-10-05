import crossValidate from './cross-validate';
import likely from './likely';
import lookup from './lookup';
import NeuralNetwork from './neural-network';
import TrainStream from './train-stream';
import RNN from './recurrent/rnn';
import LSTM from './recurrent/lstm';
import GRU from './recurrent/gru';

export default {
  crossValidate,
  likely,
  lookup,
  NeuralNetwork,
  TrainStream,
  recurrent: {
    RNN,
    LSTM,
    GRU
  }
};
