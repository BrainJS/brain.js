const { Add, add } = require('./add');
const { arthurFeedForward } = require('./arthur-feed-forward');
const { Base } = require('./base');
const { Convolution, convolution } = require('./convolution');
const { Dropout, dropout } = require('./dropout');
const { feedForward } = require('./feed-forward');
const { FullyConnected, fullyConnected } = require('./fully-connected');
const { gru } = require('./gru');
const { Input, input } = require('./input');
const { LeakyRelu, leakyRelu } = require('./leaky-relu');
const { lstmCell } = require('./lstm-cell');
const { Multiply, multiply } = require('./multiply');
const { MultiplyElement, multiplyElement } = require('./multiply-element');
const { Negative, negative } = require('./negative');
const { Ones, ones } = require('./ones');
const { output } = require('./output');
const { Pool, pool } = require('./pool');
const { Random, random } = require('./random');
const { rnnCell } = require('./rnn-cell');
const { Regression, regression } = require('./regression');
const { Relu, relu } = require('./relu');
const { Sigmoid, sigmoid } = require('./sigmoid');
const { SoftMax, softMax } = require('./soft-max');
const { SVM, svm } = require('./svm');
const { Tanh, tanh } = require('./tanh');
const { Target, target } = require('./target');
const { Transpose, transpose } = require('./transpose');
const { Zeros, zeros } = require('./zeros');
const types = require('./types');

/**
 * @description Layer API, to make it easier to use layers for the world
 */
module.exports = {
  Add,
  add,
  arthurFeedForward,
  Base,
  Convolution,
  convolution,
  Dropout,
  dropout,
  feedForward,
  FullyConnected,
  fullyConnected,
  gru,
  Input,
  input,
  LeakyRelu,
  leakyRelu,
  lstmCell,
  Multiply,
  multiply,
  MultiplyElement,
  multiplyElement,
  Negative,
  negative,
  Ones,
  ones,
  output,
  Pool,
  pool,
  Random,
  random,
  Regression,
  regression,
  Relu,
  relu,
  rnnCell,
  Sigmoid,
  sigmoid,
  SoftMax,
  softMax,
  SVM,
  svm,
  Tanh,
  tanh,
  Target,
  target,
  Transpose,
  transpose,
  Zeros,
  zeros,

  types,
};
