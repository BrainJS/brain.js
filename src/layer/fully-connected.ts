import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelRunShortcut,
  KernelOutput,
} from 'gpu.js';
import { Filter, IFilterSettings } from './filter';
import { makeKernel, release } from '../utilities/kernel';
import { values } from '../utilities/values';
import { randos2D, randos3D } from '../utilities/randos';
import { zeros } from '../utilities/zeros';
import { zeros2D } from '../utilities/zeros-2d';
import { zeros3D } from '../utilities/zeros-3d';
import { ILayer } from './base-layer';

export interface IPredictConstants extends IConstantsThis {
  inputWidth: number;
  inputHeight: number;
}

export function predict(
  this: IKernelFunctionThis<IPredictConstants>,
  inputs: number[][],
  filters: number[][],
  biases: number[]
): number {
  let output = 0;
  let i = 0;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[this.thread.x][i];
      i++;
    }
  }
  return output + biases[this.thread.x];
}

export function predict3D(
  this: IKernelFunctionThis<IPredictConstants>,
  inputs: number[][][],
  filters: number[][],
  biases: number[]
): number {
  let output = 0;
  let i = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        output += inputs[z][y][x] * filters[this.thread.x][i];
        i++;
      }
    }
  }
  return output + biases[this.thread.x];
}

export interface ICompareInputDeltasConstants extends IConstantsThis {
  filterCount: number;
}

export function compareInputDeltas(
  this: IKernelFunctionThis<ICompareInputDeltasConstants>,
  inputDeltas: number[][],
  deltas: number[][],
  filters: number[][]
): number {
  let sum = 0;
  const filterX = this.thread.x + this.thread.y * this.output.x;
  for (let filterY = 0; filterY < this.constants.filterCount; filterY++) {
    sum += filters[filterY][filterX] * deltas[0][filterY];
  }
  return sum + inputDeltas[this.thread.y][this.thread.x];
}

export function compareInputDeltas3D(
  this: IKernelFunctionThis<ICompareInputDeltasConstants>,
  inputDeltas: number[][][],
  deltas: number[][],
  filters: number[][]
): number {
  let sum = 0;
  const filterX = this.thread.x + this.thread.y * this.output.x;
  for (let filterY = 0; filterY < this.constants.filterCount; filterY++) {
    sum += filters[filterY][filterX] * deltas[0][filterY];
  }
  return sum + inputDeltas[this.thread.z][this.thread.y][this.thread.x];
}

export function compareBiases(
  this: IKernelFunctionThis,
  biases: number[],
  deltas: number[][]
): number {
  return biases[this.thread.x] + deltas[this.thread.y][this.thread.x];
}

export interface ICompareFiltersDeltas extends IConstantsThis {
  deltaX: number;
  deltaY: number;
  inputWidth: number;
  inputHeight: number;
}

export function compareFilterDeltas(
  this: IKernelFunctionThis<ICompareFiltersDeltas>,
  filterDeltas: number[][],
  inputWeights: number[][],
  deltas: number[][]
): number {
  return (
    filterDeltas[this.thread.y][this.thread.x] +
    inputWeights[this.thread.y][this.thread.x] *
      deltas[this.constants.deltaY][this.constants.deltaX]
  );
}

export function compareFilterDeltas3D(
  this: IKernelFunctionThis<ICompareFiltersDeltas>,
  filterDeltas: number[][],
  inputWeights: number[][][],
  deltas: number[][]
): number {
  const inputZ = Math.floor(
    this.thread.x / (this.constants.inputWidth * this.constants.inputHeight)
  );
  const inputY = Math.floor(
    (this.thread.x -
      inputZ * this.constants.inputWidth * this.constants.inputHeight) /
      this.constants.inputWidth
  );
  const inputX =
    this.thread.x -
    this.constants.inputWidth * (inputY + this.constants.inputHeight * inputZ);
  return (
    filterDeltas[this.thread.y][this.thread.x] +
    inputWeights[inputZ][inputY][inputX] * deltas[0][this.thread.y]
  );
}

export interface IFullyConnectedDefaultSettings
  extends Partial<IFilterSettings> {
  bias?: number;
  biases?: KernelOutput;
  biasDeltas?: KernelOutput;
}

