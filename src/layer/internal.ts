import { BaseLayer, ILayer, ILayerJSON, ILayerSettings } from './base-layer';
import { IKernelRunShortcut, Input, KernelOutput } from 'gpu.js';
import { IPraxis } from '../praxis/base-praxis';

export abstract class Internal implements ILayer {
  abstract settings: ILayerSettings;
  abstract predict(inputs?: KernelOutput): void;
  abstract compare(targetValues?: KernelOutput): void;
  abstract learn(learningRate?: number): void;
  abstract setupKernels(training?: boolean): void;
  predictKernel: IKernelRunShortcut | null = null;
  compareKernel: IKernelRunShortcut | null = null;
  praxis: IPraxis | null = null;

  get width(): number {
    return this.settings.width as number;
  }

  get height(): number {
    return this.settings.height as number;
  }

  get depth(): number {
    return this.settings.depth as number;
  }

  get weights(): KernelOutput | Input {
    return this.settings.weights as KernelOutput;
  }

  set weights(weights: KernelOutput | Input) {
    this.settings.weights = weights as KernelOutput;
  }

  get deltas(): KernelOutput {
    return this.settings.deltas as KernelOutput;
  }

  set deltas(deltas: KernelOutput) {
    this.settings.deltas = deltas;
  }

  toJSON(): Partial<ILayerJSON> {
    return BaseLayer.toJSON(this);
  }

  abstract reuseKernels(layer: ILayer): void;
}
