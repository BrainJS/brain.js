import zeros from '../../utilities/zeros';

/**
 * A matrix
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */
export default class Matrix {
  constructor(rows, columns) {
    if (rows === undefined) return;
    if (columns === undefined) return;

    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
    this.deltas = zeros(rows * columns);
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @returns {Float32Array|Array}
   */
  getWeights(row, col) {
    // slow but careful accessor function
    // we want row-major order
    let ix = (this.columns * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('get accessor is skewed');
    return this.weights[ix];
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @param v
   * @returns {Matrix}
   */
  setWeight(row, col, v) {
    // slow but careful accessor function
    let ix = (this.columns * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
    this.weights[ix] = v;
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @param v
   * @returns {Matrix}
   */
  setDeltas(row, col, v) {
    // slow but careful accessor function
    let ix = (this.columns * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
    this.deltas[ix] = v;
  }

  /**
   *
   * @returns {{rows: *, columns: *, weights: Array}}
   */
  toJSON() {
    return {
      rows: this.rows,
      columns: this.columns,
      weights: this.weights.slice(0)
    };
  }

  static fromJSON(json) {
    let matrix = new Matrix(json.rows, json.columns);
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
  static fromArray(weightRows, deltasRows) {
    const rows = weightRows.length;
    const columns = weightRows[0].length;
    const m = new Matrix(rows, columns);

    deltasRows = deltasRows || weightRows;

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

  weightsToArray() {
    const deltas = [];
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

  deltasToArray() {
    const deltas = [];
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
