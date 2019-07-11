'use strict';

var GPU = require('gpu.js').GPU;

var gpuInstance = null;

function setup(value) {
  gpuInstance = value;
}

function teardown() {
  gpuInstance = null;
}

function makeKernel(fn, settings) {
  if (gpuInstance === null) {
    setup(new GPU({ mode: 'cpu' }));
  }
  if (settings.hasOwnProperty('map')) {
    return gpuInstance.createKernelMap(settings.map, fn, settings).setPipeline(true);
  }
  return gpuInstance.createKernel(fn, settings).setPipeline(true);
}

function kernelInput(input, size) {
  return GPU.input(input, size);
}

module.exports = { setup: setup, teardown: teardown, makeKernel: makeKernel, kernelInput: kernelInput };