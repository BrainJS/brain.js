import Add from './add';
import Base from './base';
import Convolution from './convolution';
import Dropout from './dropout';
import FullyConnected from './fully-connected';
import Input from './input';
import LeakyRelu from './leaky-relu';
import Multiply from './multiply';
import MultiplyWeights from './multiply-weights';
import MultiplyElement from './multiply-element';
import Output from './output';
import Pool from './pool';
import Relu from './relu';
import Regression from './regression';
import Sigmoid from './sigmoid';
import SoftMax from './soft-max';
import SVM from './svm';
import Tanh from './tanh';

function add(inputLayer1, inputLayer2, settings) {
  return new Add(inputLayer1, inputLayer2, settings);
}
function convolution(inputLayer, settings) {
  return new Convolution(inputLayer, settings);
}
function dropout(inputLayer, settings) {
  return new Dropout(inputLayer, settings);
}
function fullyConnected(inputLayer, settings) {
  return new FullyConnected(inputLayer, settings);
}
function input(settings) {
  return new Input(settings);
}
function leakyRelu(inputLayer, settings) {
  return new LeakyRelu(inputLayer, settings);
}
function multiply(inputLayer1, inputLayer2, settings) {
  return new Multiply(inputLayer1, inputLayer2, settings);
}
function multiplyElement(inputLayer1, inputLayer2, settings) {
  return new MultiplyElement(inputLayer1, inputLayer2, settings);
}
function multiplyWeights(inputLayer, settings) {
  return new MultiplyWeights(inputLayer, settings);
}
function output(inputLayer, settings) {
  return new Output(inputLayer, settings);
}
function pool(inputLayer, settings) {
  return new Pool(inputLayer, settings);
}
function regression(inputLayer, settings) {
  return new Regression(inputLayer, settings);
}
function relu(inputLayer, settings) {
  return new Relu(inputLayer, settings);
}
function sigmoid(inputLayer, settings) {
  return new Sigmoid(inputLayer, settings);
}
function softMax(inputLayer, settings) {
  return new SoftMax(inputLayer, settings);
}
function svm(inputLayer, settings) {
  return new SVM(inputLayer, settings);
}
function tanh(inputLayer, settings) {
  return new Tanh(inputLayer, settings);
}

export default {
  Add,
  add,
  Base,
  Convolution,
  convolution,
  Dropout,
  dropout,
  FullyConnected,
  fullyConnected,
  Input,
  input,
  LeakyRelu,
  leakyRelu,
  Multiply,
  multiply,
  MultiplyElement,
  multiplyElement,
  MultiplyWeights,
  multiplyWeights,
  Output,
  output,
  Pool,
  pool,
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
  tanh
};