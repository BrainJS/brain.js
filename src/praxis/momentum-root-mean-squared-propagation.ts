import { BasePraxis, ILayerTemplate, IPraxisSettings } from './base-praxis';

import { makeKernelMap, release } from '../utilities/kernel';
import { zeros2D } from '../utilities/zeros-2d';
import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelMapRunShortcut,
  ISubKernelObject,
  KernelOutput,
} from 'gpu.js';
import { ILayer } from '../layer/base-layer';

export function getMomentum(
  delta: number,
  decay: number,
  previousMomentum: number
): number {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

export function clipByValue(value: number, max: number, min: number): number {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
}

interface IUpdate extends IConstantsThis {
  clipValue: number;
  decayRate: number;
  smoothEps: number;
  regularizationStrength: number;
}
/**
 * @description Momentum Root Mean Square Propagation Function
 */
export function update(
  this: IKernelFunctionThis<IUpdate>,
  weights: number[][],
  deltas: number[][],
  previousMomenta: number[][]
): number {
  const delta = deltas[this.thread.y][this.thread.x];
  const clippedDelta = clipByValue(
    delta,
    this.constants.clipValue,
    -this.constants.clipValue
  );
  const weight = weights[this.thread.y][this.thread.x];
  const previousMomentum = previousMomenta[this.thread.y][this.thread.x];
  const momentum = getMomentum(
    delta,
    this.constants.decayRate,
    previousMomentum
  );
  return (
    weight +
    (-this.constants.learningRate * clippedDelta) /
      Math.sqrt(momentum + this.constants.smoothEps) -
    this.constants.regularizationStrength * weight
  );
}

export function isClippedByValue(
  value: number,
  max: number,
  min: number
): number {
  if (value > max) {
    return 1;
  }
  if (value < min) {
    return 1;
  }
  return 0;
}

export interface IMomentumRootMeanSquaredPropagationSettings
  extends IPraxisSettings {
  decayRate?: number;
  regularizationStrength?: number;
  learningRate?: number;
  smoothEps: number;
  clipValue: number;
}

export const defaults: IMomentumRootMeanSquaredPropagationSettings = {
  decayRate: 0.999,
  regularizationStrength: 0.0001,
  learningRate: 0.01,
  smoothEps: 1e-8,
  clipValue: 5,
};

export class MomentumRootMeanSquaredPropagation extends BasePraxis {
  momenta: KernelOutput;
  kernelMap: IKernelMapRunShortcut<ISubKernelObject> | null = null;
  settings: Partial<IMomentumRootMeanSquaredPropagationSettings>;

  get clipValue(): number {
    return this.settings.clipValue as number;
  }

  get decayRate(): number {
    return this.settings.decayRate as number;
  }

  get learningRate(): number {
    return this.settings.learningRate as number;
  }

  get regularizationStrength(): number {
    return this.settings.regularizationStrength as number;
  }

  get smoothEps(): number {
    return this.settings.smoothEps as number;
  }

  constructor(
    layerTemplate: ILayerTemplate,
    settings: Partial<IMomentumRootMeanSquaredPropagationSettings> = {}
  ) {
    super(layerTemplate);
    this.settings = { ...defaults, ...settings };
    this.momenta = zeros2D(layerTemplate.width, layerTemplate.height);
  }

  run(layer: ILayer): KernelOutput {
    const { momenta, result } = (this.kernelMap as IKernelMapRunShortcut<
      ISubKernelObject
    >)(layer.weights, layer.deltas, this.momenta);
    release(this.momenta);
    this.momenta = momenta;
    return result;
  }

  setupKernels(): void {
    this.kernelMap = makeKernelMap(
      {
        momenta: getMomentum,
      },
      update,
      {
        output: [this.width, this.height],
        constants: {
          clipValue: this.clipValue,
          decayRate: this.decayRate,
          learningRate: this.learningRate,
          regularizationStrength: this.regularizationStrength,
          smoothEps: this.smoothEps,
        },
        functions: [clipByValue],
        immutable: true,
      }
    );
  }
}

export function momentumRootMeanSquaredPropagation(
  layer: ILayer,
  settings: Partial<IMomentumRootMeanSquaredPropagationSettings>
): MomentumRootMeanSquaredPropagation {
  return new MomentumRootMeanSquaredPropagation(layer, settings);
}

/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 */
export const MRmsProp = MomentumRootMeanSquaredPropagation;
export const mRmsProp = momentumRootMeanSquaredPropagation;
