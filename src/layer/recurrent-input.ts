import { Internal } from './internal';
import { BaseLayer, ILayer } from './base-layer';
import { release } from '../utilities/kernel';
import { KernelOutput } from 'gpu.js';
import { IPraxis } from '../praxis/base-praxis';

export class RecurrentInput extends Internal implements ILayer {
  recurrentInput: ILayer;
  praxis: IPraxis | null = null;
  predictKernel: any = null;
  compareKernel: any = null;
  settings = {};
  constructor(recurrentInput: ILayer) {
    super();
    this.recurrentInput = recurrentInput;
    this.validate();
  }

  get width(): number {
    return this.recurrentInput.width;
  }

  get height(): number {
    return this.recurrentInput.height;
  }

  get depth(): number {
    return this.recurrentInput.depth;
  }

  get deltas(): KernelOutput {
    return this.recurrentInput.deltas;
  }

  set deltas(deltas: KernelOutput) {
    const recurrentInputDeltas = this.recurrentInput.deltas;
    this.recurrentInput.deltas = deltas;
    release(recurrentInputDeltas);
  }

  get weights(): KernelOutput {
    return this.recurrentInput.weights as KernelOutput;
  }

  set weights(weights: KernelOutput) {
    const recurrentInputWeights = this.recurrentInput.weights;
    this.recurrentInput.weights = weights;
    release(recurrentInputWeights);
  }

  validate(): void {
    BaseLayer.prototype.validate.call(this);
    if (this.width !== this.recurrentInput.width) {
      throw new Error(
        `${this.constructor.name} layer width ${this.width} and ${this.recurrentInput.constructor.name} width (${this.recurrentInput.width}) are not same`
      );
    }

    if (this.height !== this.recurrentInput.height) {
      throw new Error(
        `${this.constructor.name} layer height ${this.height} and ${this.recurrentInput.constructor.name} width (${this.recurrentInput.height}) are not same`
      );
    }
  }

  setDimensions(width: number, height: number): void {
    this.recurrentInput.width = width;
    this.recurrentInput.height = height;
  }

  predict(): void {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare(): void {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn(): void {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
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
