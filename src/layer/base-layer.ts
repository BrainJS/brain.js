import {
  IKernelRunShortcut,
  Input,
  Kernel,
  KernelOutput,
  Texture,
  TextureArrayOutput,
} from 'gpu.js';
import { IPraxis, IPraxisSettings } from '../praxis/base-praxis';
import { clear, release } from '../utilities/kernel';

export interface ILayerJSON {
  width?: number;
  height?: number;
  depth?: number;
  weights?: number[] | number[][] | number[][][] | null;
  type: string;
  inputLayerIndex?: number;
  inputLayer1Index?: number;
  inputLayer2Index?: number;
  praxisOpts?: Partial<IPraxisSettings> | null;
}

export interface ILayer {
  width: number;
  height: number;
  depth: number;
  weights: KernelOutput | Input;
  deltas: KernelOutput;
  praxis: IPraxis | null;
  errors?: KernelOutput | null;
  setupKernels: (training?: boolean) => void;
  predictKernel: IKernelRunShortcut | null;
  compareKernel: IKernelRunShortcut | null;
  settings: Partial<ILayerSettings>;
  reuseKernels: (layer: ILayer) => void;
  predict: (inputs?: KernelOutput) => void;
  compare: (targetValues?: KernelOutput) => void;
  learn: ((learningRate?: number) => void) | ((learningRate: number) => void);
  toJSON: () => Partial<ILayerJSON>;
  inputLayer?: ILayer;
  inputLayer1?: ILayer;
  inputLayer2?: ILayer;
  index?: number;
  id?: string;
}

export interface ILayerSettings {
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  weights?: KernelOutput | null;
  deltas?: KernelOutput | null;
  id?: string;
  praxis?: IPraxis | null;
  praxisOpts?: Partial<IPraxisSettings> | null;
  initPraxis?:
    | ((layerTemplate: ILayer, settings?: IPraxisSettings) => IPraxis)
    | null;
  cleanupDeltas?: boolean;
}

export const baseLayerDefaultSettings: ILayerSettings = {
  width: 1,
  height: 1,
  depth: null,
  weights: null,
  deltas: null,
  praxis: null,
  praxisOpts: null,
  cleanupDeltas: true,
};

export type BaseLayerType = new (settings?: Partial<ILayerSettings>) => ILayer;

export class BaseLayer implements ILayer {
  praxis: IPraxis | null = null;
  predictKernel: IKernelRunShortcut | null = null;
  compareKernel: IKernelRunShortcut | null = null;
  settings: Partial<ILayerSettings>;

  get width(): number {
    return this.settings.width ?? 0;
  }

  get height(): number {
    return this.settings.height ?? 0;
  }

  get depth(): number {
    return this.settings.depth ?? 0;
  }

  get weights(): KernelOutput | Input {
    return this.settings.weights as KernelOutput;
  }

  set weights(weights: KernelOutput | Input) {
    this.settings.weights = weights as KernelOutput;
    if (this.settings.cleanupDeltas && this.deltas) {
      clear(this.deltas);
    }
  }

  get deltas(): KernelOutput {
    return this.settings.deltas as KernelOutput;
  }

  set deltas(deltas: KernelOutput) {
    this.settings.deltas = deltas;
  }

  get id(): string {
    return this.settings.id ?? '';
  }

  set id(title: string) {
    this.settings.id = title;
  }

  constructor(settings?: Partial<ILayerSettings>) {
    if (settings) {
      this.settings = { ...baseLayerDefaultSettings, ...settings };
    } else {
      this.settings = { ...baseLayerDefaultSettings };
    }
    this.setupPraxis();
  }

  setupPraxis(): void {
    const { initPraxis, praxis, praxisOpts } = this.settings;
    if (!this.praxis) {
      if (initPraxis) {
        if (praxisOpts) {
          this.praxis = initPraxis(this, praxisOpts);
        } else {
          this.praxis = initPraxis(this);
        }
      } else if (praxis) {
        this.praxis = praxis;
      }
    }
  }

