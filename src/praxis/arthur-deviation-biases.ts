import { makeKernel } from '../utilities/kernel';
import { BasePraxis } from './base-praxis';
import { BaseLayer, ILayer } from '../layer/base-layer';
import { IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';

export interface IUpdateThis extends IKernelFunctionThis {
  constants: {
    learningRate: number;
  };
}

export function update(
  this: IUpdateThis,
  weights: number[][],
  deltas: number[][]
): number {
  return (
    weights[this.thread.y][this.thread.x] +
    this.constants.learningRate * deltas[this.thread.y][this.thread.x]
  );
}

export interface IArthurDeviationBiasesSettings {
  learningRate: number;
}

export class ArthurDeviationBiases extends BasePraxis {
  static get defaults(): IArthurDeviationBiasesSettings {
    return {
      learningRate: 0.3,
    };
  }

  settings: IArthurDeviationBiasesSettings;
  kernel: IKernelRunShortcut | null;
  constructor(layer: BaseLayer, settings: IArthurDeviationBiasesSettings) {
    super(layer);
    this.settings = { ...settings };
    this.kernel = null;
  }

  run(layer: ILayer, learningRate: number): KernelOutput {
    return (this.kernel as IKernelRunShortcut)(layer.weights, layer.deltas);
  }

  setupKernels(): void {
    this.kernel = makeKernel(update, {
      output: [this.width, this.height],
      constants: {
        learningRate: this.settings.learningRate,
      },
    });
  }
}

export function arthurDeviationBiases(
  layer: BaseLayer,
  settings: IArthurDeviationBiasesSettings
): ArthurDeviationBiases {
  return new ArthurDeviationBiases(layer, settings);
}
