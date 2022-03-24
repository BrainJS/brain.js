import { IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';
import { EntryPoint } from './types';
import { ILayer, ILayerSettings } from './base-layer';
import { zeros2D } from '../utilities/zeros-2d';
import { makeKernel, release, kernelInput, clone } from '../utilities/kernel';

export const defaults: ILayerSettings = {
  weights: null,
};

export class Input extends EntryPoint {
  reshapeInput: IKernelRunShortcut | null = null;
  constructor(settings: ILayerSettings) {
    super({ ...defaults, ...settings });
    this.validate();
    this.reshapeInput = null;
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels(): void {
    if (this.width === 1) {
      this.predict = this.predict1D;
      this.reshapeInput = makeKernel(
        function (this: IKernelFunctionThis, value: number[]) {
          return value[this.thread.y];
        },
        {
          output: [1, this.height],
          immutable: true,
        }
      );
    }
  }

  reuseKernels(layer: ILayer): void {
    // super.reuseKernels(layer);
    this.reshapeInput = (layer as Input).reshapeInput;
  }

  predict(inputs: KernelOutput): void {
    if (
      (Array.isArray(inputs) || inputs instanceof Float32Array) &&
      typeof inputs[0] === 'number' &&
      inputs.length === this.height * this.width
    ) {
      release(this.weights);
      this.weights = kernelInput(inputs as number[], [this.width, this.height]);
    } else if (
      Array.isArray(inputs) &&
      inputs.length === this.height &&
      (Array.isArray(inputs[0]) || inputs[0] instanceof Float32Array) &&
      inputs[0].length === this.width
    ) {
      this.weights = clone(inputs);
    } else {
      throw new Error('Inputs are not of sized correctly');
    }
  }

  predict1D(inputs: KernelOutput): void {
    if (this.weights) release(this.weights);
    if (this.reshapeInput) {
      this.weights = this.reshapeInput(inputs);
    } else {
      this.weights = inputs;
    }
  }

  compare(): void {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn(): void {}
}

export function input(settings: ILayerSettings): Input {
  return new Input(settings);
}
