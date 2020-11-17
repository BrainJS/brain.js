import { zeros } from '../../utilities/zeros';

export interface IMatrixJSON {
  rows: number;
  columns: number;
  weights: Float32Array;
}
/**
 * A matrix
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
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

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @returns {Number}
   */
  getWeights(row: number, col: number): number {
    // slow but careful accessor function
    // we want row-major order
    const ix = this.columns * row + col;

    if (ix < 0 && ix >= this.weights.length) {
      throw new Error('get accessor is skewed');
    }

    return this.weights[ix];
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @param {Number}  v
   * @returns {Matrix}
   */
  setWeight(row: number, col: number, v: number): Matrix {
    // slow but careful accessor function
    const ix = this.columns * row + col;

    if (ix < 0 && ix >= this.weights.length) {
      throw new Error('set accessor is skewed');
    }

    this.weights[ix] = v;

    return this;
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @param {Number}  v
   * @returns {Matrix}
   */
  setDeltas(row: number, col: number, v: number): Matrix {
    // slow but careful accessor function
    const ix = this.columns * row + col;

    if (ix < 0 && ix >= this.weights.length) {
      throw new Error('set accessor is skewed');
    }

    this.deltas[ix] = v;

    return this;
  }

  /**
   *
   * @returns {{rows: *, columns: *, weights: Array}}
   */
  toJSON(): IMatrixJSON {
    return {
      rows: this.rows,
      columns: this.columns,
      weights: this.weights.slice(0),
    };
  }

  static fromJSON(json: {
    rows: number;
    columns: number;
    weights: Float32Array;
  }): Matrix {
    const matrix = new Matrix(json.rows, json.columns);

    for (let i = 0, max = json.rows * json.columns; i < max; i++) {
      matrix.weights[i] = json.weights[i]; // copy over weights
    }

    return matrix;
  }

  /**
   *
   * @param weightRows
   * @param [deltasRows]
   * @returns {Matrix}
   */
  static fromArray(
    weightRows: Float32Array[],
    deltasRows?: Float32Array[]
  ): Matrix {
    const rows = weightRows.length;
    const columns = weightRows[0].length;
    const m = new Matrix(rows, columns);

    deltasRows = deltasRows ?? weightRows;

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const weightValues = weightRows[rowIndex];
      const deltasValues = deltasRows[rowIndex];

      for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
        m.setWeight(rowIndex, columnIndex, weightValues[columnIndex]);
        m.setDeltas(rowIndex, columnIndex, deltasValues[columnIndex]);
      }
    }

    return m;
  }

  weightsToArray(): number[][] {
    const deltas: number[][] = [];
    let row = 0;
    let column = 0;

    for (let i = 0; i < this.weights.length; i++) {
      if (column === 0) {
        deltas.push([]);
      }

      deltas[row].push(this.weights[i]);
      column++;

      if (column >= this.columns) {
        column = 0;
        row++;
      }
    }

    return deltas;
  }

  deltasToArray(): number[][] {
    const deltas: number[][] = [];
    let row = 0;
    let column = 0;

    for (let i = 0; i < this.deltas.length; i++) {
      if (column === 0) {
        deltas.push([]);
      }

      deltas[row].push(this.deltas[i]);
      column++;

      if (column >= this.columns) {
        column = 0;
        row++;
      }
    }

    return deltas;
  }
}
