import { ILayerSettings } from './base-layer';
import { Input, KernelOutput } from 'gpu.js';

export abstract class Internal {
  abstract settings: ILayerSettings;
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
}
