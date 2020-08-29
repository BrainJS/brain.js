const CrossValidate = require('../src/cross-validate');
const NeuralNetwork = require('../src/neural-network');
const LSTMTimeStep = require('../src/recurrent/lstm-time-step');

describe('CrossValidate', () => {
  describe('.train()', () => {
    class FakeNN extends NeuralNetwork {
      constructor(run) {
        super();
        if (run) {
          this.run = run;
        }
        this.hiddenLayers = [1, 2, 3];
      }

      train() {
        return {
          iterations: 10,
          error: 0.05,
        };
      }

      runInput(inputs) {
        return this.run(inputs);
      }

      toJSON() {
        return null;
      }
    }
    it('throws exception when training set is too small', () => {
      const xorTrainingData = [{ input: [0, 1], output: [1] }];
      const net = new CrossValidate(FakeNN);
      expect(() => {
        net.train(xorTrainingData);
      }).toThrow();
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
      const net = new CrossValidate(FakeNN, (inputs) => {
        if (inputs[0] === 0 && inputs[1] === 1) return [1];
        if (inputs[0] === 0 && inputs[1] === 0) return [0];
        if (inputs[0] === 1 && inputs[1] === 1) return [0];
        if (inputs[0] === 1 && inputs[1] === 0) return [1];
        throw new Error('unknown input');
      });
      net.shuffleArray = (input) => input;
      const result = net.train(xorTrainingData);
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
        expect(set.hiddenLayers).toEqual([1, 2, 3]);
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
      const net = new CrossValidate(FakeNN, (inputs) => {
        // invert output, showing worst possible training
        if (inputs[0] === 0 && inputs[1] === 1) return [0];
        if (inputs[0] === 0 && inputs[1] === 0) return [1];
        if (inputs[0] === 1 && inputs[1] === 1) return [1];
        if (inputs[0] === 1 && inputs[1] === 0) return [0];
        throw new Error('unknown input');
      });
      net.shuffleArray = (input) => input;
      const result = net.train(xorTrainingData);
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
        expect(set.hiddenLayers).toEqual([1, 2, 3]);
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
      const fakeJson = Math.random();
      const json = CrossValidate.prototype.toJSON.call({ json: fakeJson });
      expect(json).toBe(fakeJson);
    });
  });
  describe('.fromJSON()', () => {
    class FakeNN {
      fromJSON(json) {
        this.json = json;
      }
    }
    it("creates a new instance of constructor from argument's sets.error", () => {
      const cv = new CrossValidate(FakeNN);
      const net = cv.fromJSON({
        sets: [
          { error: 10, network: 10 },
          { error: 5, network: 5 },
          { error: 1, network: 1 },
        ],
      });
      expect(net.json).toBe(1);
    });
  });
  describe('.toNeuralNetwork()', () => {
    class FakeNN {
      fromJSON(json) {
        this.json = json;
      }
    }
    it('creates a new instance of constructor from top .json sets.error', () => {
      const cv = new CrossValidate(FakeNN);
      cv.json = {
        sets: [
          { error: 10, network: 10 },
          { error: 5, network: 5 },
          { error: 1, network: 1 },
        ],
      };
      const net = cv.toNeuralNetwork();
      expect(net.json).toBe(1);
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
      for (const p in result.avgs) {
        expect(result.avgs[p] >= 0).toBeTruthy();
      }
      for (const p in result.stats) {
        expect(result.stats[p] >= 0).toBeTruthy();
      }
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

      const cv = new CrossValidate(LSTMTimeStep, {
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1,
      });
      const result = cv.train(trainingData, { iterations: 10 });
      expect(!isNaN(result.avgs.error)).toBeTruthy();
    });
  });
});
