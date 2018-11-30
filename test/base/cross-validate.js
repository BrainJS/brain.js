import assert from 'assert';
import CrossValidate from '../../src/cross-validate';
import NeuralNetwork from '../../src/neural-network';
import LSTMTimeStep from '../../src/recurrent/lstm-time-step';

describe('CrossValidate', () => {
  describe('.train()', () => {
    class FakeNN extends NeuralNetwork {
      constructor(run) {
        super();
        if (run) {
          this.run = run;
        }
        this.hiddenLayers = [1,2,3];
      }
      train() {
        return {
          iterations: 10,
          error: 0.05
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
      const xorTrainingData = [
        { input: [0, 1], output: [1] }
      ];
      const net = new CrossValidate(FakeNN);
      assert.throws(() => {
        net.train(xorTrainingData);
      });
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
        { input: [1, 0], output: [1] }
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
      assert.equal(result.avgs.iterations, 10);
      assert.equal(result.avgs.error,0.05);
      assert(result.avgs.testTime >= 0);
      assert(result.avgs.trainTime >= 0);
      assert.equal(result.stats.total, 8);

      assert.equal(result.stats.truePos, 4);
      assert.equal(result.stats.trueNeg, 4);
      assert.equal(result.stats.falsePos, 0);
      assert.equal(result.stats.falseNeg, 0);
      assert.equal(result.stats.precision, 1);
      assert.equal(result.stats.accuracy, 1);
      assert.equal(result.stats.testSize, 2);
      assert.equal(result.stats.trainSize, 6);

      assert.equal(result.sets.length, 4);
      for (let i = 0; i < result.sets.length; i++) {
        const set = result.sets[0];
        assert.equal(set.accuracy, 1);
        assert.equal(set.error, 0.05);
        assert(set.truePos >= 1 || set.trueNeg >= 1);
        assert.equal(set.falseNeg, 0);
        assert.equal(set.falsePos, 0);
        assert.equal(set.precision, 1);
        assert.equal(set.recall, 1);
        assert(set.testTime >= 0);
        assert(set.trainTime >= 0);
        assert.equal(set.total, 2);
        assert.equal(set.net, null);
        assert.deepEqual(set.hiddenLayers, [1,2,3]);
        assert.deepEqual(set.misclasses, []);
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
        { input: [1, 0], output: [1] }
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
      assert.equal(result.avgs.iterations, 10);
      assert.equal(result.avgs.error,0.05);
      assert(result.avgs.testTime >= 0);
      assert(result.avgs.trainTime >= 0);
      assert.equal(result.stats.total, 8);

      assert.equal(result.stats.truePos, 0);
      assert.equal(result.stats.trueNeg, 0);
      assert.equal(result.stats.falsePos, 4);
      assert.equal(result.stats.falseNeg, 4);
      assert.equal(result.stats.precision, 0);
      assert.equal(result.stats.accuracy, 0);
      assert.equal(result.stats.testSize, 2);
      assert.equal(result.stats.trainSize, 6);

      assert.equal(result.sets.length, 4);
      for (let i = 0; i < result.sets.length; i++) {
        const set = result.sets[0];
        assert.equal(set.accuracy, 0);
        assert.equal(set.error, 0.05);
        assert.equal(set.truePos, 0);
        assert.equal(set.trueNeg, 0);
        assert(set.falseNeg >= 1 || set.falsePos >= 1);
        assert.equal(set.precision, 0);
        assert.equal(set.recall, 0);
        assert(set.testTime >= 0);
        assert(set.trainTime >= 0);
        assert.equal(set.total, 2);
        assert.equal(set.net, null);
        assert.deepEqual(set.hiddenLayers, [1,2,3]);
        assert(set.misclasses.length > 0);
        assert(set.misclasses[0].hasOwnProperty('input'));
        assert(set.misclasses[0].input.length, 2);
        assert(xorTrainingData.filter(v => v.input === set.misclasses[0].input));
        assert(xorTrainingData.filter(v => v.output === set.misclasses[0].output));
        assert(set.misclasses[0].actual === 0 || set.misclasses[0].actual === 1);
        assert(set.misclasses[0].expected === 0 || set.misclasses[0].expected === 1);
      }
    });
  });
  describe('.toJSON()', () => {
    it('returns from this.json', () => {
      const fakeJson = Math.random();
      const json = CrossValidate.prototype.toJSON.call({ json: fakeJson });
      assert.equal(json, fakeJson);
    });
  });
  describe('.fromJSON()', () => {
    class FakeNN {
      fromJSON(json) {
        this.json = json;
      }
    }
    it('creates a new instance of constructor from argument\'s sets.error', () => {
      const cv = new CrossValidate(FakeNN);
      const net = cv.fromJSON({ sets: [{ error: 10, network: 10 },{ error: 5, network: 5 }, { error: 1, network: 1 }] });
      assert.equal(net.json, 1);
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
      cv.json = { sets: [{ error: 10, network: 10 },{ error: 5, network: 5 }, { error: 1, network: 1 }] };
      const net = cv.toNeuralNetwork();
      assert.equal(net.json, 1);
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
        { input: [1, 0], output: [1] }
      ];
      const net = new CrossValidate(NeuralNetwork);
      const result = net.train(xorTrainingData);
      for (let p in result.avgs) {
        assert(result.avgs[p] >= 0);
      }
      for (let p in result.stats) {
        assert(result.stats[p] >= 0);
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
      const result = cv.train(trainingData, { iterations: 10 });
      assert(!isNaN(result.avgs.error));
    });
  });
});
