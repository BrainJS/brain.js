import { zeros } from '../../utilities/zeros';

export interface IMatrixJSON {
  rows: number;
  columns: number;
  weights: number[];
}
/**
 * A matrix
 */
export class Matrix {
  rows = 0;
  columns = 0;
  weights: Float32Array;
  deltas: Float32Array;

  constructor(rows?: number, columns?: number) {
    if (rows) this.rows = rows;
    if (columns) this.columns = columns;

    this.weights = zeros(this.rows * this.columns);
    this.deltas = zeros(this.rows * this.columns);
  }

  getWeight(row: number, col: number): number {
    // slow but careful accessor function
    // we want row-major order
    const ix = this.columns * row + col;

    if (ix < 0 || ix >= this.weights.length) {
      throw new Error('get accessor is skewed');
    }

    return this.weights[ix];
  }

  setWeight(row: number, col: number, v: number): Matrix {
    // slow but careful accessor function
    const ix = this.columns * row + col;

    if (ix < 0 || ix >= this.weights.length) {
      throw new Error('set accessor is skewed');
    }

    this.weights[ix] = v;

    return this;
  }

  getDelta(row: number, col: number): number {
    // slow but careful accessor function
    // we want row-major order
    const ix = this.columns * row + col;

    if (ix < 0 || ix >= this.deltas.length) {
      throw new Error('get accessor is skewed');
    }

    return this.deltas[ix];
  }

  setDelta(row: number, col: number, v: number): Matrix {
    // slow but careful accessor function
    const ix = this.columns * row + col;

    if (ix < 0 || ix >= this.weights.length) {
      throw new Error('set accessor is skewed');
    }

    this.deltas[ix] = v;

    return this;
  }

  toJSON(): IMatrixJSON {
    return {
      rows: this.rows,
      columns: this.columns,
      weights: Array.from(this.weights.slice(0)),
    };
  }

  static fromJSON(json: IMatrixJSON): Matrix {
    const matrix = new Matrix(json.rows, json.columns);

    for (let i = 0, max = json.rows * json.columns; i < max; i++) {
      matrix.weights[i] = json.weights[i]; // copy over weights
    }

    return matrix;
  }

  static fromArray(weights: Float32Array[] | number[][]): Matrix {
    const matrix = new Matrix(weights.length, weights[0].length);
    matrix.fromArray(weights);
    return matrix;
  }

  deltasToArray(): number[][] {
    return this.toArray('deltas');
  }

  weightsToArray(): number[][] {
    return this.toArray('weights');
  }

  toArray(prop: 'weights' | 'deltas' = 'weights'): number[][] {
    const result: number[][] = new Array(this.rows);
    this.iterate({
      row: (rowIndex): void => {
        result[rowIndex] = new Array(this.columns);
      },
      column: (rowIndex, columnIndex): void => {
        if (prop === 'weights') {
          result[rowIndex][columnIndex] = this.getWeight(rowIndex, columnIndex);
        } else if (prop === 'deltas') {
          result[rowIndex][columnIndex] = this.getDelta(rowIndex, columnIndex);
        }
      },
    });
    return result;
  }

  fromArray(
    array: number[][] | Float32Array[],
    prop: 'weights' | 'deltas' = 'weights'
  ): this {
    if (array.length !== this.rows) {
      throw new Error('rows do not match');
    }
    if (array[0].length !== this.columns) {
      throw new Error('columns do not match');
    }
    this.iterate({
      column: (rowIndex, columnIndex): void => {
        const value = array[rowIndex][columnIndex];
        if (typeof value !== 'number') {
          throw new Error('value not number');
        }
        if (prop === 'weights') {
          this.setWeight(rowIndex, columnIndex, value);
        } else if (prop === 'deltas') {
          this.setDelta(rowIndex, columnIndex, value);
        }
      },
    });
    return this;
  }

  iterate(callbacks: {
    column?: (rowIndex: number, columnIndex: number) => void;
    row?: (rowIndex: number) => void;
  }): this {
    const rows = this.rows;
    const columns = this.columns;
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      if (callbacks.row) {
        callbacks.row(rowIndex);
      }
      for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
        if (callbacks.column) {
          callbacks.column(rowIndex, columnIndex);
        }
      }
    }
    return this;
  }
}
