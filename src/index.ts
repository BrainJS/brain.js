import * as activation from './activation';
import CrossValidate from './cross-validate';
import { FeedForward } from './feed-forward';
import * as layer from './layer';
import { layerTypes } from './layer';
import * as likely from './likely';
import { lookup } from './lookup';
import NeuralNetwork from './neural-network';
import NeuralNetworkGPU from './neural-network-gpu';
import * as praxis from './praxis';
import { Recurrent } from './recurrent';
import GRU from './recurrent/gru';
import GRUTimeStep from './recurrent/gru-time-step';
import LSTM from './recurrent/lstm';
import LSTMTimeStep from './recurrent/lstm-time-step';
import RNN from './recurrent/rnn';
import RNNTimeStep from './recurrent/rnn-time-step';
import TrainStream from './train-stream';
import { DataFormatter } from './utilities/data-formatter';
import { max } from './utilities/max';
import { mse } from './utilities/mse';
import { ones, ones2D } from './utilities/ones';
import * as random from './utilities/random';
import { randomWeight } from './utilities/random-weight';
import { randos } from './utilities/randos';
import { range } from './utilities/range';
import { toArray } from './utilities/to-array';
import toSVG from './utilities/to-svg';
import { zeros } from './utilities/zeros';

export const brain = {
  activation,
  CrossValidate,
  likely,
  layer,
  layerTypes,
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
    ones2D,
    random,
    randomWeight,
    randos,
    range,
    toArray,
    DataFormatter,
    zeros,
    toSVG,
  },
};

if (typeof window !== 'undefined') {
  // @ts-expect-error window.brain
  window.brain = brain;
}

if (typeof module !== 'undefined') {
  module.exports = brain;
}
