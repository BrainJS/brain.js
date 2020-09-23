import { makeKernel } from '../utilities/kernel';
import { BasePraxis, IPraxisSettings } from './base-praxis';
import { ILayer } from '../layer/base-layer';
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

export interface IArthurDeviationBiasesSettings extends IPraxisSettings {
  learningRate?: number;
}

export const defaultSettings = {
  learningRate: 0.3,
};

export class ArthurDeviationBiases extends BasePraxis {
  settings: IArthurDeviationBiasesSettings;
  kernel: IKernelRunShortcut | null;
  constructor(layer: ILayer, settings?: IArthurDeviationBiasesSettings) {
    super(layer);
    this.settings = { ...settings, ...defaultSettings };
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
  layer: ILayer,
  settings?: Partial<IArthurDeviationBiasesSettings>
): ArthurDeviationBiases {
  return new ArthurDeviationBiases(layer, settings);
}
