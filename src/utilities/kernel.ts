import {
  GPU,
  Input,
  IKernelSettings,
  IKernelRunShortcut,
  KernelFunction,
  OutputDimensions,
  Texture,
} from 'gpu.js';

let gpuInstance: GPU | null = null;

/**
 * Sets up the gpu.js instance
 * @param value Instance of gpu.js
 */
export function setup(value: GPU): void {
  gpuInstance = value;
}

/**
 * Destroys any existing gpu.js instance
 */
export function teardown(): void {
  if (gpuInstance !== null) {
    gpuInstance.destroy().catch(console.log);
  }
  gpuInstance = null;
}

export interface makeKernelSettings extends IKernelSettings {
  map?: {
    [targetLocation: string]: KernelFunction;
  };
}

/**
 * Compiles a function into a gpu.js kernel
 * @param fn The function to be compiled
 * @param settings Kernel settings/options
 */
export function makeKernel(
  fn: KernelFunction,
  settings: makeKernelSettings
): IKernelRunShortcut {
  if (gpuInstance === null) {
    setup(new GPU({ mode: 'gpu' }));
  }

  if (settings.map !== undefined) {
    return gpuInstance!
      .createKernelMap(settings.map, fn, settings)
      .setPipeline(true);
  }
  return gpuInstance!.createKernel(fn, settings).setPipeline(true);
}

/**
 * Compiles a function into a gpu.js dev mode kernel
 * @param fn The function to be compiled
 * @param settings Kernel settings/options
 */
export function makeDevKernel(
  fn: KernelFunction,
  settings: makeKernelSettings
): IKernelRunShortcut {
  if ('map' in settings) {
    throw new Error('map kernels are not supported by dev kernels');
  }
  const gpu = new GPU({ mode: 'dev' });
  return gpu.createKernel(fn, settings);
}

export function kernelInput(value: number[], size: OutputDimensions): Input {
  return new Input(value, size);
}

/**
 * Deletes a gpu.js texture and frees VRAM
 * @param texture Texture to be deleted
 */
export function release(texture: Texture): void {
  if ('delete' in texture) {
    texture.delete();
  }
}

/**
 * Cleans ie sets all elements to 0 of a Texture or a js array
 * @param texture The texture or js array to be cleared
 */
export function clear(
  texture: Texture | Float32Array | Float32Array[] | Float32Array[][]
): void {
  if ('clear' in texture) {
    texture.clear();
    return;
  }
  if (texture instanceof Float32Array) {
    texture.fill(0);
  } else if (texture[0] instanceof Float32Array) {
    for (let x = 0; x < texture.length; x++) {
      (texture[x] as Float32Array).fill(0);
    }
  } else if (texture[0][0] instanceof Float32Array) {
    for (let y = 0; y < texture.length; y++) {
      const row = texture[y];
      for (let x = 0; x < row.length; x++) {
        (row[x] as Float32Array).fill(0);
      }
    }
  }
}

/**
 * Clones a texture or a js array
 * @param texture The texture or js array to be cloned
 */
export function clone(
  texture: Texture | number[] | number[][] | number[][][]
): Texture | number[] | number[][] | number[][][] {
  if ('clone' in texture) {
    return texture.clone();
  }

  if (typeof texture[0] === 'number') {
    return texture.slice(0);
  } else if (typeof texture[0][0] === 'number') {
    const matrix = new Array(texture.length);
    for (let x = 0; x < texture.length; x++) {
      matrix[x] = (texture[x] as number[]).slice(0);
    }
    return matrix;
  } else if (typeof texture[0][0][0] === 'number') {
    const cube = new Array(texture.length);
    for (let y = 0; y < texture.length; y++) {
      const row = texture[y] as number[][];
      const matrix = new Array(row.length);
      for (let x = 0; x < row.length; x++) {
        matrix[x] = row[x].slice(0);
      }
    }
    return cube;
  }

  throw new Error('unknown state!');
}
