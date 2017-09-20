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

function add(settings, inputLayer1, inputLayer2) {
  return new Add(settings, inputLayer1, inputLayer2);
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
function multiplyWeights(settings, inputLayer) {
  return new MultiplyWeights(settings, inputLayer);
}
function output(settings, inputLayer) {
  return new Output(settings, inputLayer);
}
function pool(settings, inputLayer) {
  return new Pool(settings, inputLayer);
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

export {
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