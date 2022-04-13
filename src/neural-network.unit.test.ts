import { NeuralNetwork } from './neural-network';

describe('NeuralNetwork', () => {
  describe('validateData', () => {
    describe('when an input is not same as options.inputSize', () => {
      it('throws', () => {
        expect(() => {
          new NeuralNetwork({ inputSize: 1, outputSize: 1 }).validateData([
            {
              input: new Float32Array([1, 1]),
              output: new Float32Array([1]),
            },
          ]);
        }).toThrow();
      });
    });
    describe('when an output is not same as options.outputSize', () => {
      it('throws', () => {
        expect(() => {
          new NeuralNetwork({ inputSize: 1, outputSize: 1 }).validateData([
            {
              input: new Float32Array([1]),
              output: new Float32Array([1, 1]),
            },
          ]);
        }).toThrow();
      });
    });
    describe('when an input is same as options.inputSize', () => {
      it('does not throw', () => {
        expect(() => {
          new NeuralNetwork({ inputSize: 1, outputSize: 1 }).validateData([
            {
              input: new Float32Array([1]),
              output: new Float32Array([1]),
            },
          ]);
        }).not.toThrow();
      });
    });
    describe('when an output is same as options.outputSize', () => {
      it('does not throw', () => {
        expect(() => {
          new NeuralNetwork({ inputSize: 1, outputSize: 1 }).validateData([
            {
              input: new Float32Array([1]),
              output: new Float32Array([1]),
            },
          ]);
        }).not.toThrow();
      });
    });
  });
  describe('run', () => {
    describe('when input is not same as options.inputSize', () => {
      it('throws', () => {
        const net = new NeuralNetwork({
          inputSize: 1,
          hiddenLayers: [1],
          outputSize: 1,
        });
        net.train([{ input: [1], output: [1] }], { iterations: 1 });
        expect(() => {
          net.run([1, 1]);
        }).toThrow();
      });
    });
    describe('when input is same as options.inputSize', () => {
      it('throws', () => {
        const net = new NeuralNetwork({
          inputSize: 1,
          hiddenLayers: [1],
          outputSize: 1,
        });
        net.train([{ input: [1], output: [1] }], { iterations: 1 });
        expect(() => {
          net.run([1]);
        }).not.toThrow();
      });
    });
  });
});
