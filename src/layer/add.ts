import { makeKernel, release, clone, clear } from '../utilities/kernel';
import { checkSameSize } from '../utilities/layer-size';
import { Operator } from './operator';
import { IKernelFunctionThis, IKernelRunShortcut, Texture } from 'gpu.js';
import { ILayerSettings, ILayer } from './base-layer';

export function predict(
  this: IKernelFunctionThis,
  inputWeights1: number[][],
  inputWeights2: number[][]
): number {
  return (
    inputWeights1[this.thread.y][this.thread.x] +
    inputWeights2[this.thread.y][this.thread.x]
  );
}

export class Add extends Operator {
  validate(): void {
    super.validate();
    checkSameSize(this.inputLayer1, this.inputLayer2);
  }

  setupKernels(): void {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      immutable: true,
    });
  }

  predict(): void {
    release(this.weights);
    this.weights = (this.predictKernel as IKernelRunShortcut)(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    ) as Texture;
    clear(this.deltas);
  }

  compare(): void {
    // TODO: Do we need release and clone here?
    release(this.inputLayer1.deltas);
    release(this.inputLayer2.deltas);
    this.inputLayer1.deltas = clone(this.deltas);
    this.inputLayer2.deltas = clone(this.deltas);
  }

  /**
   * @abstract
   */
  learn(): void {}
}

export function add(
  inputLayer1: ILayer,
  inputLayer2: ILayer,
  settings: ILayerSettings
): Add {
  return new Add(inputLayer1, inputLayer2, settings);
}
