'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = setup;
exports.teardown = teardown;
exports.makeKernel = makeKernel;
exports.kernelInput = kernelInput;

var _gpu = require('gpu.js');

var _gpu2 = _interopRequireDefault(_gpu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gpuInstance = null;

function setup(value) {
  gpuInstance = value;
}

function teardown() {
  gpuInstance = null;
}

function makeKernel(fn, settings) {
  if (gpuInstance === null) {
    setup(new _gpu2.default({ mode: 'cpu' }));
  }
  if (settings.hasOwnProperty('map')) {
    return gpuInstance.createKernelMap(settings.map, fn, settings).setOutputToTexture(true);
  }
  return gpuInstance.createKernel(fn, settings).setOutputToTexture(true);
}

function kernelInput(input, size) {
  return _gpu2.default.input(input, size);
}