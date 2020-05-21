import { makeKernel, release, clone, clear } from '../utilities/kernel';
import zeros2D from '../utilities/zeros-2d';
import { checkSameSize } from '../utilities/layer-size';
import { Operator } from './types';

export function predict(this: any, inputWeights1: { [x: string]: { [x: string]: any; }; }, inputWeights2: { [x: string]: { [x: string]: any; }; }) {
  return (
    inputWeights1[this.thread.y][this.thread.x] +
    inputWeights2[this.thread.y][this.thread.x]
  );
}

export class Add extends Operator {
  inputLayer1: any;
  inputLayer2: any;
  constructor(inputLayer1: any, inputLayer2: any, settings: any) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.width = this.inputLayer1.width;
    this.height = this.inputLayer1.height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
    this.setupPraxis(settings);
  }

  validate() {
    super.validate();
    checkSameSize(this.inputLayer1, this.inputLayer2);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      immutable: true,
    });
  }

  predict() {
    release(this.weights);
    this.weights = this.predictKernel(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    );
    clear(this.deltas);
  }

  compare() {
    // TODO: Do we need release and clone here?
    release(this.inputLayer1.deltas);
    release(this.inputLayer2.deltas);
    this.inputLayer1.deltas = clone(this.deltas);
    this.inputLayer2.deltas = clone(this.deltas);
  }

  /**
   * @abstract
   */
  learn() {}
}

export function add(inputLayer1: any, inputLayer2: any, settings?: any) {
  return new Add(inputLayer1, inputLayer2, settings);
}

