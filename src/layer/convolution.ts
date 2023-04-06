import { makeKernel, release, clone } from '../utilities/kernel';
import { getStride, getPadding } from '../utilities/layer-setup';
import { Filter } from './filter';
import { randos, randos3D } from '../utilities/randos';
import { zeros3D } from '../utilities/zeros-3d';
import { values } from '../utilities/values';
import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelRunShortcut,
  KernelOutput,
} from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';
import { IPraxis } from '../praxis/base-praxis';

export interface IConvolutionConstantsBase extends IConstantsThis {
  paddingX: number;
  paddingY: number;
  strideX: number;
  strideY: number;
  filterWidth: number;
  filterHeight: number;
}

export interface IPredictConstants extends IConvolutionConstantsBase {
  inputWidth: number;
  inputHeight: number;
  inputDepth: number;
}

export function predict(
  this: IKernelFunctionThis<IPredictConstants>,
  inputs: number[][][],
  filters: number[][][],
  biases: number[]
): number {
  const startFilterX =
    this.constants.paddingX - this.thread.x * this.constants.strideX;
  const startInputX =
    this.thread.x * this.constants.strideX - this.constants.paddingX;
  const endFilterX = Math.min(
    this.constants.filterWidth,
    startFilterX + this.constants.inputWidth
  );

  const startFilterY =
    this.constants.paddingY - this.thread.y * this.constants.strideY;
  const startInputY =
    this.thread.y * this.constants.strideY - this.constants.paddingY;
  const endFilterY = Math.min(
    this.constants.filterHeight,
    startFilterY + this.constants.inputHeight
  );

  let sum = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (
      let filterY = Math.max(0, startFilterY),
        inputY = Math.max(0, startInputY);
      filterY < endFilterY;
      filterY++, inputY++
    ) {
      for (
        let filterX = Math.max(0, startFilterX),
          inputX = Math.max(0, startInputX);
        filterX < endFilterX;
        filterX++, inputX++
      ) {
        sum += filters[z][filterY][filterX] * inputs[z][inputY][inputX];
      }
    }
  }
  return sum + biases[this.thread.z];
}

export interface ICompareFilterDeltasConstants
  extends IConvolutionConstantsBase {
  deltaWidth: number;
  deltaHeight: number;
  inputWidth: number;
  inputHeight: number;
  deltaZ: number;
}

export function compareFilterDeltas(
  this: IKernelFunctionThis<ICompareFilterDeltasConstants>,
  filterDeltas: number[][][],
  inputs: number[][][],
  deltas: number[][][]
): number {
  const startDeltaX = Math.max(
    0,
    Math.ceil(
      (this.constants.paddingX - this.thread.x) / this.constants.strideX
    )
  );
  const startInputX =
    startDeltaX * this.constants.strideX +
    this.thread.x -
    this.constants.paddingX;
  const endDeltaX = Math.min(
    this.constants.deltaWidth,
    Math.floor(
      (this.constants.inputWidth -
        1 -
        this.thread.x +
        this.constants.paddingX) /
        this.constants.strideX
    ) + 1
  );

  const startDeltaY = Math.max(
    0,
    Math.ceil(
      (this.constants.paddingY - this.thread.y) / this.constants.strideY
    )
  );
  const startInputY =
    startDeltaY * this.constants.strideY +
    this.thread.y -
    this.constants.paddingY;
  const endDeltaY = Math.min(
    this.constants.deltaHeight,
    Math.floor(
      (this.constants.inputHeight -
        1 -
        this.thread.y +
        this.constants.paddingY) /
        this.constants.strideY
    ) + 1
  );

  let sum = filterDeltas[this.thread.z][this.thread.y][this.thread.x];
  for (
    let deltaY = startDeltaY, inputY = startInputY;
    deltaY < endDeltaY;
    deltaY++, inputY += this.constants.strideY
  ) {
    for (
      let deltaX = startDeltaX, inputX = startInputX;
      deltaX < endDeltaX;
      deltaX++, inputX += this.constants.strideX
    ) {
      sum +=
        inputs[this.thread.z][inputY][inputX] *
        deltas[this.constants.deltaZ][deltaY][deltaX];
    }
  }
  return sum;
}

