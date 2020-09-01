import { IKernelRunShortcut } from 'gpu.js';
import { makeKernel } from '../utilities/kernel';

/**
 * 2D Mean Squared Error
 */
export function mse2d(
  this: {
    constants: { height: number; width: number; length: number };
  },
  errors: Array<[number, number]>
): number {
  let sum = 0;
  for (let y = 0; y < this.constants.height; y++) {
    for (let x = 0; x < this.constants.width; x++) {
      sum += errors[y][x] ** 2;
    }
  }
  return sum / this.constants.length;
}

export class MeanSquaredError {
  /** Calculate the mean squared error given an array of errors */
  calculate: IKernelRunShortcut;
  /** Returns the sum of absolute values of previuous error and previous layer errors */
  addAbsolute: IKernelRunShortcut;
  /** Adds two erros */
  add: IKernelRunShortcut;
  /** Returns the ratio of sum of errors and length (ie the average) */
  divide: IKernelRunShortcut;

  constructor({ width, height }: { width: number; height: number }) {
    this.calculate = makeKernel(mse2d, {
      output: [1],
      constants: {
        width,
        height,
        length: width * height,
      },
      immutable: true,
    });

    this.addAbsolute = makeKernel(
      function (prevError: number[], prevLayerErrors: number[][]) {
        return prevError[0] + Math.abs(prevLayerErrors[0][0]);
      },
      {
        output: [1],
        immutable: true,
      }
    );

    this.add = makeKernel(
      function (value1: number[], value2: number[]) {
        return value1[0] + value2[0];
      },
      {
        output: [1],
        immutable: true,
      }
    );

    this.divide = makeKernel(
      function (length: number, mseSum: number[]) {
        const value = mseSum[0];
        if (value > 0) {
          return value / length;
        }
        return 0;
      },
      {
        output: [1],
        immutable: true,
      }
    );
  }
}
