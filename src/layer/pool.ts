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
  // Ends are exclusive, that is if end=4, the last item is 3
  const unclippedStartInputX =
    this.thread.x * this.constants.strideX - this.constants.paddingX;
  const unclippedStartInputY =
    this.thread.y * this.constants.strideY - this.constants.paddingY;
  const unclippedEndInputX = unclippedStartInputX + this.constants.filterWidth;
  const unclippedEndInputY = unclippedStartInputY + this.constants.filterHeight;
  const startInputX = Math.max(unclippedStartInputX, 0);
  const startInputY = Math.max(unclippedStartInputY, 0);
  const endInputX = Math.min(unclippedEndInputX, this.constants.inputWidth);
  const endInputY = Math.min(unclippedEndInputY, this.constants.inputHeight);

  let largestValue = inputs[this.thread.z][startInputY][startInputX];
  let largestX = startInputX;
  let largestY = startInputY;

  for (let y = startInputY; y < endInputY; y++) {
    for (let x = startInputX; x < endInputX; x++) {
      const input = inputs[this.thread.z][y][x];
      if (input > largestValue) {
        largestValue = input;
        largestY = y;
        largestX = x;
      }
    }
  }
  setSwitchY(largestY);
  setSwitchX(largestX);
  return largestValue;
}

export interface ICompareConstants extends IConvolutionConstantsBase {
  inputWidth: number;
  inputHeight: number;

  outputWidth: number;
  outputHeight: number;
}

export function compare(
  this: IKernelFunctionThis<ICompareConstants>,
  deltas: number[][],
  switchX: number[][],
  switchY: number[][]
): number {
  const xCenter = this.thread.x + 0.5;
  const yCenter = this.thread.y + 0.5;
  const invStrideX = 1 / this.constants.strideX;
  const invStrideY = 1 / this.constants.strideY;

  const startSourceX = Math.max(
    0,
    Math.ceil(
      (xCenter - this.constants.filterWidth + this.constants.paddingX) *
        invStrideX
    )
  );
  const startSourceY = Math.max(
    0,
    Math.ceil(
      (yCenter - this.constants.filterHeight + this.constants.paddingY) *
        invStrideY
    )
  );
  const endSourceX = Math.min(
    Math.ceil((xCenter + this.constants.paddingX) * invStrideX),
    this.constants.outputWidth
  );
  const endSourceY = Math.min(
    Math.ceil((yCenter + this.constants.paddingY) * invStrideY),
    this.constants.outputHeight
  );

  let result = 0;
  for (let backY = startSourceY; backY < endSourceY; backY++) {
    for (let backX = startSourceX; backX < endSourceX; backX++) {
      const switchXValue = switchX[backY][backX];
      const switchYValue = switchY[backY][backX];
      if (
        Math.abs(switchXValue - this.thread.x) < 0.1 &&
        Math.abs(switchYValue - this.thread.y) < 0.1
      ) {
        result += deltas[backY][backX];
      }
    }
  }

  return result;
}

export function compare3D(
  this: IKernelFunctionThis<ICompareConstants>,
  deltas: number[][][],
  switchY: number[][][],
  switchX: number[][][]
): number {
  const xCenter = this.thread.x + 0.5;
  const yCenter = this.thread.y + 0.5;

  const invStrideX = 1 / this.constants.strideX;
  const invStrideY = 1 / this.constants.strideY;

  const startSourceX = Math.max(
    0,
    Math.ceil(
      (xCenter - this.constants.filterWidth + this.constants.paddingX) *
        invStrideX
    )
  );
  const startSourceY = Math.max(
    0,
    Math.ceil(
      (yCenter - this.constants.filterHeight + this.constants.paddingY) *
        invStrideY
    )
  );
  const endSourceX = Math.min(
    Math.ceil((xCenter + this.constants.paddingX) * invStrideX),
    this.constants.inputWidth
  );
  const endSourceY = Math.min(
    Math.ceil((yCenter + this.constants.paddingY) * invStrideY),
    this.constants.inputHeight
  );

  let result = 0;

  for (let backY = startSourceY; backY < endSourceY; backY++) {
    for (let backX = startSourceX; backX < endSourceX; backX++) {
      const switchXValue = switchX[this.thread.z][backY][backX];
      const switchYValue = switchY[this.thread.z][backY][backX];
      if (
        Math.abs(switchXValue - this.thread.x) < 0.1 &&
        Math.abs(switchYValue - this.thread.y) < 0.1
      ) {
        result += deltas[this.thread.z][backY][backX];
      }
    }
  }

  return result;
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
    // Using floor prefers to pad less (or use negative padding) on the right
    // using ceil prefers to pad more
    return Math.ceil(
      (this.inputLayer.width + this.paddingX * 2 - this.filterWidth) /
        this.strideX +
        1
    );
  }

  get height(): number {
    // Using floor prefers to pad less (or use negative padding) on the bottom
    // using ceil prefers to pad more
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

  predictKernelMap: IKernelMapRunShortcut<ISubKernelObject> | null = null;
  constructor(settings: IPoolSettings, inputLayer: ILayer) {
    super(settings, inputLayer);
    this.settings = {
      ...settings,
      ...getStride(settings, defaults),
      ...getPadding(settings, defaults),
    };

    this.weights = randos3D(this.width, this.height, this.depth);
    this.deltas = zeros3D(this.width, this.height, this.depth);
    this.validate();
  }

  setupKernels(): void {
    this.predictKernelMap = makeKernelMap(
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
          strideX: this.strideX,
          strideY: this.strideY,
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
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        outputWidth: this.width,
        outputHeight: this.height,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        strideX: this.strideX,
        strideY: this.strideY,
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