export interface ICompareInputDeltasConstants
  extends IConvolutionConstantsBase {
  deltaHeight: number;
  deltaWidth: number;
  deltaZ: number;
}

export function compareInputDeltas(
  this: IKernelFunctionThis<ICompareInputDeltasConstants>,
  inputDeltas: number[][][],
  filters: number[][][],
  deltas: number[][][]
): number {
  const x = this.thread.x + this.constants.paddingX;
  const startDeltaX =
    x < this.constants.filterWidth
      ? 0
      : Math.floor(
          (x - this.constants.filterWidth + this.constants.strideX) /
            this.constants.strideX
        );
  const startFilterX = x - startDeltaX * this.constants.strideX;
  const endDeltaX = Math.min(
    startDeltaX + Math.floor(startFilterX / this.constants.strideX) + 1,
    this.constants.deltaWidth
  );

  const y = this.thread.y + this.constants.paddingY;
  const startDeltaY =
    y < this.constants.filterHeight
      ? 0
      : Math.floor(
          (y - this.constants.filterHeight + this.constants.strideY) /
            this.constants.strideY
        );
  const startFilterY = y - startDeltaY * this.constants.strideY;
  const endDeltaY = Math.min(
    startDeltaY + Math.floor(startFilterY / this.constants.strideY) + 1,
    this.constants.deltaHeight
  );

  let sum = inputDeltas[this.thread.z][this.thread.y][this.thread.x];
  let deltaY = startDeltaY;
  for (
    let filterY = startFilterY;
    deltaY < endDeltaY;
    filterY -= this.constants.strideY, deltaY++
  ) {
    let deltaX = startDeltaX;
    for (
      let filterX = startFilterX;
      deltaX < endDeltaX;
      filterX -= this.constants.strideX, deltaX++
    ) {
      sum +=
        filters[this.thread.z][filterY][filterX] *
        deltas[this.constants.deltaZ][deltaY][deltaX];
    }
  }
  return sum;
}

export interface ICompareBiasesConstants extends IConstantsThis {
  deltaHeight: number;
  deltaWidth: number;
}

export function compareBiases(
  this: IKernelFunctionThis<ICompareBiasesConstants>,
  biasDeltas: number[][][],
  deltas: number[][][]
): number {
  let sum = 0;
  for (let y = 0; y < this.constants.deltaHeight; y++) {
    for (let x = 0; x < this.constants.deltaWidth; x++) {
      sum += deltas[this.thread.z][y][x];
    }
  }
  return biasDeltas[this.thread.z][this.thread.y][this.thread.x] + sum;
}

export interface IConvolutionSettingsBase {
  stride?: number;
  strideX?: number;
  strideY?: number;
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  filterCount?: number;
  filterWidth?: number;
  filterHeight?: number;
}

export interface IConvolutionSettings
  extends ILayerSettings,
    IConvolutionSettingsBase {
  bias?: number;
  biases?: KernelOutput;
  biasDeltas?: KernelOutput;
  filters?: KernelOutput;
  filterDeltas?: KernelOutput;
}

export const defaults: IConvolutionSettings = {
  stride: 0,
  padding: 0,
  bias: 0.1,
  filterCount: 1,
  filterWidth: 0,
  filterHeight: 0,
};

export class Convolution extends Filter {
  settings: Partial<IConvolutionSettings>;

  get strideX(): number {
    return this.settings.strideX as number;
  }

  get strideY(): number {
    return this.settings.strideY as number;
  }

  get paddingX(): number {
    return this.settings.paddingX as number;
  }

  get paddingY(): number {
    return this.settings.paddingX as number;
  }

  get width(): number {
    return Math.floor(
      (this.inputLayer.width + this.paddingX * 2 - this.filterWidth) /
        this.strideX +
        1
    );
  }

  get height(): number {
    return Math.floor(
      (this.inputLayer.height + this.paddingY * 2 - this.filterHeight) /
        this.strideY +
        1
    );
  }

  get bias(): number {
    return this.settings.bias as number;
  }

  get depth(): number {
    return this.filterCount;
  }

