'use strict';

var Add = require('./add').Add;
var Base = require('./base');
var Convolution = require('./convolution').Convolution;
var Dropout = require('./dropout').Dropout;
// import feedForward from './feed-forward'
var FullyConnected = require('./fully-connected').FullyConnected;
// import gru from './gru'
var Input = require('./input');
var LeakyRelu = require('./leaky-relu').LeakyRelu;
// import lstm from './lstm'
var Multiply = require('./multiply').Multiply;
var MultiplyElement = require('./multiply-element');
var Negative = require('./negative');
var Ones = require('./ones');
// import output from './output'
var Pool = require('./pool').Pool;
var Random = require('./random');
// import recurrent from './recurrent'
var Regression = require('./regression');
var Relu = require('./relu').Relu;
var Sigmoid = require('./sigmoid').Sigmoid;
var SoftMax = require('./soft-max').SoftMax;
var SVM = require('./svm');
var Tanh = require('./tanh').Tanh;
var Target = require('./target');
var Transpose = require('./transpose');
var Zeros = require('./zeros');

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
  Add: Add,
  add: add,
  Base: Base,
  Convolution: Convolution,
  convolution: convolution,
  Dropout: Dropout,
  dropout: dropout,
  // feedForward,
  FullyConnected: FullyConnected,
  fullyConnected: fullyConnected,
  // gru,
  Input: Input,
  input: input,
  LeakyRelu: LeakyRelu,
  leakyRelu: leakyRelu,
  // lstm,
  Multiply: Multiply,
  multiply: multiply,
  MultiplyElement: MultiplyElement,
  multiplyElement: multiplyElement,
  Negative: Negative,
  negative: negative,
  Ones: Ones,
  ones: ones,
  // output,
  Pool: Pool,
  pool: pool,
  Random: Random,
  random: random,
  // recurrent,
  Regression: Regression,
  regression: regression,
  Relu: Relu,
  relu: relu,
  Sigmoid: Sigmoid,
  sigmoid: sigmoid,
  SoftMax: SoftMax,
  softMax: softMax,
  SVM: SVM,
  svm: svm,
  Tanh: Tanh,
  tanh: tanh,
  Target: Target,
  target: target,
  Transpose: Transpose,
  transpose: transpose,
  Zeros: Zeros,
  zeros: zeros
};