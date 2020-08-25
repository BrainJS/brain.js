const { GPU, input } = require('gpu.js');

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
  return gpuInstance.createKernel(fn, settings).setPipeline(true);
}

function makeDevKernel(fn, settings) {
  if (settings && settings.map) {
    throw new Error('map kernels are not supported by dev kernels');
  }
  const gpu = new GPU({ mode: 'dev' });
  return gpu.createKernel(fn, settings);
}

function kernelInput(value, size) {
  return input(value, size);
}

function release(texture) {
  if (texture && texture.delete) {
    texture.delete();
  }
}

function clear(texture) {
  if (texture.clear) {
    texture.clear();
    return;
  }
  if (texture instanceof Float32Array) {
    texture.fill(0);
  } else if (texture[0] instanceof Float32Array) {
    for (let x = 0; x < texture.length; x++) {
      texture[x].fill(0);
    }
  } else if (texture[0][0] instanceof Float32Array) {
    for (let y = 0; y < texture.length; y++) {
      const row = texture[y];
      for (let x = 0; x < row.length; x++) {
        row[x].fill(0);
      }
    }
  }
}

function clone(texture) {
  if (texture.clone) {
    return texture.clone();
  }
  if (typeof texture[0] === 'number') {
    return texture.slice(0);
  } else if (typeof texture[0][0] === 'number') {
    const matrix = new Array(texture.length);
    for (let x = 0; x < texture.length; x++) {
      matrix[x] = texture[x].slice(0);
    }
    return matrix;
  } else if (typeof texture[0][0][0] === 'number') {
    const cube = new Array(texture.length);
    for (let y = 0; y < texture.length; y++) {
      const row = texture[y];
      const matrix = new Array(row.length);
      for (let x = 0; x < row.length; x++) {
        matrix[x] = row[x].slice(0);
      }
    }
    return cube;
  }
  throw new Error('unknown state!');
}

module.exports = {
  setup,
  teardown,
  makeKernel,
  makeDevKernel,
  kernelInput,
  release,
  clone,
  clear,
};