  get biases(): KernelOutput {
    return this.settings.biases;
  }

  set biases(biases: KernelOutput) {
    this.settings.biases = biases;
  }

  get biasDeltas(): KernelOutput {
    return this.settings.biasDeltas;
  }

  set biasDeltas(weights: KernelOutput) {
    this.settings.biasDeltas = weights;
  }

  get filters(): KernelOutput {
    return this.settings.filters;
  }

  set filters(filters: KernelOutput) {
    this.settings.filters = filters;
  }

  get filterDeltas(): KernelOutput {
    return this.settings.filterDeltas;
  }

  set filterDeltas(filterDeltas: KernelOutput) {
    this.settings.filterDeltas = filterDeltas;
  }

  constructor(settings: IConvolutionSettings, inputLayer: ILayer) {
    super(settings, inputLayer);
    this.settings = {
      ...defaults,
      ...settings,
      ...getPadding(settings, defaults),
      ...getStride(settings, defaults),
    };

    this.weights =
      settings.weights ?? randos3D(this.width, this.height, this.depth);
    this.deltas = zeros3D(this.width, this.height, this.depth);

    this.biases = values(this.depth, this.bias);
    this.biasDeltas = settings.biasDeltas ?? randos(this.depth);

    this.filters =
      settings.filters ??
      randos3D(this.filterWidth, this.filterHeight, this.filterCount);
    this.filterDeltas = zeros3D(
      this.filterWidth,
      this.filterHeight,
      this.filterCount
    );
    this.validate();
  }

  compareFilterDeltasKernel: IKernelRunShortcut | null = null;
  compareInputDeltasKernel: IKernelRunShortcut | null = null;
  compareBiasesKernel: IKernelRunShortcut | null = null;
  setupKernels(): void {
    this.predictKernel = makeKernel<
      Parameters<typeof predict>,
      IPredictConstants
    >(predict, {
      constants: {
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        inputDepth: this.inputLayer.depth,
        strideX: this.strideX,
        strideY: this.strideY,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
      },
      output: [this.width, this.height, this.depth],
      immutable: true,
    });

    this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas, {
      constants: {
        deltaWidth: this.width,
        deltaHeight: this.height,
        deltaZ: this.depth,
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        inputDepth: this.inputLayer.depth,
        strideX: this.strideX,
        strideY: this.strideY,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
      },
      output: [this.width, this.height, this.depth],
      immutable: true,
    });

    this.compareInputDeltasKernel = makeKernel(compareInputDeltas, {
      constants: {
        deltaWidth: this.width,
        deltaHeight: this.height,
        deltaZ: this.depth,
        strideX: this.strideX,
        strideY: this.strideY,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
        filterCount: this.filterCount,
      },
      output: [
        this.inputLayer.width,
        this.inputLayer.height,
        this.inputLayer.depth,
      ],
      immutable: true,
    });

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [1, 1, this.depth],
      constants: {
        deltaWidth: this.width,
        deltaHeight: this.height,
      },
      immutable: true,
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
    const { filterDeltas, biasDeltas } = this;
    this.filterDeltas = (this.compareFilterDeltasKernel as IKernelRunShortcut)(
      filterDeltas,
      this.inputLayer.weights,
      this.deltas
    );
    release(filterDeltas);
    this.biasDeltas = (this.compareBiasesKernel as IKernelRunShortcut)(
      biasDeltas,
      this.deltas
    );
    release(biasDeltas);
    release(this.deltas);
    this.deltas = (this.compareInputDeltasKernel as IKernelRunShortcut)(
      this.filters,
      this.inputLayer.deltas
    );

    release(this.inputLayer.deltas);
    // TODO: do we need to clone here?
    this.inputLayer.deltas = clone(this.deltas);
  }

  learn(learningRate: number): void {
    // TODO: handle filters
    // TODO: do we need to release here?
    const { weights: oldWeights } = this;
    this.weights = (this.praxis as IPraxis).run(this, learningRate);
    release(oldWeights);
  }
}

export function convolution(
  settings: IConvolutionSettings,
  inputLayer: ILayer
): Convolution {
  return new Convolution(settings, inputLayer);
}
