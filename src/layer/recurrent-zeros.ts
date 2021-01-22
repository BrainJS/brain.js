import { IPraxis } from '../praxis/base-praxis';
import { clear, release } from '../utilities/kernel';
import { zeros2D } from '../utilities/zeros-2d';
import { ILayerSettings } from './base-layer';
import { Internal } from './internal';
import { IRecurrentInput } from './recurrent-input';

export class RecurrentZeros extends Internal implements IRecurrentInput {
  praxis: IPraxis | null = null;
  settings: Partial<ILayerSettings> = {};
  predictKernel = null;
  compareKernel = null;
  setDimensions(width: number, height: number): void {
    this.praxis = null;
    this.settings = {
      ...this.settings,
      width,
      height,
      weights: zeros2D(width, height),
      deltas: zeros2D(width, height),
    };
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

  predict(): void {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare(): void {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn(learningRate: number): void {
    const { weights: oldWeights } = this;
    this.weights = (this.praxis as IPraxis).run(this, learningRate);
    // this.deltas = deltas;
    release(oldWeights);
    clear(this.deltas);
  }

  // validate(): void {
  //   throw new Error(`${this.constructor.name}-validate is not yet implemented`);
  // }

  // reset(): void {
  //   throw new Error(`${this.constructor.name}-reset is not yet implemented`);
  // }
}

export function recurrentZeros(): RecurrentZeros {
  return new RecurrentZeros();
}