export const defaults: IFullyConnectedDefaultSettings = {
  bias: 0.1,
};

export class FullyConnected extends Filter {
  get bias(): number {
    return this.settings.bias as number;
  }

  get biases(): KernelOutput {
    return this.settings.biases;
  }

  set biases(biases: KernelOutput) {
    this.settings.biases = biases;
  }

  get biasDeltas(): KernelOutput {
    return this.settings.biases;
  }

  set biasDeltas(biasDeltas: KernelOutput) {
    this.settings.biasDeltas = biasDeltas;
  }

  settings: Partial<IFullyConnectedDefaultSettings>;
  compareFilterDeltasKernel: IKernelRunShortcut | null = null;
  compareInputDeltasKernel: IKernelRunShortcut | null = null;
  compareBiasesKernel: IKernelRunShortcut | null = null;
  constructor(
    settings: Partial<IFullyConnectedDefaultSettings>,
    inputLayer: ILayer
  ) {
    super(settings, inputLayer);
    this.settings = { ...settings };
    this.validate();

    const connectionCount =
      inputLayer.width * inputLayer.height * inputLayer.depth;

    this.biases = values(this.height, this.bias);
    this.biasDeltas = zeros(this.height);

    this.filters = randos2D(connectionCount, this.height);
    this.filterDeltas = zeros2D(connectionCount, this.height);

    if (this.depth > 0) {
      this.weights = randos3D(this.width, this.height, this.depth);
      this.deltas = zeros3D(this.width, this.height, this.depth);
    } else if (this.height > 0) {
      this.weights = randos2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
    }
  }

  validate(): void {
    super.validate();
    if (this.depth > 0) throw new Error('depth not supported');
  }

  setupKernels(): void {
    const { inputLayer } = this;
    const connectionCount =
      inputLayer.width * inputLayer.height * inputLayer.depth;
    if (inputLayer.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [this.width, this.height],
        constants: {
          inputHeight: inputLayer.height,
          inputWidth: inputLayer.width,
          inputDepth: inputLayer.depth,
        },
      });

      this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas3D, {
        output: [connectionCount, this.height],
        constants: {
          deltaX: 0,
          deltaY: 0,
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
        },
        immutable: true,
      });

      this.compareInputDeltasKernel = makeKernel(compareInputDeltas3D, {
        output: [inputLayer.width, inputLayer.height, inputLayer.depth],
        constants: {
          filterCount: this.height,
        },
        immutable: true,
      });
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height],
        constants: {
          inputHeight: inputLayer.height,
          inputWidth: inputLayer.width,
        },
      });

      this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas, {
        output: [connectionCount, this.height],
        constants: {
          deltaX: 0,
          deltaY: 0,
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
        },
      });

      this.compareInputDeltasKernel = makeKernel(compareInputDeltas, {
        output: [inputLayer.width, inputLayer.height],
        constants: {
          filterCount: this.height,
        },
      });
    }

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [this.width, this.height],
    });
  }

  predict(): void {
    this.weights = (this.predictKernel as IKernelRunShortcut)(
      this.inputLayer.weights,
      this.filters,
      this.biases
    );
  }

  compare(): void {
    const inputLayerDeltas = this.inputLayer.deltas;
    this.inputLayer.deltas = (
      this.compareInputDeltasKernel as IKernelRunShortcut
    )(inputLayerDeltas, this.deltas, this.filters);
    release(inputLayerDeltas);

    const { biasDeltas, filterDeltas } = this;
    // TODO: handle biasDeltas learn
    this.biasDeltas = (this.compareBiasesKernel as IKernelRunShortcut)(
      this.biases,
      this.deltas
    );

    // TODO: handle filterDeltas learn
    this.filterDeltas = (this.compareFilterDeltasKernel as IKernelRunShortcut)(
      filterDeltas,
      this.inputLayer.weights,
      this.deltas
    );
    release(biasDeltas);
    release(filterDeltas);
  }
}

export function fullyConnected(
  settings: IFullyConnectedDefaultSettings,
  inputLayer: ILayer
): FullyConnected {
  return new FullyConnected(settings, inputLayer);
}
