import GPU from 'gpu.js';
let gpuInstance = null;

export function makeKernel(fn, settings) {
  if (gpuInstance === null) {
    setup(new GPU());
  }
  if (settings.hasOwnProperty('map')) {
    return gpuInstance.createKernelMap(settings.map, fn, settings)
      .setOutputToTexture(true);
  } else {
    return gpuInstance.createKernel(fn, settings)
      .setOutputToTexture(true);
  }
}

export function kernelInput(input) {
  return GPU.input(input);
}

export function setup(value) {
  gpuInstance = value;
}