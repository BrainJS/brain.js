'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tanh = exports.Tanh = exports.svm = exports.SVM = exports.softMax = exports.SoftMax = exports.sigmoid = exports.Sigmoid = exports.relu = exports.Relu = exports.regression = exports.Regression = exports.pool = exports.Pool = exports.output = exports.Output = exports.multiplyWeights = exports.MultiplyWeights = exports.multiplyElement = exports.MultiplyElement = exports.multiply = exports.Multiply = exports.leakyRelu = exports.LeakyRelu = exports.input = exports.Input = exports.fullyConnected = exports.FullyConnected = exports.dropout = exports.Dropout = exports.convolution = exports.Convolution = exports.Base = exports.add = exports.Add = undefined;

var _add = require('./add');

var _add2 = _interopRequireDefault(_add);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _convolution = require('./convolution');

var _convolution2 = _interopRequireDefault(_convolution);

var _dropout = require('./dropout');

var _dropout2 = _interopRequireDefault(_dropout);

var _fullyConnected = require('./fully-connected');

var _fullyConnected2 = _interopRequireDefault(_fullyConnected);

var _input = require('./input');

var _input2 = _interopRequireDefault(_input);

var _leakyRelu = require('./leaky-relu');

var _leakyRelu2 = _interopRequireDefault(_leakyRelu);

var _multiply = require('./multiply');

var _multiply2 = _interopRequireDefault(_multiply);

var _multiplyWeights = require('./multiply-weights');

var _multiplyWeights2 = _interopRequireDefault(_multiplyWeights);

var _multiplyElement = require('./multiply-element');

var _multiplyElement2 = _interopRequireDefault(_multiplyElement);

var _output = require('./output');

var _output2 = _interopRequireDefault(_output);

var _pool = require('./pool');

var _pool2 = _interopRequireDefault(_pool);

var _relu = require('./relu');

var _relu2 = _interopRequireDefault(_relu);

var _regression = require('./regression');

var _regression2 = _interopRequireDefault(_regression);

var _sigmoid = require('./sigmoid');

var _sigmoid2 = _interopRequireDefault(_sigmoid);

var _softMax = require('./soft-max');

var _softMax2 = _interopRequireDefault(_softMax);

var _svm = require('./svm');

var _svm2 = _interopRequireDefault(_svm);

var _tanh = require('./tanh');

var _tanh2 = _interopRequireDefault(_tanh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function add(inputLayer1, inputLayer2) {
  return new _add2.default([inputLayer1, inputLayer2]);
}
function convolution(settings, inputLayer) {
  return new _convolution2.default(settings, inputLayer);
}
function dropout(settings, inputLayer) {
  return new _dropout2.default(settings, inputLayer);
}
function fullyConnected(settings, inputLayer) {
  return new _fullyConnected2.default(settings, inputLayer);
}
function input(settings) {
  return new _input2.default(settings);
}
function leakyRelu(inputLayer) {
  return new _leakyRelu2.default(inputLayer);
}
function multiply(inputLayer1, inputLayer2) {
  return new _multiply2.default([inputLayer1, inputLayer2]);
}
function multiplyElement(inputLayer1, inputLayer2) {
  return new _multiplyElement2.default(inputLayer1, inputLayer2);
}
function multiplyWeights(settings, inputLayer) {
  return new _multiplyWeights2.default(settings, inputLayer);
}
function output(settings, inputLayer) {
  return new _output2.default(settings, inputLayer);
}
function pool(settings, inputLayer) {
  return new _pool2.default(settings, inputLayer);
}
function regression(settings, inputLayer) {
  return new _regression2.default(settings, inputLayer);
}
function relu(inputLayer) {
  return new _relu2.default(inputLayer);
}
function sigmoid(inputLayer) {
  return new _sigmoid2.default(inputLayer);
}
function softMax(settings, inputLayer) {
  return new _softMax2.default(settings, inputLayer);
}
function svm(settings, inputLayer) {
  return new _svm2.default(settings, inputLayer);
}
function tanh(inputLayer) {
  return new _tanh2.default(inputLayer);
}

exports.Add = _add2.default;
exports.add = add;
exports.Base = _base2.default;
exports.Convolution = _convolution2.default;
exports.convolution = convolution;
exports.Dropout = _dropout2.default;
exports.dropout = dropout;
exports.FullyConnected = _fullyConnected2.default;
exports.fullyConnected = fullyConnected;
exports.Input = _input2.default;
exports.input = input;
exports.LeakyRelu = _leakyRelu2.default;
exports.leakyRelu = leakyRelu;
exports.Multiply = _multiply2.default;
exports.multiply = multiply;
exports.MultiplyElement = _multiplyElement2.default;
exports.multiplyElement = multiplyElement;
exports.MultiplyWeights = _multiplyWeights2.default;
exports.multiplyWeights = multiplyWeights;
exports.Output = _output2.default;
exports.output = output;
exports.Pool = _pool2.default;
exports.pool = pool;
exports.Regression = _regression2.default;
exports.regression = regression;
exports.Relu = _relu2.default;
exports.relu = relu;
exports.Sigmoid = _sigmoid2.default;
exports.sigmoid = sigmoid;
exports.SoftMax = _softMax2.default;
exports.softMax = softMax;
exports.SVM = _svm2.default;
exports.svm = svm;
exports.Tanh = _tanh2.default;
exports.tanh = tanh;
//# sourceMappingURL=index.js.map