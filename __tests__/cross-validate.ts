import CrossValidate from '../src/cross-validate';
import {
  INeuralNetworkJSON,
  INeuralNetworkOptions,
  INeuralNetworkTrainOptions,
  NeuralNetwork,
} from '../src/neural-network';
import { LSTMTimeStep } from '../src/recurrent/lstm-time-step';

describe('CrossValidate', () => {
  describe('.train()', () => {
    class FakeNN extends NeuralNetwork {
      constructor(options: Partial<INeuralNetworkOptions & INeuralNetworkTrainOptions> = {}) {
        super(options);
        this.options.hiddenLayers = [1, 2, 3];
      }

      train(data: Array<{ input: number[], output: number[] }>, trainOpts: {}) {
        return {
          iterations: 10,
          error: 0.05,
        };
      }
      static fromJSON(json: INeuralNetworkJSON): FakeNN {
        const net = new FakeNN();
        return net.fromJSON(json);
      }
    }
    it('throws exception when training set is too small', () => {
      const xorTrainingData = [{ input: [0, 1], output: [1] }];
      const net = new CrossValidate(FakeNN);
      expect(() => {
        net.train(xorTrainingData);
      }).toThrow('Training set size is too small for 1 k folds of 4');
    });
    it('handles successful training', () => {
      const xorTrainingData = [
        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },

        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },
      ];
      const net = new CrossValidate(FakeNN, { inputSize: 1, hiddenLayers: [10], outputSize: 1 });
      net.shuffleArray = (input) => input;
      const result = net.train(xorTrainingData);
      if (!CrossValidate.isBinaryResults(result)) {
        fail('expected binary stats but did not find binary stats');
      }
      expect(result.avgs.iterations).toBe(10);
      expect(result.avgs.error).toBe(0.05);
      expect(result.avgs.testTime >= 0).toBeTruthy();
      expect(result.avgs.trainTime >= 0).toBeTruthy();
      expect(result.stats.total).toBe(8);
      expect(result.stats.truePos).toBe(4);
      expect(result.stats.trueNeg).toBe(4);
      expect(result.stats.falsePos).toBe(0);
      expect(result.stats.falseNeg).toBe(0);
      expect(result.stats.precision).toBe(1);
      expect(result.stats.accuracy).toBe(1);
      expect(result.stats.testSize).toBe(2);
      expect(result.stats.trainSize).toBe(6);
      expect(result.sets.length).toBe(4);
      for (let i = 0; i < result.sets.length; i++) {
        const set = result.sets[0];
        expect(set.accuracy).toBe(1);
        expect(set.error).toBe(0.05);
        expect(set.truePos >= 1 || set.trueNeg >= 1).toBeTruthy();
        expect(set.falseNeg).toBe(0);
        expect(set.falsePos).toBe(0);
        expect(set.precision).toBe(1);
        expect(set.recall).toBe(1);
        expect(set.testTime >= 0).toBeTruthy();
        expect(set.trainTime >= 0).toBeTruthy();
        expect(set.total).toBe(2);
        expect(set.network).toBe(null);
        expect(set.misclasses).toEqual([]);
      }
    });
    it('handles unsuccessful training', () => {
      const xorTrainingData = [
        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },

        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },
      ];
      const net = new CrossValidate(FakeNN);
      net.shuffleArray = (input) => input;
      const result = net.train(xorTrainingData);
      if (!CrossValidate.isBinaryResults(result)) {
        fail('expected binary stats but did not find binary stats');
      }
      expect(result.avgs.iterations).toBe(10);
      expect(result.avgs.error).toBe(0.05);
      expect(result.avgs.testTime >= 0).toBeTruthy();
      expect(result.avgs.trainTime >= 0).toBeTruthy();
      expect(result.stats.total).toBe(8);

      expect(result.stats.truePos).toBe(0);
      expect(result.stats.trueNeg).toBe(0);
      expect(result.stats.falsePos).toBe(4);
      expect(result.stats.falseNeg).toBe(4);
      expect(result.stats.precision).toBe(0);
      expect(result.stats.accuracy).toBe(0);
      expect(result.stats.testSize).toBe(2);
      expect(result.stats.trainSize).toBe(6);

      expect(result.sets.length).toBe(4);
      for (let i = 0; i < result.sets.length; i++) {
        const set = result.sets[0];
        expect(set.accuracy).toBe(0);
        expect(set.error).toBe(0.05);
        expect(set.truePos).toBe(0);
        expect(set.trueNeg).toBe(0);
        expect(set.falseNeg >= 1 || set.falsePos >= 1).toBeTruthy();
        expect(set.precision).toBe(0);
        expect(set.recall).toBe(0);
        expect(set.testTime >= 0).toBeTruthy();
        expect(set.trainTime >= 0).toBeTruthy();
        expect(set.total).toBe(2);
        expect(set.network).toBe(null);
        expect(set.misclasses.length > 0).toBeTruthy();
        expect(set.misclasses[0].hasOwnProperty('input')).toBeTruthy();
        expect(set.misclasses[0].input.length).toBeTruthy();
        expect(
          xorTrainingData.filter((v) => v.input === set.misclasses[0].input)
        ).toBeTruthy();
        expect(
          xorTrainingData.filter((v) => v.output === set.misclasses[0].output)
        ).toBeTruthy();
        expect(
          set.misclasses[0].actual === 0 || set.misclasses[0].actual === 1
        ).toBeTruthy();
        expect(
          set.misclasses[0].expected === 0 || set.misclasses[0].expected === 1
        ).toBeTruthy();
      }
    });
  });
  describe('.toJSON()', () => {
    it('returns from this.json', () => {
      const cv = new CrossValidate(NeuralNetwork);
      const json = cv.json;
      expect(cv.toJSON()?.avgs?.error).toBe(0);
      expect(cv.toJSON()).toBe(json);
    });
  });
  describe('.fromJSON()', () => {
    class FakeNN extends NeuralNetwork {}
    it("creates a new instance of constructor from argument's sets.error", () => {
      const cv = new CrossValidate(FakeNN);
      const options = { inputSize: 1, hiddenLayers: [10], outputSize: 1 };
      const details = {
        trainTime: 0,
        testTime: 0,
        total: 0,
        iterations: 0,
        misclasses: 0,
        learningRate: 0,
        hiddenLayers: [0],
      };
      const bestNetwork = new FakeNN(options);
      bestNetwork.initialize();
      const worstNetwork = new FakeNN(options);
      worstNetwork.initialize();
      const midNetwork = new FakeNN(options);
      midNetwork.initialize();

      const net = cv.fromJSON({
        avgs: {} as any,
        stats: {} as any,
        sets: [
          {
            error: 10,
            network: worstNetwork.toJSON(),
            ...details,
          },
          {
            error: 5,
            network: midNetwork.toJSON(),
            ...details,
          },
          {
            error: 1,
            network: bestNetwork.toJSON(),
            ...details,
          },
        ],
      });

      expect(net.toJSON()).toEqual(bestNetwork.toJSON());
    });
  });
  describe('.toNeuralNetwork()', () => {
    class FakeNN extends NeuralNetwork {}
    it('creates a new instance of constructor from top .json sets.error', () => {
      const cv = new CrossValidate(FakeNN);
      const details = {
        trainTime: 0,
        testTime: 0,
        total: 0,
        iterations: 0,
        misclasses: 0,
        learningRate: 0,
        hiddenLayers: [0],
      };
      const options = {
        inputSize: 10,
        hiddenLayers: [10],
        outputSize:7
      };
      const bestNet = new FakeNN(options);
      bestNet.initialize();
      const worstNet = new FakeNN(options);
      worstNet.initialize();
      const midNet = new FakeNN(options);
      midNet.initialize();
      cv.json = {
        sets: [
          { error: 10, network: worstNet.toJSON(), ...details },
          { error: 5, network: midNet.toJSON(), ...details },
          { error: 1, network: bestNet.toJSON(), ...details },
        ],
        avgs: { trainTime: 0, testTime: 0, iterations: 0, error: 0 },
        stats: {} as any,
      };
      const net = cv.toNeuralNetwork();
      expect(net.toJSON()).toEqual(bestNet.toJSON());
    });
  });
  describe('NeuralNetwork compatibility', () => {
    it('handles simple xor example', () => {
      const xorTrainingData = [
        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },

        { input: [0, 1], output: [1] },
        { input: [0, 0], output: [0] },
        { input: [1, 1], output: [0] },
        { input: [1, 0], output: [1] },
      ];
      const net = new CrossValidate(NeuralNetwork);
      const result = net.train(xorTrainingData);
      expect(result.avgs.error >= 0).toBeTruthy();
      expect(result.avgs.iterations >= 0).toBeTruthy();
      expect(result.avgs.testTime >= 0).toBeTruthy();
      expect(result.avgs.trainTime >= 0).toBeTruthy();
      expect(result.stats.testSize >= 0).toBeTruthy();
      expect(result.stats.trainSize >= 0).toBeTruthy();
      expect(result.stats.total >= 0).toBeTruthy();
    });
  });

  describe('RNNTimeStep compatibility', () => {
    it('can average error for array,array, counting forwards and backwards', () => {
      const trainingData = [
        [0.1, 0.2, 0.3, 0.4, 0.5],
        [0.2, 0.3, 0.4, 0.5, 0.6],
        [0.3, 0.4, 0.5, 0.6, 0.7],
        [0.4, 0.5, 0.6, 0.7, 0.8],
        [0.5, 0.6, 0.7, 0.8, 0.9],

        [0.5, 0.4, 0.3, 0.2, 0.1],
        [0.6, 0.5, 0.4, 0.3, 0.2],
        [0.7, 0.6, 0.5, 0.4, 0.3],
        [0.8, 0.7, 0.6, 0.5, 0.4],
        [0.9, 0.8, 0.7, 0.6, 0.5],
      ];

      const cv = new CrossValidate(
        LSTMTimeStep,
        {
          inputSize: 1,
          hiddenLayers: [10],
          outputSize: 1,
        }
      );
      const result = cv.train(trainingData, { iterations: 10 });
      expect(!isNaN(result.avgs.error)).toBeTruthy();
    });
  });
});
