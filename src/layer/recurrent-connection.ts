import { KernelOutput } from 'gpu.js';

import { Internal } from './internal';
import { release } from '../utilities/kernel';
import { ILayer, ILayerSettings } from './base-layer';

export class RecurrentConnection extends Internal {
  settings: ILayerSettings = {};
  layer: ILayer | null = null;
  setLayer(layer: ILayer): void {
    this.layer = layer;
  }

  get width(): number {
    if (!this.layer) throw new Error('layer not set');
    return this.layer.width;
  }

  set width(value: number) {
    throw new Error(`${this.constructor.name}-width is not yet implemented`);
  }

  get height(): number {
    if (!this.layer) throw new Error('layer not set');
    return this.layer.height;
  }

  set height(value: number) {
    throw new Error(`${this.constructor.name}-height is not yet implemented`);
  }

  get deltas(): KernelOutput {
    if (!this.layer) throw new Error('layer not set');
    return this.layer.deltas;
  }

  set deltas(deltas: KernelOutput) {
    if (!this.layer) throw new Error('layer not set');
    release(this.layer.deltas);
    this.layer.deltas = deltas;
  }

  get weights(): KernelOutput {
    if (!this.layer) throw new Error('layer not set');
    return this.layer.weights as KernelOutput;
  }

  set weights(weights: KernelOutput) {
    if (!this.layer) throw new Error('layer not set');
    release(this.layer.weights);
    this.layer.weights = weights;
  }

  predict(): void {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare(): void {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn(): void {
    throw new Error('no longer using');
  }

  setupKernels(): void {
    // throw new Error(
    //   `${this.constructor.name}-setupKernels is not yet implemented`
    // )
  }

  reuseKernels(): void {
    // throw new Error(
    //   `${this.constructor.name}-reuseKernels is not yet implemented`
    // )
  }
}
