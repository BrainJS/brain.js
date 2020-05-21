import { makeKernel } from '../utilities/kernel';

function mse2d(this: any, errors: number[][]) {
  // mean squared error 2d
  let sum = 0;
  for (let y = 0; y < this.constants.height; y++) {
    for (let x = 0; x < this.constants.width; x++) {
      sum += errors[y][x] ** 2;
    }
  }
  return sum / this.constants.length;
}

export class MeanSquaredError {
  public calculate: any
  public addAbsolute: any
  public add: any
  public divide: any
  constructor({ width, height }: { width: number, height: number }) {
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
      function (value1: number[], value2: number[][]) {
        return value1[0] + Math.abs(value2[0][0]);
      },
      {
        output: [1],
        immutable: true,
      }
    );
    this.add = makeKernel(
      function (value1: any[], value2: any[]) {
        return value1[0] + value2[0];
      },
      {
        output: [1],
        immutable: true,
      }
    );
    this.divide = makeKernel(
      function (length: number, mseSum: any[]) {
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