import assert from 'assert';
import { IGPUTextureSettings, Kernel, Texture } from 'gpu.js';
import { ILayerTemplate, IPraxis, IPraxisSettings } from '../src/praxis/base-praxis';
import { BaseLayer, ILayerSettings, ILayer } from '../src/layer/base-layer';

export const xorTrainingData = [
  { input: [0, 1], output: [1] },
  { input: [0, 0], output: [0] },
  { input: [1, 1], output: [0] },
  { input: [1, 0], output: [1] },
];

export function onePlusPlus3D(width: number, height: number, depth: number): number[][][] {
  const grid = [];
  let i = 1;
  for (let z = 0; z < depth; z++) {
    const rows = [];
    for (let y = 0; y < height; y++) {
      const columns = [];
      for (let x = 0; x < width; x++) {
        columns.push(i++);
      }
      rows.push(columns);
    }
    grid.push(rows);
  }
  return grid;
}

export function onePlusPlus2D(width: number, height: number): number[][] {
  const rows = [];
  let i = 1;
  for (let y = 0; y < height; y++) {
    const columns = [];
    for (let x = 0; x < width; x++) {
      columns.push(i++);
    }
    rows.push(columns);
  }
  return rows;
}

export function zero3D(width: number, height: number, depth: number): number[][][] {
  const grid = [];
  for (let z = 0; z < depth; z++) {
    const rows = [];
    for (let y = 0; y < height; y++) {
      const columns = [];
      for (let x = 0; x < width; x++) {
        columns.push(0);
      }
      rows.push(columns);
    }
    grid.push(rows);
  }
  return grid;
}

export function zero2D(width: number, height: number): number[][] {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const columns = [];
    for (let x = 0; x < width; x++) {
      columns.push(0);
    }
    rows.push(columns);
  }
  return rows;
}

// export function allWeights(model, fn) {
//   fn(model.input.weights);
//   model.hiddenLayers.forEach((layer) => {
//     for (const p in layer) {
//       if (!layer.hasOwnProperty(p)) continue;
//       assert(fn(layer[p].weights));
//     }
//   });
//   fn(model.output.weights);
//
//   model.equations.forEach((equation) => {
//     equation.states.forEach((state) => {
//       if (state.left && state.left.weights) fn(state.left.weights);
//       if (state.right && state.right.weights) fn(state.right.weights);
//       if (state.product && state.product.weights) fn(state.product.weights);
//     });
//   });
// }

export function allDeltas(model: any, fn: any): void {
  fn(model.input.deltas);
  model.hiddenLayers.forEach((layer: any) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      assert(fn(layer[p].deltas));
    }
  });
  fn(model.output.deltas);

  model.equations.forEach((equation: any) => {
    equation.states.forEach((state: any) => {
      if (state.left && state.left.deltas) fn(state.left.deltas);
      if (state.right && state.right.deltas) fn(state.right.deltas);
      if (state.product && state.product.deltas) fn(state.product.deltas);
    });
  });
}

export function allMatrices(model: any, fn: any): void {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer: any) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].weights);
    }
  });
  fn(model.output.weights);

  model.equations.forEach((equation: any) => {
    equation.states.forEach((state: any) => {
      if (state.left && state.left.weights) fn(state.left.weights);
      if (state.right && state.right.weights) fn(state.right.weights);
      if (state.product && state.product.weights) fn(state.product.weights);
    });
  });

  fn(model.input.deltas);
  model.hiddenLayers.forEach((layer: any) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].deltas);
    }
  });
  fn(model.output.deltas);

  model.equations.forEach((equation: any) => {
    equation.states.forEach((state: any) => {
      if (state.left && state.left.deltas) fn(state.left.deltas);
      if (state.right && state.right.deltas) fn(state.right.deltas);
      if (state.product && state.product.deltas) fn(state.product.deltas);
    });
  });
}

export function shave(value: Float32Array): Float32Array {
  const resultRow = new Float32Array(value.length);
  for (let x = 0; x < value.length; x++) {
    resultRow[x] = parseFloat((value[x]).toFixed(8));
  }
  return resultRow;
}

export function shave2D(value: Float32Array[]): Float32Array[] {
  const resultMatrix = new Array(value.length);
  for (let y = 0; y < value.length; y++) {
    resultMatrix[y] = shave(value[y]);
  }
  return resultMatrix;
}

export function shave3D(value: Float32Array[][]): Float32Array[][] {
  const resultCube = new Array(value.length);
  for (let z = 0; z < value.length; z++) {
    resultCube[z] = shave2D(value[z]);
  }
  return resultCube;
}

// it was found that coverage breaks when you compare leftFunction.toString() === rightString.toString()
// this does a check on the first line of the function source, which is good enough for knowing the function signature
export function expectFunction(source: string, fn: Function): void {
  expect(source.toString().split(/\n/g)[0]).toBe(fn.toString().split(/\n/g)[0]);
}

export class TestLayer extends BaseLayer {
  get width(): number {
    return this.settings.width as number;
  }
  get height(): number {
    return this.settings.height as number;
  }
  get depth(): number {
    return this.settings.depth as number;
  }
  constructor(settings: ILayerSettings) {
    super(settings);
  }
}

export function mockLayer(settings: ILayerSettings = {}): ILayer {
  return new TestLayer({ id: 'MockLayer', ...settings });
}

export function mockTexture(settings?: Partial<IGPUTextureSettings>): Texture {
  return new Texture({
    ...settings,
    texture: {} as any,
    size: [1, 1],
    dimensions: [1, 1],
    output: [1, 1],
    context: {} as any,
    kernel: {} as Kernel,
  });
}

export function mockPraxis(layerTemplate: ILayerTemplate, praxisSettings: Partial<IPraxisSettings> = {}): IPraxis {
  return {
    layerTemplate,
    settings: praxisSettings,
    kernel: null,
    get width() {
      return layerTemplate.width;
    },
    get height() {
      return layerTemplate.height;
    },
    get depth() {
      return layerTemplate.depth;
    },
    run: () => {},
    setupKernels: () => {},
    toJSON: () => {
      return praxisSettings;
    },
  };
}

export interface IWithCompareKernel {
  compareKernel: jest.Mock;
}

export interface IWithPredictKernel {
  predictKernel: jest.Mock;
}

export interface IWithPredictKernelMap {
  predictKernelMap: jest.Mock;
}
