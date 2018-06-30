import GPU from 'gpu.js';
let gpuInstance = null;

export default function(fn, settings) {
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
};

export function setup(value) {
  gpuInstance = value;
}