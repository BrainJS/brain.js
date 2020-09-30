import { makeKernel } from '../utilities/kernel';
import { Modifier } from './types';
import { IKernelFunctionThis, IKernelRunShortcut } from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';

export function predict(
  this: IKernelFunctionThis,
  weights: number[][]
): number {
  return -weights[this.thread.y][this.thread.x];
}

export class Negative extends Modifier {
  inputLayer: ILayer;
  constructor(inputLayer: ILayer, settings?: ILayerSettings) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
  }

  setupKernels(): void {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    });
  }

  predict(): void {
    this.weights = (this.predictKernel as IKernelRunShortcut)(
      this.inputLayer.weights
    );
  }
}

export function negative(
  inputLayer: ILayer,
  settings?: ILayerSettings
): Negative {
  return new Negative(inputLayer, settings);
}
