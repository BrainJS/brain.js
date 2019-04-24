import { GPU } from 'gpu.js';

let gpuInstance = null;

export function setup(value) {
  gpuInstance = value;
}

export function teardown() {
  gpuInstance = null;
}

export function makeKernel(fn, settings) {
  if (gpuInstance === null) {
    setup(new GPU({ mode: 'cpu' }));
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

export function kernelInput(input, size) {
  return GPU.input(input, size);
}
