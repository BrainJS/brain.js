const Add = require('./add').Add;
const Base = require('./base');
const Convolution = require('./convolution').Convolution;
const Dropout = require('./dropout').Dropout;
// import feedForward from './feed-forward'
const FullyConnected = require('./fully-connected').FullyConnected;
// import gru from './gru'
const Input = require('./input');
const LeakyRelu = require('./leaky-relu').LeakyRelu;
// import lstm from './lstm'
const Multiply = require('./multiply').Multiply;
const MultiplyElement = require('./multiply-element');
const Negative = require('./negative');
const Ones = require('./ones');
// import output from './output'
const Pool = require('./pool').Pool;
const Random = require('./random');
// import recurrent from './recurrent'
const Regression = require('./regression');
const Relu = require('./relu').Relu;
const Sigmoid = require('./sigmoid').Sigmoid;
const SoftMax = require('./soft-max').SoftMax;
const SVM = require('./svm');
const Tanh = require('./tanh').Tanh;
const Target = require('./target');
const Transpose = require('./transpose');
const Zeros = require('./zeros');

function add(inputLayer1, inputLayer2) {
  return new Add(inputLayer1, inputLayer2);
}

function convolution(settings, inputLayer) {
  return new Convolution(settings, inputLayer);
}

function dropout(settings, inputLayer) {
  return new Dropout(settings, inputLayer);
}

function fullyConnected(settings, inputLayer) {
  return new FullyConnected(settings, inputLayer);
}

function input(settings) {
  return new Input(settings);
}

function leakyRelu(inputLayer) {
  return new LeakyRelu(inputLayer);
}

function multiply(inputLayer1, inputLayer2) {
  return new Multiply(inputLayer1, inputLayer2);
}

function multiplyElement(inputLayer1, inputLayer2) {
  return new MultiplyElement(inputLayer1, inputLayer2);
}

function negative(settings, inputLayer) {
  return new Negative(settings, inputLayer);
}

function ones(settings) {
  return new Ones(settings);
}

function pool(settings, inputLayer) {
  return new Pool(settings, inputLayer);
}

function random(settings) {
  return new Random(settings);
}

function regression(settings, inputLayer) {
  return new Regression(settings, inputLayer);
}

function relu(inputLayer) {
  return new Relu(inputLayer);
}

function sigmoid(inputLayer) {
  return new Sigmoid(inputLayer);
}

function softMax(settings, inputLayer) {
  return new SoftMax(settings, inputLayer);
}

function svm(settings, inputLayer) {
  return new SVM(settings, inputLayer);
}

function tanh(inputLayer) {
  return new Tanh(inputLayer);
}

function target(settings, inputLayer) {
  return new Target(settings, inputLayer);
}

function transpose(inputLayer) {
  return new Transpose(inputLayer);
}

function zeros(settings) {
  return new Zeros(settings);
}

module.exports = {
  Add,
  add,
  Base,
  Convolution,
  convolution,
  Dropout,
  dropout,
  // feedForward,
  FullyConnected,
  fullyConnected,
  // gru,
  Input,
  input,
  LeakyRelu,
  leakyRelu,
  // lstm,
  Multiply,
  multiply,
  MultiplyElement,
  multiplyElement,
  Negative,
  negative,
  Ones,
  ones,
  // output,
  Pool,
  pool,
  Random,
  random,
  // recurrent,
  Regression,
  regression,
  Relu,
  relu,
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
};
