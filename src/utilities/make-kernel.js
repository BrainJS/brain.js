'use strict';
let gpu = null;

export default function(fn, settings) {
  return;
  if (settings.hasOwnProperty('map')) {
    return gpu.createKernelMap(settings.map, fn, settings)
      .setOutputToTexture(true);
  } else {
    return gpu.createKernel(fn, settings)
      .setOutputToTexture(true);
  }
};

export function setup(gpuInstance) {
  gpu = gpuInstance;
}