  /*
  get weights() {
    return this._weights;
  }

  set weights(value) {
    if (value) {
      if (value.dimensions) {
        if (value.dimensions[0] !== this.width) {
          throw new Error(`${this.constructor.name}.weights being set with improper value width`);
        }
        if (value.dimensions[1] !== this.height) {
          throw new Error(`${this.constructor.name}.weights being set with improper value height`);
        }
      } else {
        if (value[0].length !== this.width) {
          throw new Error(`${this.constructor.name}.weights being set with improper value width`);
        }
        if (value.length !== this.height) {
          throw new Error(`${this.constructor.name}.weights being set with improper value height`);
        }
      }
    }
    this._weights = value;
  }

  get deltas() {
    return this._deltas;
  }

  set deltas(value) {
    if (value) {
      if (value.dimensions) {
        if (value.dimensions[0] !== this.width) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
        }
        if (value.dimensions[1] !== this.height) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
        }
      } else {
        if (value[0].length !== this.width) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
        }
        if (value.length !== this.height) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
        }
      }
    }
    this._deltas = value;
  } */

  validate(): void {
    if (Number.isNaN(this.height)) {
      throw new Error(`${this.constructor.name} layer height is not a number`);
    }
    if (Number.isNaN(this.width)) {
      throw new Error(`${this.constructor.name} layer width is not a number`);
    }
    if (this.height < 1) {
      throw new Error(`${this.constructor.name} layer height is less than 1`);
    }
    if (this.width < 1) {
      throw new Error(`${this.constructor.name} layer width is less than 1`);
    }
  }

  setupKernels(isTraining?: boolean): void {}

  reuseKernels(layer: ILayer): void {
    if (layer.width !== this.width) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${layer.width} is not ${this.width}`
      );
    }
    if (layer.height !== this.height) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${layer.height} is not ${this.height}`
      );
    }
    if (layer.hasOwnProperty('predictKernel') && layer.predictKernel !== null) {
      if (!(layer.predictKernel as Kernel).immutable) {
        throw new Error(
          `${layer.constructor.name}.predictKernel is not reusable, set kernel.immutable = true`
        );
      }
      this.predictKernel = layer.predictKernel;
    }
    if (layer.hasOwnProperty('compareKernel') && layer.compareKernel !== null) {
      if (!(layer.compareKernel as Kernel).immutable) {
        throw new Error(
          `${layer.constructor.name}.compareKernel is not reusable, set kernel.immutable = true`
        );
      }
      this.compareKernel = layer.compareKernel;
    }
    this.praxis = layer.praxis;
  }

  predict(inputs?: KernelOutput): void {}

  compare(targetValues?: KernelOutput): void {}

  learn(learningRate?: number): void {}

  toArray(): TextureArrayOutput {
    return Array.isArray(this.weights)
      ? this.weights
      : (this.weights as Texture).toArray();
  }

  toJSON(): Partial<ILayerJSON> {
    return BaseLayer.toJSON(this);
  }

  static toJSON(layer: ILayer): Partial<ILayerJSON> {
    const { weights } = layer;
    return {
      width: layer.width,
      height: layer.height,
      depth: layer.depth,
      weights: toUntypedArray(
        (weights && weights instanceof Texture
          ? weights.toArray()
          : weights) as
          | Float32Array
          | Float32Array[]
          | Float32Array[][]
          | number[]
          | number[][]
          | number[][][]
          | null
      ),
      type: layer.constructor.name,
      praxisOpts: layer.praxis ? layer.praxis.toJSON() : null,
    };
  }
}

function toUntypedArray(
  weights:
    | Float32Array
    | Float32Array[]
    | Float32Array[][]
    | number[]
    | number[][]
    | number[][][]
    | null
): number[][][] | number[][] | number[] | null {
  if (weights === null) return null;
  if (Array.isArray(weights)) {
    if (typeof weights[0] === 'number') {
      return weights as number[];
    } else if (Array.isArray(weights[0]) && typeof weights[0][0] === 'number') {
      return weights as number[][];
    } else if (
      Array.isArray(weights[0][0]) &&
      typeof weights[0][0][0] === 'number'
    ) {
      return weights as number[][][];
    } else if (weights[0] instanceof Float32Array) {
      const matrix = weights as Float32Array[];
      return matrix.map((row: Float32Array) => {
        return Array.from(row);
      });
    } else if (weights[0][0] instanceof Float32Array) {
      const cube = weights as Float32Array[][];
      return cube.map((matrix: Float32Array[]): number[][] => {
        return matrix.map((row: Float32Array): number[] => {
          return Array.from(row);
        });
      });
    }
  } else if (weights) {
    return Array.from(weights);
  }
  throw new Error('unexpected value');
}
