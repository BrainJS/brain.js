import { Filter } from './filter';
import { makeKernel, makeKernelMap, release } from '../utilities/kernel';
import { getPadding, getStride } from '../utilities/layer-setup';
import { zeros3D } from '../utilities/zeros-3d';
import { randos3D } from '../utilities/randos';
import {
  IKernelFunctionThis,
  IKernelMapRunShortcut,
  IKernelRunShortcut,
  ISubKernelObject,
  KernelOutput,
} from 'gpu.js';
import {
  IConvolutionSettingsBase,
  IConvolutionConstantsBase,
} from './convolution';
import { ILayer, ILayerSettings } from './base-layer';

export function setSwitchY(value: number): number {
  return value;
}

export function setSwitchX(value: number): number {
  return value;
}

export interface IPredictConstants extends IConvolutionConstantsBase {
  inputWidth: number;
  inputHeight: number;
}

export function predict(
  this: IKernelFunctionThis<IPredictConstants>,
  inputs: number[][][]
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

  let largestValue = -99999;
  let largestX = -1;
  let largestY = -1;

  // convolve centered at this particular location
  for (
    let filterY = Math.max(0, startFilterY), inputY = Math.max(0, startInputY);
    filterY < endFilterY;
    filterY++, inputY++
  ) {
    for (
      let filterX = Math.max(0, startFilterX),
        inputX = Math.max(0, startInputX);
      filterX < endFilterX;
      filterX++, inputX++
    ) {
      if (
        inputY >= 0 &&
        inputY < this.constants.inputHeight &&
        inputX >= 0 &&
        inputX < this.constants.inputWidth
      ) {
        const input = inputs[this.thread.z][inputY][inputX];
        if (input > largestValue) {
          largestValue = input;
          largestY = inputY;
          largestX = inputX;
        }
      }
    }
  }
  setSwitchY(largestY);
  setSwitchX(largestX);
  return largestValue;
}

export interface ICompareConstants extends IConvolutionConstantsBase {
  outputWidth: number;
  outputHeight: number;
}

export function compare(
  this: IKernelFunctionThis<ICompareConstants>,
  deltas: number[][],
  switchY: number[][],
  switchX: number[][]
): number {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.outputWidth
  );
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.outputHeight
  );

  let value = 0;

  for (let deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (let deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      const switchXValue = switchX[deltasY][deltasX];
      const switchYValue = switchY[deltasY][deltasX];
      if (switchXValue === x && switchYValue === y) {
        value += deltas[deltasY][deltasX];
      }
    }
  }

  return value;
}

export function compare3D(
  this: IKernelFunctionThis<ICompareConstants>,
  deltas: number[][][],
  switchY: number[][][],
  switchX: number[][][]
): number {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.outputWidth
  );
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.outputHeight
  );

  let value = 0;

  for (let deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (let deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      const switchXValue = switchX[this.thread.z][deltasY][deltasX];
      const switchYValue = switchY[this.thread.z][deltasY][deltasX];
      if (switchXValue === x && switchYValue === y) {
        value += deltas[this.thread.z][deltasY][deltasX];
      }
    }
  }

  return value;
}

export interface IPoolSettings
  extends ILayerSettings,
    IConvolutionSettingsBase {
  switchX?: KernelOutput;
  switchY?: KernelOutput;
}

export const defaults: IPoolSettings = {
  padding: 0,
  stride: 0,
  filterWidth: 0,
  filterHeight: 0,
  filterCount: 0,
};

export class Pool extends Filter {
  settings: Partial<IPoolSettings>;

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
    return this.settings.paddingY as number;
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

  get depth(): number {
    return this.settings.filterCount as number;
  }

  get filterCount(): number {
    // TODO: handle 1 depth?
    return this.settings.filterCount as number;
  }

  get switchX(): KernelOutput {
    return this.settings.switchX;
  }

  set switchX(switchX: KernelOutput) {
    this.settings.switchX = switchX;
  }

  get switchY(): KernelOutput {
    return this.settings.switchY;
  }

  set switchY(switchY: KernelOutput) {
    this.settings.switchY = switchY;
  }

  filters: KernelOutput;
  filterDeltas: KernelOutput;
  predictKernelMap: IKernelMapRunShortcut<ISubKernelObject> | null = null;
  constructor(settings: IPoolSettings, inputLayer: ILayer) {
    super(inputLayer);
    this.settings = {
      ...settings,
      ...getStride(settings, defaults),
      ...getPadding(settings, defaults),
    };

    this.weights = randos3D(this.width, this.height, this.depth);
    this.deltas = zeros3D(this.width, this.height, this.depth);

    this.filters = randos3D(
      this.filterWidth,
      this.filterHeight,
      this.filterCount
    );
    this.filterDeltas = zeros3D(
      this.filterWidth,
      this.filterHeight,
      this.filterCount
    );
    this.validate();
  }

  setupKernels(): void {
    this.predictKernelMap = makeKernelMap<
      Parameters<typeof predict>,
      IPredictConstants
    >(
      {
        switchX: setSwitchX,
        switchY: setSwitchY,
      },
      predict,
      {
        output: [this.width, this.height, this.depth],
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterHeight: this.filterHeight,
          filterWidth: this.filterWidth,
        },
      }
    );

    this.compareKernel = makeKernel(compare, {
      output: [
        this.inputLayer.width,
        this.inputLayer.height,
        this.inputLayer.depth,
      ],
      constants: {
        outputWidth: this.width,
        outputHeight: this.height,
        outputDepth: this.depth,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
      },
    });
  }

  predict(): void {
    const { result: weights, switchX, switchY } = (this
      .predictKernelMap as IKernelMapRunShortcut<ISubKernelObject>)(
      this.inputLayer.weights
    );
    this.switchX = switchX;
    this.switchY = switchY;
    this.weights = weights;
  }

  compare(): void {
    // debugger;
    // const depth = this.inputLayer.deltas.length;
    // const height = this.inputLayer.deltas[0].length;
    // const width = this.inputLayer.deltas[0][0].length;
    // const type = typeof this.inputLayer.deltas[0][0][0];
    const inputLayerDeltas = this.inputLayer.deltas;
    this.inputLayer.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.deltas,
      this.switchX,
      this.switchY
    );
    release(inputLayerDeltas);
    // debugger;
    // if (depth !== this.inputLayer.deltas.length) debugger;
    // if (height !== this.inputLayer.deltas[0].length) debugger;
    // if (width !== this.inputLayer.deltas[0][0].length) debugger;
    // if (type !== typeof this.inputLayer.deltas[0][0][0]) debugger;
  }
}

export function pool(settings: IPoolSettings, inputLayer: ILayer): Pool {
  return new Pool(settings, inputLayer);
}
