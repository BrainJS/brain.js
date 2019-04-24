'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = setup;
exports.teardown = teardown;
exports.makeKernel = makeKernel;
exports.kernelInput = kernelInput;

var _gpu = require('gpu.js');

var gpuInstance = null;

function setup(value) {
  gpuInstance = value;
}

function teardown() {
  gpuInstance = null;
}

function makeKernel(fn, settings) {
  if (gpuInstance === null) {
    setup(new _gpu.GPU({ mode: 'cpu' }));
  }
  if (settings.hasOwnProperty('map')) {
    return gpuInstance.createKernelMap(settings.map, fn, settings).setPipeline(true);
  }
  return gpuInstance.createKernel(fn, settings).setPipeline(true);
}

function kernelInput(input, size) {
  return _gpu.GPU.input(input, size);
}