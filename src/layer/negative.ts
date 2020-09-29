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
  constructor(settings: ILayerSettings, inputLayer: ILayer) {
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
  settings: ILayerSettings,
  inputLayer: ILayer
): Negative {
  return new Negative(settings, inputLayer);
}
