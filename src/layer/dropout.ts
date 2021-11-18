import { Filter, IFilterSettings } from './filter';
import { makeKernel, makeKernelMap, release } from '../utilities/kernel';
import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelMapRunShortcut,
  IKernelRunShortcut,
  ISubKernelObject,
  KernelOutput,
} from 'gpu.js';
import { ILayer, ILayerSettings, baseLayerDefaultSettings } from './base-layer';

export function setDropout(dropout: number): number {
  return dropout;
}

export interface IDropoutConstants extends IConstantsThis {
  probability: number;
}

export function trainingPredict(
  this: IKernelFunctionThis<IDropoutConstants>,
  inputs: number[][]
): number {
  if (setDropout(Math.random()) < this.constants.probability) {
    return 0;
  }
  return inputs[this.thread.y][this.thread.x];
}

export function predict(
  this: IKernelFunctionThis<IDropoutConstants>,
  inputs: number[][]
): number {
  return inputs[this.thread.y][this.thread.x] * this.constants.probability;
}

export function compare(
  this: IKernelFunctionThis,
  dropouts: number[][],
  deltas: number[][]
): number {
  if (dropouts[this.thread.y][this.thread.x] === 0) {
    return 0;
  }
  return deltas[this.thread.y][this.thread.x];
}

export interface IDropoutSettings extends ILayerSettings {
  probability: number;
}

export const dropoutDefaults: IDropoutSettings = {
  ...baseLayerDefaultSettings,
  probability: 0.5,
};

export class Dropout extends Filter {
  dropouts: KernelOutput | null;
  predictKernelMap: IKernelMapRunShortcut<ISubKernelObject> | null = null;
  settings: Partial<IDropoutSettings>;
  constructor(
    inputLayer: ILayer,
    settings?: Partial<IDropoutSettings> & Partial<IFilterSettings>
  ) {
    super(settings as Partial<IFilterSettings>, inputLayer);
    this.settings = { ...dropoutDefaults, ...settings };
    this.dropouts = null;
    this.validate();
  }

  setupKernels(isTraining?: boolean): void {
    const output = [this.width, this.height];

    if (isTraining) {
      this.predictKernelMap = makeKernelMap<
        Parameters<typeof trainingPredict>,
        IDropoutConstants
      >({ dropouts: setDropout }, trainingPredict, {
        output,
        immutable: true,
      });
      this.compareKernel = makeKernel(compare, { output, immutable: true });
    } else {
      this.predictKernelMap = makeKernelMap<
        Parameters<typeof predict>,
        IDropoutConstants
      >({}, predict, { output, immutable: true });
    }
  }

  predict(): void {
    release(this.weights);
    if (this.dropouts) {
      release(this.dropouts);
    }
    const { result, dropouts } = (this
      .predictKernelMap as IKernelMapRunShortcut<ISubKernelObject>)(
      this.inputLayer.weights
    );
    this.weights = result;
    this.dropouts = dropouts;
  }

  compare(): void {
    release(this.deltas);
    this.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.dropouts as KernelOutput,
      this.inputLayer.deltas
    );
  }
}

export function dropout(
  inputLayer: ILayer,
  settings?: Partial<IDropoutSettings>
): Dropout {
  return new Dropout(inputLayer, settings);
}
