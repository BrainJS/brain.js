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

function release(texture) {
  if (texture.delete) {
    texture.delete();
  }
}

function clone(texture) {
  if (texture.clone) {
    return texture.clone();
  }
  if (typeof texture[0] === 'number') {
    return new Float32Array(texture);
  } else if (typeof texture[0][0] === 'number') {
    const result = [];
    for (let y = 0; y < texture.length; y++) {
      result.push(new Float32Array(texture[y]));
    }
    return result;
  } else if (typeof texture[0][0][0] === 'number') {
    const result = [];
    for (let z = 0; z < texture.length; z++) {
      const row = [];
      result.push(row);
      for (let y = 0; y < texture.length; y++) {
        row.push(new Float32Array(texture[z][y]));
      }
    }
    return result;
  }

  throw new Error('unrecognized argument');
}

module.exports = { setup, teardown, makeKernel, makeDevKernel, kernelInput, release, clone };
