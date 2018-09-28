import assert from 'assert';
import brain from '../../src';
import CrossValidate from '../../src/cross-validate';

describe('CrossValidation', () => {
  describe('simple xor example', () => {
    it('throws exception when training set is too small', () => {
      const xorTrainingData = [
        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] }
      ];
      const net = new CrossValidate(brain.NeuralNetwork);
      assert.throws(() => {
        net.train(xorTrainingData);
      });
    });
    it('handles training and outputs values that are all numbers', () => {
      const xorTrainingData = [
        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },

        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] }
      ];
      const net = new CrossValidate(brain.NeuralNetwork);
      net.train(xorTrainingData);
      const json = net.toJSON();
      for (let p in json.avgs) {
        assert(json.avgs[p] >= 0);
      }
      for (let p in json.stats) {
        assert(json.stats[p] >= 0);
      }
    });
  });
});
