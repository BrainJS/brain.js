import { IKernelFunctionThis, KernelOutput } from 'gpu.js';

import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
import { clone, release } from '../utilities/kernel';

export class Regression extends BaseLayer {
  inputLayer: ILayer;
  constructor(settings: ILayerSettings, inputLayer: ILayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
  }

  predict(): void {
    release(this.weights);
    this.weights = clone(this.inputLayer.weights as KernelOutput);
  }

  learn(): void {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
  }
}

// TODO: Connect up
export function learn(
  this: IKernelFunctionThis,
  inputs: number[],
  targets: number[]
): number {
  return inputs[this.thread.x] - targets[this.thread.x];
}

// TODO: handle `loss += 0.5*dy*dy;` total and sum in learn
export function regression(
  settings: ILayerSettings,
  inputLayer: ILayer
): Regression {
  return new Regression(settings, inputLayer);
}
