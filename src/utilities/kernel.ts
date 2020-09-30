import {
  GPU,
  Input,
  IKernelRunShortcut,
  IKernelMapRunShortcut,
  KernelFunction,
  OutputDimensions,
  Texture,
  ThreadKernelVariable,
  KernelOutput,
  IConstantsThis,
  ISubKernelObject,
  ThreadFunction,
  IGPUKernelSettings,
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

/**
 * Compiles a function into a gpu.js kernel
 * @param fn The function to be compiled
 * @param settings Kernel settings/options
 */
export function makeKernel<
  ArgTypes extends ThreadKernelVariable[] = ThreadKernelVariable[],
  ConstantsTypes extends IConstantsThis = IConstantsThis
>(
  fn: KernelFunction<ArgTypes, ConstantsTypes>,
  settings: IGPUKernelSettings
): IKernelRunShortcut {
  let _gpuInstance: GPU = gpuInstance as GPU;
  if (_gpuInstance === null) {
    _gpuInstance = new GPU({ mode: 'gpu' });
    setup(_gpuInstance);
  }

  return _gpuInstance
    .createKernel<ArgTypes, ConstantsTypes>(fn, settings)
    .setPipeline(true);
}

export function makeKernelMap<
  ArgTypes extends ThreadKernelVariable[],
  ConstantsTypes extends IConstantsThis
>(
  map: ISubKernelObject,
  fn: ThreadFunction<ArgTypes, ConstantsTypes>,
  settings: IGPUKernelSettings
): IKernelMapRunShortcut<ISubKernelObject> {
  let _gpuInstance: GPU = gpuInstance as GPU;
  if (_gpuInstance === null) {
    _gpuInstance = new GPU({ mode: 'gpu' });
    setup(_gpuInstance);
  }

  return _gpuInstance
    .createKernelMap<ArgTypes, ConstantsTypes>(map, fn, settings)
    .setPipeline(true);
}

/**
 * Compiles a function into a gpu.js dev mode kernel
 * @param fn The function to be compiled
 * @param settings Kernel settings/options
 */
// export function makeDevKernel(
//   fn: ThreadFunction,
//   settings: makeKernelSettings
// ): IKernelRunShortcut {
//   if ('map' in settings) {
//     throw new Error('map kernels are not supported by dev kernels');
//   }
//   const gpu = new GPU({ mode: 'dev' });
//   return gpu.createKernel(fn, settings);
// }

export function kernelInput(value: number[], size: OutputDimensions): Input {
  return new Input(value, size);
}

/**
 * Deletes a gpu.js texture and frees VRAM
 * @param possibleTexture Texture to be deleted
 */
export function release(possibleTexture: KernelOutput | Input): void {
  if (possibleTexture instanceof Texture) {
    possibleTexture.delete();
  }
}

/**
 * Cleans ie sets all elements to 0 of a Texture or a js array
 * @param value The value to be cleared
 */
export function clear(value: KernelOutput): void {
  if (value instanceof Texture) {
    value.clear();
    return;
  }

  // array
  if (Array.isArray(value)) {
    if (typeof value[0] === 'number') {
      (value as number[]).fill(0);
    } else if (typeof value[0][0] === 'number') {
      for (let x = 0; x < value.length; x++) {
        (value[x] as number[]).fill(0);
      }
      return;
    } else if (typeof value[0][0][0] === 'number') {
      // cube
      for (let y = 0; y < value.length; y++) {
        const row: number[][] = value[y] as number[][];
        for (let x = 0; x < row.length; x++) {
          row[x].fill(0);
        }
      }
      return;
    }
  }
  throw new Error('unhandled value');
}

/**
 * Clones a value
 * @param value to be cloned
 */
export function clone(value: KernelOutput): KernelOutput {
  if (value instanceof Texture) {
    return value.clone();
  }

  if (Array.isArray(value)) {
    if (typeof value[0] === 'number') {
      return value.slice(0);
    } else if (typeof value[0][0] === 'number') {
      const matrix = new Array(value.length);
      for (let x = 0; x < value.length; x++) {
        matrix[x] = (value[x] as Float32Array).slice(0);
      }
      return matrix;
    } else if (typeof value[0][0][0] === 'number') {
      const cube = new Array(value.length);
      for (let y = 0; y < value.length; y++) {
        const row = value[y] as number[][];
        const matrix = new Array(row.length);
        for (let x = 0; x < row.length; x++) {
          matrix[x] = row[x].slice(0);
        }
      }
      return cube;
    }
  }
  throw new Error('unhandled value');
}
