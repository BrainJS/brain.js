import { RNNTimeStep } from '../../src/recurrent/rnn-time-step';
import { LSTMTimeStep } from '../../src/recurrent/lstm-time-step';
import {
  getHiddenLSTMLayer,
  getLSTMEquation,
  ILSTMHiddenLayer,
} from '../../src/recurrent/lstm';
import { Matrix } from '../../src/recurrent/matrix';
import { Equation } from '../../src/recurrent/matrix/equation';

jest.mock('../../src/recurrent/matrix/random-matrix', () => {
  class MockRandomMatrix {
    get rows(): number {
      return this.realMatrix.rows;
    }

    get columns(): number {
      return this.realMatrix.columns;
    }

    get weights(): Float32Array {
      return this.realMatrix.weights;
    }

    set weights(weights: Float32Array) {
      this.realMatrix.weights = weights;
    }

    get deltas(): Float32Array {
      return this.realMatrix.weights;
    }

    set deltas(deltas: Float32Array) {
      this.realMatrix.deltas = deltas;
    }

    get setWeight(): (row: number, column: number, value: number) => void {
      return this.realMatrix.setWeight;
    }

    get getWeight(): (row: number, column: number) => number {
      return this.realMatrix.getWeight;
    }

    get setDelta(): (row: number, column: number, value: number) => void {
      return this.realMatrix.setDelta;
    }

    get getDelta(): (row: number, column: number) => number {
      return this.realMatrix.getDelta;
    }

    realMatrix: Matrix;
    constructor(rows: number, columns: number, std: number) {
      this.realMatrix = new Matrix(rows, columns);
      let value = 1;
      this.realMatrix.iterate({
        column: (rowIndex, columnIndex) => {
          this.setWeight(rowIndex, columnIndex, value++);
        },
      });
    }
  }
  return {
    RandomMatrix: MockRandomMatrix,
  };
});
describe('LSTMTimeStep', () => {
  describe('.getHiddenLayer()', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof LSTMTimeStep.prototype.getHiddenLayer).toEqual('function');
      expect(LSTMTimeStep.prototype.getHiddenLayer).not.toEqual(
        RNNTimeStep.prototype.getHiddenLayer
      );
    });
  });
  describe('.getEquation()', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof LSTMTimeStep.prototype.getEquation).toEqual('function');
      expect(LSTMTimeStep.prototype.getEquation).not.toEqual(
        RNNTimeStep.prototype.getEquation
      );
    });
  });
  describe('.getLSTMEquation()', () => {
    let hiddenLayer: ILSTMHiddenLayer;
    beforeEach(() => {
      hiddenLayer = getHiddenLSTMLayer(3, 3);
    });
    it('correctly computes a hidden state', () => {
      const equation = new Equation();
      const inputMatrix = new Matrix(3, 1);
      inputMatrix.setWeight(0, 0, 0.1);
      inputMatrix.setWeight(1, 0, 0.5);
      inputMatrix.setWeight(2, 0, 1);
      const previousResult = new Matrix(3, 1);
      previousResult.setWeight(0, 0, 0.1);
      previousResult.setWeight(1, 0, 0.5);
      previousResult.setWeight(2, 0, 1);
      equation.input(new Matrix(3, 1));
      const lstmEquation = getLSTMEquation(
        equation,
        inputMatrix,
        previousResult,
        hiddenLayer
      );
      const result = equation.runInput(new Float32Array([0, 0, 0]));
      expect(result.getWeight(0, 0)).toBeCloseTo(0.8001706600189209);
      expect(result.getWeight(1, 0)).toBeCloseTo(0.9051482677459717);
      expect(result.getWeight(2, 0)).toBeCloseTo(0.9640275835990906);
      expect(equation.states.length).toBe(26);
      expect(equation.states[0].forwardFn.name).toBe('forwardFn');
      // input gate
      expect(equation.states[1].forwardFn.name).toBe('multiply');
      expect(equation.states[2].forwardFn.name).toBe('multiply');
      expect(equation.states[3].forwardFn.name).toBe('add');
      expect(equation.states[4].forwardFn.name).toBe('add');
      expect(equation.states[5].forwardFn.name).toBe('sigmoid');

      // forget gate
      expect(equation.states[6].forwardFn.name).toBe('multiply');
      expect(equation.states[7].forwardFn.name).toBe('multiply');
      expect(equation.states[8].forwardFn.name).toBe('add');
      expect(equation.states[9].forwardFn.name).toBe('add');
      expect(equation.states[10].forwardFn.name).toBe('sigmoid');

      // output gate
      expect(equation.states[11].forwardFn.name).toBe('multiply');
      expect(equation.states[12].forwardFn.name).toBe('multiply');
      expect(equation.states[13].forwardFn.name).toBe('add');
      expect(equation.states[14].forwardFn.name).toBe('add');
      expect(equation.states[15].forwardFn.name).toBe('sigmoid');

      // cell write
      expect(equation.states[16].forwardFn.name).toBe('multiply');
      expect(equation.states[17].forwardFn.name).toBe('multiply');
      expect(equation.states[18].forwardFn.name).toBe('add');
      expect(equation.states[19].forwardFn.name).toBe('add');
      expect(equation.states[20].forwardFn.name).toBe('tanh');

      // new activation
      expect(equation.states[21].forwardFn.name).toBe('multiplyElement');
      expect(equation.states[22].forwardFn.name).toBe('multiplyElement');
      expect(equation.states[23].forwardFn.name).toBe('add');
      expect(equation.states[24].forwardFn.name).toBe('tanh');
      expect(equation.states[25].forwardFn.name).toBe('multiplyElement');
    });
  });
});
