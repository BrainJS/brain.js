import { makeKernel, release } from '../utilities/kernel';
import { Operator } from './operator';
import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelRunShortcut,
  Texture,
} from 'gpu.js';
import { ILayer, ILayerJSON, ILayerSettings } from './base-layer';

export interface IMultiplyConstants extends IConstantsThis {
  size: number;
}

export function predict(
  this: IKernelFunctionThis<IMultiplyConstants>,
  weights1: number[][],
  weights2: number[][]
): number {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += weights1[this.thread.y][i] * weights2[i][this.thread.x];
  }
  return sum;
}

export function compareFromX(
  this: IKernelFunctionThis<IMultiplyConstants>,
  deltas: number[][],
  inputDeltas: number[][],
  inputWeights: number[][]
): number {
  let sum = inputDeltas[this.thread.y][this.thread.x];
  for (let i = 0; i < this.constants.size; i++) {
    sum += deltas[this.thread.y][i] * inputWeights[this.thread.x][i];
  }
  return sum;
}

export function compareFromY(
  this: IKernelFunctionThis<IMultiplyConstants>,
  deltas: number[][],
  inputDeltas: number[][],
  inputWeights: number[][]
): number {
  let sum = inputDeltas[this.thread.y][this.thread.x];
  for (let i = 0; i < this.constants.size; i++) {
    sum += deltas[i][this.thread.x] * inputWeights[i][this.thread.y];
  }
  return sum;
}

export class Multiply extends Operator {
  compareKernel1: IKernelRunShortcut | null = null;
  compareKernel2: IKernelRunShortcut | null = null;

  get width(): number {
    return this.inputLayer2.width;
  }

  set width(width: number) {
    throw new Error('Cannot set width on Multiply');
  }

  get height(): number {
    return this.inputLayer1.height;
  }

  set height(height: number) {
    throw new Error('Cannot set height on Multiply');
  }

  get depth(): number {
    return this.inputLayer1.depth;
  }

  set depth(depth: number) {
    throw new Error('Cannot set depth on Multiply');
  }

  validate(): void {
    super.validate();
    if (this.inputLayer1.width !== this.inputLayer2.height) {
      throw new Error(
        `Layer width mismatch of ${this.inputLayer1.width} and ${this.inputLayer2.height}`
      );
    }
  }

  setupKernels(): void {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        size: this.inputLayer2.height,
      },
      immutable: true,
    });
    this.compareKernel1 = makeKernel(compareFromX, {
      output: [this.inputLayer1.width, this.inputLayer1.height],
      constants: {
        size: this.inputLayer2.width,
      },
      immutable: true,
    });
    this.compareKernel2 = makeKernel(compareFromY, {
      output: [this.inputLayer2.width, this.inputLayer2.height],
      constants: {
        size: this.inputLayer1.height,
      },
      immutable: true,
    });
  }

  reuseKernels(layer: ILayer): void {
    super.reuseKernels(layer);
    this.compareKernel1 = (layer as Multiply).compareKernel1;
    this.compareKernel2 = (layer as Multiply).compareKernel2;
  }

  predict(): void {
    release(this.weights);
    if (!this.predictKernel) throw new Error('this.predictKernel is not set');
    this.weights = this.predictKernel(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    ) as Texture;
  }

  compare(): void {
    if (!this.compareKernel1) throw new Error('this.compareKernel1 not set');
    if (!this.compareKernel2) throw new Error('this.compareKernel2 not set');

    const inputLayer1Deltas = this.inputLayer1.deltas;
    const inputLayer2Deltas = this.inputLayer2.deltas;

    const newDeltas1 = this.compareKernel1(
      this.deltas,
      this.inputLayer1.deltas,
      this.inputLayer2.weights
    );
    const newDeltas2 = this.compareKernel2(
      this.deltas,
      this.inputLayer2.deltas,
      this.inputLayer1.weights
    );

    this.inputLayer2.deltas = newDeltas2 as Texture;
    this.inputLayer1.deltas = newDeltas1 as Texture;

    release(inputLayer1Deltas);
    release(inputLayer2Deltas);
  }

  setupPraxis(): void {}

  toJSON(): Partial<ILayerJSON> {
    return {
      ...super.toJSON(),
      width: this.width,
      height: this.height,
    };
  }
}

export function multiply(
  inputLayer1: ILayer,
  inputLayer2: ILayer,
  settings?: ILayerSettings
): Multiply {
  return new Multiply(inputLayer1, inputLayer2, settings);
}
