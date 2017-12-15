import Add from './add';
import Base from './base';
import Convolution from './convolution';
import Dropout from './dropout';
import feedForward from './feed-forward';
import FullyConnected from './fully-connected';
import Input from './input';
import LeakyRelu from './leaky-relu';
import Multiply from './multiply';
import MultiplyElement from './multiply-element';
import Output from './output';
import Pool from './pool';
import Relu from './relu';
import Random from './random';
import Regression from './regression';
import Sigmoid from './sigmoid';
import SoftMax from './soft-max';
import SVM from './svm';
import Tanh from './tanh';
import Weigh from './weigh';

function add(inputLayer1, inputLayer2) {
  return new Add([inputLayer1, inputLayer2]);
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
  return new Multiply([inputLayer1, inputLayer2]);
}
function multiplyElement(inputLayer1, inputLayer2) {
  return new MultiplyElement(inputLayer1, inputLayer2);
}
function output(settings, inputLayer) {
  return new Output(settings, inputLayer);
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
function weigh(inputLayer1, inputLayer2) {
  return new Weigh([inputLayer1, inputLayer2]);
}
export {
  Add,
  add,
  Base,
  Convolution,
  convolution,
  Dropout,
  dropout,
  feedForward,
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
  Output,
  output,
  Pool,
  pool,
  Random,
  random,
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
  Weigh,
  weigh
};