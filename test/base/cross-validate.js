import assert from 'assert';
import CrossValidate from '../../src/cross-validate';
import NeuralNetwork from '../../src/neural-network';
import LSTMTimeStep from '../../src/recurrent/lstm-time-step';

describe('CrossValidate', () => {
  describe('simple xor example', () => {
    it('throws exception when training set is too small', () => {
      const xorTrainingData = [
        { input: [0, 1], output: [1] }
      ];
      const net = new CrossValidate(NeuralNetwork);
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
      const net = new CrossValidate(NeuralNetwork);
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

  describe('RNNTimeStep compatibility', () => {
    it('can average error for array,array, counting forwards and backwards', () => {
      const trainingData = [
        [.1,.2,.3,.4,.5],
        [.2,.3,.4,.5,.6],
        [.3,.4,.5,.6,.7],
        [.4,.5,.6,.7,.8],
        [.5,.6,.7,.8,.9],

        [.5,.4,.3,.2,.1],
        [.6,.5,.4,.3,.2],
        [.7,.6,.5,.4,.3],
        [.8,.7,.6,.5,.4],
        [.9,.8,.7,.6,.5],
      ];

      const cv = new CrossValidate(LSTMTimeStep, { inputSize: 1, hiddenLayers: [10], outputSize: 1 });
      cv.train(trainingData, { iterations: 10 });
      const cvJson = cv.toJSON();
      assert(!isNaN(cvJson.avgs.error));
    });
  });
});
