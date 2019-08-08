const { GPU } = require('gpu.js');

let gpuInstance = null;

function setup(value) {
  gpuInstance = value;
}

function teardown() {
  if (gpuInstance) {
    gpuInstance.destroy();
  }
  gpuInstance = null;
}

function makeKernel(fn, settings) {
  if (gpuInstance === null) {
    setup(new GPU({ mode: 'gpu' }));
  }
  if (settings.hasOwnProperty('map')) {
    return gpuInstance
      .createKernelMap(settings.map, fn, settings)
      .setPipeline(true);
  }
  return gpuInstance
    .createKernel(fn, settings)
    .setPipeline(true);
}

function makeDevKernel(fn, settings) {
  if (settings && settings.map) {
    throw new Error('map kernels are not supported by dev kernels');
  }
  const gpu = new GPU({ mode: 'dev' });
  return gpu.createKernel(fn, settings);
}

function kernelInput(input, size) {
  return GPU.input(input, size);
}

module.exports = { setup, teardown, makeKernel, makeDevKernel, kernelInput };
