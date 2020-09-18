import { BaseLayer, ILayer } from '../layer/base-layer';
import { IKernelRunShortcut, KernelOutput } from 'gpu.js';

export interface IPraxis {
  layerTemplate: ILayer | null;
  kernel: IKernelRunShortcut | null;
  width: number;
  height: number;
  depth: number;
  run: (layer: BaseLayer, learningRate: number) => KernelOutput;
}

export abstract class BasePraxis implements IPraxis {
  layerTemplate: ILayer;
  kernel: IKernelRunShortcut | null;

  get width(): number {
    return this.layerTemplate.width;
  }

  get height(): number {
    return this.layerTemplate.height;
  }

  get depth(): number {
    return this.layerTemplate.depth;
  }

  constructor(layerTemplate: ILayer) {
    this.layerTemplate = layerTemplate;
    this.kernel = null;
  }

  setupKernels(): void {}

  reuseKernels(praxis: BasePraxis): void {
    if (praxis.width !== this.width) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${praxis.width} is not ${this.width}`
      );
    }
    if (praxis.height !== this.height) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${praxis.height} is not ${this.height}`
      );
    }
    if (praxis.hasOwnProperty('kernel')) {
      this.kernel = praxis.kernel;
    }
  }

  abstract run(layer: BaseLayer, learningRate: number): KernelOutput;
}
