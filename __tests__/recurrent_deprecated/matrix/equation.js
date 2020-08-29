const Matrix = require('../../../src/recurrent/matrix');
const OnesMatrix = require('../../../src/recurrent/matrix/ones-matrix');
const Equation = require('../../../src/recurrent/matrix/equation');

function fourSquareMatrix(value) {
  const result = new Matrix(4, 4);
  result.weights.forEach((_, i) => {
    result.weights[i] = value;
  });
  return result;
}

describe('equation', () => {
  describe('run', () => {
    it('calls all forwardFn properties', () => {
      const equation = new Equation();
      for (let i = 0; i < 10; i++) {
        equation.states.push({
          forwardFn: jest.fn(),
        });
      }
      equation.runIndex();
      equation.states.forEach((state) => {
        expect(state.forwardFn).toBeCalled();
      });
    });
  });
  describe('runBack', () => {
    it('calls all forwardFn properties', () => {
      const equation = new Equation();
      for (let i = 0; i < 10; i++) {
        equation.states.push({
          backpropagationFn: jest.fn(),
        });
      }
      equation.backpropagate();
      equation.states.forEach((state) => {
        expect(state.backpropagationFn).toBeCalled();
      });
    });
  });
  describe('add', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('multiply', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.multiply(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('multiplyElement', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('relu', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('inputMatrixToRow', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('sigmoid', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('tanh', () => {
    it('calls forwardFn', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      expect(equation.states.length).toBe(1);
      jest.spyOn(equation.states[0], 'forwardFn');
      equation.runIndex();
      expect(equation.states[0].forwardFn).toBeCalled();
    });
  });
  describe('nesting', () => {
    it('can nest 3 deep and run forward', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(2);
      equation.multiply(
        equation.multiply(
          equation.multiply(input, fourSquareMatrix(2)),
          fourSquareMatrix(2)
        ),
        fourSquareMatrix(2)
      );
      expect(equation.states.length).toBe(3);
      jest.spyOn(equation.states[0], 'forwardFn');
      jest.spyOn(equation.states[1], 'forwardFn');
      jest.spyOn(equation.states[2], 'forwardFn');
      equation.runIndex();
      equation.states.forEach((state) => {
        expect(state.forwardFn).toBeCalled();
      });
    });
    it('can nest 3 deep and run backward', () => {
      const equation = new Equation();
      const input = fourSquareMatrix(2);
      equation.tanh(
        equation.multiply(
          equation.add(input, fourSquareMatrix(2)),
          fourSquareMatrix(2)
        ),
        fourSquareMatrix(2)
      );
      expect(equation.states.length).toBe(3);
      jest.spyOn(equation.states[0], 'backpropagationFn');
      jest.spyOn(equation.states[1], 'backpropagationFn');
      jest.spyOn(equation.states[2], 'backpropagationFn');
      equation.backpropagate();
      equation.states.forEach((state) => {
        expect(state.backpropagationFn).toBeCalled();
      });
    });
  });
  describe('inputMatrixToRow', () => {
    describe('runIndex', () => {
      it('can properly split up a matrix', () => {
        const input = new Matrix(2, 2);
        /**
         * Matrix like:
         * 1 1
         * 2 2
         */
        input.weights.forEach((w, i) => {
          if (i < 2) {
            input.weights[i] = 1;
          } else {
            input.weights[i] = 2;
          }
        });
        const equation = new Equation();
        equation.add(new OnesMatrix(1, 2), equation.inputMatrixToRow(input));
        let output = equation.runIndex();
        expect(output.weights.length).toBe(2);
        expect(output.weights[0]).toBe(2);
        expect(output.weights[1]).toBe(2);

        output = equation.runIndex(1);
        expect(output.weights.length).toBe(2);
        expect(output.weights[0]).toBe(3);
        expect(output.weights[1]).toBe(3);
      });
    });
    describe('.backpropagate()', () => {
      it('can properly split up a matrix', () => {
        const input = new Matrix(2, 2);
        /**
         * Matrix like:
         * 1 1
         * 2 2
         */
        input.weights.forEach((w, i) => {
          if (i < 2) {
            input.weights[i] = 1;
          } else {
            input.weights[i] = 2;
          }
        });
        const equation = new Equation();
        equation.add(new OnesMatrix(1, 2), equation.inputMatrixToRow(input));
        let output = equation.runIndex();
        expect(output.weights.length).toBe(2);
        output = equation.runIndex(1);
        expect(output.weights.length).toBe(2);
      });
    });
  });
});
