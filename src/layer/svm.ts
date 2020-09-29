import { KernelOutput } from 'gpu.js';

import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
import { clone, release } from '../utilities/kernel';

export class SVM extends BaseLayer {
  inputLayer: ILayer;
  constructor(inputLayer: ILayer, settings: ILayerSettings) {
    super(settings);
    this.inputLayer = inputLayer;
  }

  predict(): void {
    release(this.weights);
    this.weights = clone(this.inputLayer.weights as KernelOutput);
    this.validate();
  }

  learn(): void {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
  }
}

// function learn(target) {
//   if (y === i) {
//     continue;
//   }
//   const ydiff = -yscore + x.w[i] + margin;
//   if (ydiff > 0) {
//     // violating dimension, apply loss
//     x.dw[i] += 1;
//     x.dw[y] -= 1;
//     loss += ydiff;
//   }
// }

export function svm(inputLayer: ILayer, settings: ILayerSettings): SVM {
  return new SVM(inputLayer, settings);
}
