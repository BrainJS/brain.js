import { makeKernelMap } from '../utilities/kernel';
import { zeros2D } from '../utilities/zeros-2d';
import { BasePraxis, IPraxisSettings } from './base-praxis';
import { ILayer } from '../layer/base-layer';
import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelMapRunShortcut,
  ISubKernelObject,
  ISubKernelsResults,
  KernelOutput,
} from 'gpu.js';

export function updateChange(value: number): number {
  return value;
}

export interface IUpdateConstants extends IConstantsThis {
  learningRate: number;
  momentum: number;
}

export function update(
  this: IKernelFunctionThis<IUpdateConstants>,
  changes: number[][],
  weights: number[][],
  incomingWeights: number[][],
  inputDeltas: number[][]
): number {
  const lastChange: number = changes[this.thread.y][this.thread.x];
  const inputDelta: number = inputDeltas[this.thread.y][0];
  const weight: number = weights[this.thread.y][this.thread.x];
  const incoming: number = incomingWeights[this.thread.x][0];

  const change =
    this.constants.learningRate * inputDelta * incoming +
    this.constants.momentum * lastChange;
  updateChange(change);
  return weight + change;
}

export interface IArthurDeviationWeightsSettings extends IPraxisSettings {
  learningRate?: number;
  momentum?: number;
  weightsLayer?: ILayer | null;
  incomingLayer?: ILayer | null;
  deltaLayer?: ILayer | null;
}

export interface IKernelMapResults extends ISubKernelsResults {
  changes: KernelOutput;
}

export const defaultSettings: IArthurDeviationWeightsSettings = {
  learningRate: 0.3,
  momentum: 0.1,
  weightsLayer: null,
  incomingLayer: null,
  deltaLayer: null,
};

export class ArthurDeviationWeights extends BasePraxis {
  changes: KernelOutput;
  kernelMap: IKernelMapRunShortcut<ISubKernelObject> | null = null;
  settings: IArthurDeviationWeightsSettings;
  get learningRate(): number {
    return this.settings.learningRate as number;
  }

  get momentum(): number {
    return this.settings.momentum as number;
  }

  get weightsLayer(): ILayer {
    return this.settings.weightsLayer as ILayer;
  }

  set weightsLayer(layer: ILayer) {
    this.settings.weightsLayer = layer;
  }

  get deltaLayer(): ILayer {
    return this.settings.deltaLayer as ILayer;
  }

  set deltaLayer(layer: ILayer) {
    this.settings.deltaLayer = layer;
  }

  get incomingLayer(): ILayer {
    return this.settings.incomingLayer as ILayer;
  }

  set incomingLayer(layer: ILayer) {
    this.settings.incomingLayer = layer;
  }

  constructor(layer: ILayer, settings?: IArthurDeviationWeightsSettings) {
    super(layer);
    this.settings = { ...defaultSettings, ...settings };
    this.changes = zeros2D(layer.width, layer.height);
  }

  run(): KernelOutput {
    const output = (this.kernelMap as IKernelMapRunShortcut<IKernelMapResults>)(
      this.changes,
      this.weightsLayer.weights,
      this.incomingLayer.weights,
      this.deltaLayer.deltas
    );
    this.changes = output.changes;
    return output.result;
  }

  setupKernels(): void {
    this.kernelMap = makeKernelMap<Parameters<typeof update>, IUpdateConstants>(
      {
        changes: updateChange,
      },
      update,
      {
        output: [this.width, this.height],
        constants: {
          learningRate: this.learningRate,
          momentum: this.momentum,
        },
      }
    );
  }
}

export function arthurDeviationWeights(
  layer: ILayer,
  settings?: Partial<IArthurDeviationWeightsSettings>
): ArthurDeviationWeights {
  return new ArthurDeviationWeights(layer, settings);
}
