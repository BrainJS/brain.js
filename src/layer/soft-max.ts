import {
  IConstantsThis,
  IKernelFunctionThis,
  IKernelRunShortcut,
  KernelOutput,
  Texture,
} from 'gpu.js';

import { makeKernel, release, clone } from '../utilities/kernel';
import { randos, randos2D, randos3D } from '../utilities/randos';
import { zeros } from '../utilities/zeros';
import { zeros2D } from '../utilities/zeros-2d';
import { zeros3D } from '../utilities/zeros-3d';
import { ILayer, ILayerSettings } from './base-layer';
import { Modifier } from './modifier';

interface ISoftMaxConstants extends IConstantsThis {
  inputWidth: number;
}

export function getMaxValue(
  this: IKernelFunctionThis<ISoftMaxConstants>,
  inputs: number[]
): number {
  let maxInput = -Infinity;
  for (let x = 0; x < this.constants.inputWidth; x++) {
    const input = inputs[x];
    if (input > maxInput) {
      maxInput = input;
    }
  }
  return maxInput;
}

export function getMaxValue2D(
  this: IKernelFunctionThis<ISoftMaxConstants>,
  inputs: number[][]
): number {
  let maxInput = -Infinity;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      const input = inputs[y][x];
      if (input > maxInput) {
        maxInput = input;
      }
    }
  }
  return maxInput;
}

export function getMaxValue3D(
  this: IKernelFunctionThis<ISoftMaxConstants>,
  inputs: number[][][]
): number {
  let maxInput = -Infinity;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        const input = inputs[z][y][x];
        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }
  return maxInput;
}

export function getSum(
  this: IKernelFunctionThis<ISoftMaxConstants>,
  inputs: number[]
): number {
  let sum = 0;
  for (let x = 0; x < this.constants.inputWidth; x++) {
    sum += inputs[x];
  }
  return sum;
}

export function getSum2D(
  this: IKernelFunctionThis<ISoftMaxConstants>,
  inputs: number[][]
): number {
  let sum = 0;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      sum += inputs[y][x];
    }
  }
  return sum;
}

export function getSum3D(
  this: IKernelFunctionThis<ISoftMaxConstants>,
  inputs: number[][][]
): number {
  let sum = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x];
      }
    }
  }
  return sum;
}

export function getExponentials(
  this: IKernelFunctionThis,
  inputs: number[],
  maxInput: number[]
): number {
  return Math.exp(inputs[this.thread.x] - maxInput[0]);
}

export function getExponentials2D(
  this: IKernelFunctionThis,
  inputs: number[][],
  maxInput: number[]
): number {
  return Math.exp(inputs[this.thread.y][this.thread.x] - maxInput[0]);
}

export function getExponentials3D(
  this: IKernelFunctionThis,
  inputs: number[][][],
  maxInput: number[]
): number {
  return Math.exp(
    inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]
  );
}

export function predict(
  this: IKernelFunctionThis,
  exponentials: number[],
  exponentialsSum: number[]
): number {
  return exponentials[this.thread.x] / exponentialsSum[0];
}

export function predict2D(
  this: IKernelFunctionThis,
  exponentials: number[][],
  exponentialsSum: number[]
): number {
  return exponentials[this.thread.y][this.thread.x] / exponentialsSum[0];
}

export function predict3D(
  this: IKernelFunctionThis,
  exponentials: number[][][],
  exponentialsSum: number[]
): number {
  return (
    exponentials[this.thread.z][this.thread.y][this.thread.x] /
    exponentialsSum[0]
  );
}

export function compare(
  this: IKernelFunctionThis,
  target: number,
  exponentials: number[]
): number {
  let indicator = 0;
  if (this.thread.x === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.x]);
}

export function compare2D(
  this: IKernelFunctionThis,
  target: number,
  exponentials: number[][]
): number {
  let indicator = 0;
  const index = this.thread.x + this.thread.y * this.output.x;
  if (index === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.y][this.thread.x]);
}

export function compare3D(
  this: IKernelFunctionThis,
  target: number,
  exponentials: number[][][]
): number {
  let indicator = 0;
  const index =
    this.thread.x +
    this.thread.y * this.output.x +
    this.thread.z * this.output.x * this.output.y;
  if (index === target) {
    indicator = 1;
  }
  return -(
    indicator - exponentials[this.thread.z][this.thread.y][this.thread.x]
  );
}

export function loss(): number {
  return -Math.log(0);
}

// TODO: handle: `return -Math.log(this.es[y]);` in learn

export class SoftMax extends Modifier {
  getExponentialsKernel: IKernelRunShortcut | null;
  getMaxValueKernel: IKernelRunShortcut | null;
  getSumKernel: IKernelRunShortcut | null;
  errors: KernelOutput | null = null;
  constructor(inputLayer: ILayer, settings?: ILayerSettings) {
    super(inputLayer, settings);
    this.getExponentialsKernel = null;
    this.getMaxValueKernel = null;
    this.getSumKernel = null;
    this.validate();

    if (this.depth > 0) {
      this.weights = randos3D(this.width, this.height, this.depth);
      this.deltas = zeros3D(this.width, this.height, this.depth);
    } else if (this.height > 0) {
      this.weights = randos2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
    } else {
      this.weights = randos(this.width);
      this.deltas = zeros(this.width);
    }
  }

  setupKernels(): void {
    const { width, height, depth } = this;
    if (depth > 0) {
      this.getExponentialsKernel = makeKernel(getExponentials3D, {
        output: [width, height, depth],
      });
      this.getMaxValueKernel = makeKernel(getMaxValue3D, {
        output: [1, 1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
          inputDepth: depth,
        },
      });
      this.getSumKernel = makeKernel(getSum3D, {
        output: [1, 1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
          inputDepth: depth,
        },
      });
      this.predictKernel = makeKernel(predict3D, {
        output: [width, height, depth],
      });
      this.compareKernel = makeKernel(compare3D, {
        output: [width, height, depth],
        immutable: true,
      });
    } else {
      this.getExponentialsKernel = makeKernel(getExponentials, {
        output: [width, height],
      });
      this.getMaxValueKernel = makeKernel(getMaxValue2D, {
        output: [1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
        },
      });
      this.getSumKernel = makeKernel(getSum2D, {
        output: [1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
        },
      });
      this.predictKernel = makeKernel(predict2D, {
        output: [width, height],
      });
      this.compareKernel = makeKernel(compare2D, {
        output: [width, height],
        immutable: true,
      });
    }
  }

  predict(): void {
    const maxValue = (this.getMaxValueKernel as IKernelRunShortcut)(
      this.inputLayer.weights
    );
    const exponentials = (this.getExponentialsKernel as IKernelRunShortcut)(
      this.inputLayer.weights,
      maxValue
    );
    const exponentialsSum = (this.getSumKernel as IKernelRunShortcut)(
      exponentials
    );
    this.weights = (this.predictKernel as IKernelRunShortcut)(
      exponentials,
      exponentialsSum
    );
  }

  compare(targetValues: KernelOutput): void {
    const { deltas, errors } = this;
    this.errors = (this.compareKernel as IKernelRunShortcut)(
      (targetValues as number[])[0],
      deltas
    );
    this.deltas = clone(this.errors);
    release(deltas);
    release(errors as Texture);

    const inputLayerDeltas = this.inputLayer.deltas;
    this.inputLayer.deltas = clone(this.deltas);
    release(inputLayerDeltas);
  }
}

export function softMax(
  inputLayer: ILayer,
  settings?: ILayerSettings
): SoftMax {
  return new SoftMax(inputLayer, settings);
}
