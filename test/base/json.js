import assert from 'assert';
import NeuralNetwork from './../../src/neural-network';

describe('JSON', () => {
  describe('.toJSON() serialization', () => {
    describe('json.sizes', () => {
      it('copies json.sizes correctly [1,2,3]', () => {
        const net = new NeuralNetwork();
        net.sizes = [1,2,3];
        const json = net.toJSON();
        assert.deepEqual(json.sizes, [1,2,3]);
      });
      it('copies json.sizes correctly [3,2,1]', () => {
        const net = new NeuralNetwork();
        net.sizes = [3,2,1];
        const json = net.toJSON();
        assert.deepEqual(json.sizes, [3,2,1]);
      });
    });

    describe('json.layers[0] (input layer)', () => {
      describe('as array', () => {
        it('describes it with integer keys', () => {
          const net = new NeuralNetwork();
          net.sizes = [3];
          const json = net.toJSON();
          assert.deepEqual(json.layers[0], { 0: {}, 1: {}, 2: {} });
        });
      });
      describe('as object', () => {
        it('describes it with string keys', () => {
          const net = new NeuralNetwork();
          net.inputLookup = { zero: 0, one: 1, two: 2 };
          net.inputLookupLength = 3;
          net.sizes = [];
          const json = net.toJSON();
          assert.deepEqual(json.layers[0], { zero: {}, one: {}, two: {} });
        });
      });
    });

    describe('hidden layers', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        assert.equal(Object.keys(json.layers[1]).length, net.biases[1].length);
        assert.equal(json.layers[1][0].bias, net.biases[1][0]);
        assert.equal(json.layers[1][1].bias, net.biases[1][1]);
        assert.equal(json.layers[1][2].bias, net.biases[1][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        assert.equal(Object.keys(json.layers[1]).length, net.weights[1].length);
        assert.deepEqual(json.layers[1][0].weights, net.weights[1][0]);
        assert.deepEqual(json.layers[1][1].weights, net.weights[1][1]);
        assert.deepEqual(json.layers[1][2].weights, net.weights[1][2]);
      });
    });

    describe('output layer', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        assert.equal(Object.keys(json.layers[2]).length, net.biases[2].length);
        assert.equal(json.layers[2][0].bias, net.biases[2][0]);
        assert.equal(json.layers[2][1].bias, net.biases[2][1]);
        assert.equal(json.layers[2][2].bias, net.biases[2][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        assert.equal(Object.keys(json.layers[2]).length, net.weights[2].length);
        assert.deepEqual(json.layers[2][0].weights, net.weights[2][0]);
        assert.deepEqual(json.layers[2][1].weights, net.weights[2][1]);
        assert.deepEqual(json.layers[2][2].weights, net.weights[2][2]);
      });
    });

    describe('json.activation', () => {
      it('exports default correctly', () => {
        const net = new NeuralNetwork();
        net.sizes = [];
        assert.equal(net.activation, NeuralNetwork.defaults.activation);
        const json = net.toJSON();
        assert.equal(json.activation, NeuralNetwork.defaults.activation);
      });
      it('exports non-default correctly', () => {
        const net = new NeuralNetwork({ activation: 'leaky-relu' });
        net.sizes = [];
        assert.equal(net.activation, 'leaky-relu');
        const json = net.toJSON();
        assert.equal(json.activation, 'leaky-relu');
      });
    });

    describe('.trainOpts', () => {
      describe('.iterations', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.iterations, NeuralNetwork.trainDefaults.iterations);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { iterations: 3 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.iterations, 3);
        });
      });

      describe('.errorThresh', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.errorThresh, NeuralNetwork.trainDefaults.errorThresh);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { errorThresh: 0.05 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.errorThresh, 0.05);
        });
      });

      describe('.log', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.log, NeuralNetwork.trainDefaults.log);
        });
        it('copies custom value when defined as boolean', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = true;
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          assert.equal(json.trainOpts.log, log);
        });
        it('uses `true` when used with a custom function', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = () => {};
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          assert.equal(json.trainOpts.log, true);
        });
      });

      describe('.logPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.logPeriod, NeuralNetwork.trainDefaults.logPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { logPeriod: 4 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.logPeriod, 4);
        });
      });

      describe('.learningRate', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.learningRate, NeuralNetwork.trainDefaults.learningRate);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { learningRate: 0.72 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.learningRate, 0.72);
        });
      });

      describe('.momentum', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.momentum, NeuralNetwork.trainDefaults.momentum);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { momentum: 0.313 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.momentum, 0.313);
        });
      });

      describe('.callback', () => {
        it('does not copy', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.callback, undefined);
        });
        it('does not copy when used with custom value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const callback = () => {};
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { callback });
          const json = net.toJSON();
          assert.equal(json.trainOpts.callback, undefined);
        });
      });

      describe('.callbackPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(json.trainOpts.callbackPeriod, NeuralNetwork.trainDefaults.callbackPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { callbackPeriod: 50 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.callbackPeriod, 50);
        });
      });

      describe('.timeout', () => {
        it('uses undefined in place of Infinity when no value used for default value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          assert.equal(NeuralNetwork.trainDefaults.timeout, Infinity);
          assert.equal(json.trainOpts.timeout, undefined);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { timeout: 50 });
          const json = net.toJSON();
          assert.equal(json.trainOpts.timeout, 50);
        });
      });
    });
  });

  describe('.fromJSON() deserialization', () => {
    describe('json.sizes', () => {
      it('copies json.sizes correctly [1,2,3]', () => {
        const net = new NeuralNetwork();
        net.sizes = [1,2,3];
        net.initialize();
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.deepEqual(newNet.sizes, [1,2,3]);
      });
      it('copies json.sizes correctly [3,2,1]', () => {
        const net = new NeuralNetwork();
        net.sizes = [3,2,1];
        net.initialize();
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.deepEqual(newNet.sizes, [3,2,1]);
      });
    });

    describe('json.layers[0] (input layer)', () => {
      describe('as array', () => {
        it('describes it with integer keys', () => {
          const net = new NeuralNetwork();
          net.sizes = [3];
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.deepEqual(newNet.layers[0], { 0: {}, 1: {}, 2: {} });
        });
      });
      describe('as object', () => {
        it('describes it with string keys', () => {
          const net = new NeuralNetwork();
          net.inputLookup = { zero: 0, one: 1, two: 2 };
          net.inputLookupLength = 3;
          net.sizes = [];
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.deepEqual(newNet.layers[0], { zero: {}, one: {}, two: {} });
        });
      });
    });

    describe('hidden layers', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.equal(newNet.biases[1].length, net.biases[1].length);
        assert.equal(newNet.biases[1][0], net.biases[1][0]);
        assert.equal(newNet.biases[1][1], net.biases[1][1]);
        assert.equal(newNet.biases[1][2], net.biases[1][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.equal(newNet.weights[1].length, net.weights[1].length);
        assert.deepEqual(newNet.weights[1][0], net.weights[1][0]);
        assert.deepEqual(newNet.weights[1][1], net.weights[1][1]);
        assert.deepEqual(newNet.weights[1][2], net.weights[1][2]);
      });
    });

    describe('output layer', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.equal(newNet.biases[2].length, net.biases[2].length);
        assert.equal(newNet.biases[2][0], net.biases[2][0]);
        assert.equal(newNet.biases[2][1], net.biases[2][1]);
        assert.equal(newNet.biases[2][2], net.biases[2][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1,2], output: [1,2,3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.equal(newNet.weights[2].length, net.weights[2].length);
        assert.deepEqual(newNet.weights[2][0], net.weights[2][0]);
        assert.deepEqual(newNet.weights[2][1], net.weights[2][1]);
        assert.deepEqual(newNet.weights[2][2], net.weights[2][2]);
      });
    });

    describe('json.activation', () => {
      it('exports default correctly', () => {
        const net = new NeuralNetwork();
        net.sizes = [];
        assert.equal(net.activation, NeuralNetwork.defaults.activation);
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.equal(newNet.activation, NeuralNetwork.defaults.activation);
      });
      it('exports non-default correctly', () => {
        const net = new NeuralNetwork({ activation: 'leaky-relu' });
        net.sizes = [];
        assert.equal(net.activation, 'leaky-relu');
        const json = net.toJSON();
        const newNet = new NeuralNetwork()
          .fromJSON(json);
        assert.equal(newNet.activation, 'leaky-relu');
      });
    });

    describe('.trainOpts', () => {
      describe('.iterations', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.iterations, NeuralNetwork.trainDefaults.iterations);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { iterations: 3 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.iterations, 3);
        });
      });

      describe('.errorThresh', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.errorThresh, NeuralNetwork.trainDefaults.errorThresh);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { errorThresh: 0.05 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.errorThresh, 0.05);
        });
      });

      describe('.log', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.log, NeuralNetwork.trainDefaults.log);
        });
        it('uses console.log for `true`', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = true;
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.log, console.log);
        });
        it('reverts to console.log when used with custom function', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = () => {};
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.log, console.log);
        });
      });

      describe('.logPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.logPeriod, NeuralNetwork.trainDefaults.logPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { logPeriod: 4 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.logPeriod, 4);
        });
      });

      describe('.learningRate', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.learningRate, NeuralNetwork.trainDefaults.learningRate);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { learningRate: 0.72 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.learningRate, 0.72);
        });
      });

      describe('.momentum', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.momentum, NeuralNetwork.trainDefaults.momentum);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { momentum: 0.313 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.momentum, 0.313);
        });
      });

      describe('.callback', () => {
        it('does not copy', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.callback, undefined);
        });
        it('does not copy when used with custom value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const callback = () => {};
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { callback });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.callback, undefined);
        });
      });

      describe('.callbackPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.callbackPeriod, NeuralNetwork.trainDefaults.callbackPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { callbackPeriod: 50 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.callbackPeriod, 50);
        });
      });

      describe('.timeout', () => {
        it('uses undefined in place of Infinity when no value used for default value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(NeuralNetwork.trainDefaults.timeout, Infinity);
          assert.equal(newNet.trainOpts.timeout, Infinity);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => {};
          net.train([{ input: [], output: [] }], { timeout: 50 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork()
            .fromJSON(json);
          assert.equal(newNet.trainOpts.timeout, 50);
        });
      });
    });

    it('can run originalNet, and serializedNet, with same output', () => {
      const net = new NeuralNetwork({ hiddenLayers: [3] });
      net.train([
        { input: [1,1,1], output: [1,1,1] }
      ], {
        iterations: 3
      });
      const input = [1,1,1];
      const json = net.toJSON();
      const newNet = new NeuralNetwork().fromJSON(json);
      const output1 = net.run(input);
      const output2 = newNet.run(input);
      assert.deepEqual(output2, output1,
        'loading json serialized network failed');
    });

    it('if json.trainOpts is not set, ._updateTrainingOptions() is not called abd activation defaults to sigmoid', () => {
      const net = new NeuralNetwork();
      net._updateTrainingOptions = () => {
        throw new Error('_updateTrainingOptions was called');
      };
      net.fromJSON({ sizes: [], layers: [] });
      assert(net.activation === 'sigmoid');
    })
  });
});


describe('default net json', () => {
  const originalNet = new NeuralNetwork({ activation: 'leaky-relu' });

  originalNet.train([
    {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }, {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }
  ], { timeout: 4 });

  const serialized = originalNet.toJSON();
  const serializedNet = new NeuralNetwork()
    .fromJSON(
      JSON.parse(
        JSON.stringify(serialized)
      )
    );

  const input = {'0' : Math.random(), b: Math.random()};

  describe('.trainOpts', () => {
    it('training options iterations', () => {
      assert.equal(originalNet.trainOpts.iterations, serializedNet.trainOpts.iterations, `originalNet.trainOpts are: ${originalNet.trainOpts.iterations} serializedNet should be the same but are: ${serializedNet.trainOpts.iterations}`);
    });

    it('training options errorThresh', () => {
      assert.equal(originalNet.trainOpts.errorThresh, serializedNet.trainOpts.errorThresh, `originalNet.trainOpts are: ${originalNet.trainOpts.errorThresh} serializedNet should be the same but are: ${serializedNet.trainOpts.errorThresh}`);
    });

    it('training options log', () => {
      // Should have inflated to console.log
      assert.equal(originalNet.trainOpts.log, serializedNet.trainOpts.log, `log are: ${originalNet.trainOpts.log} serializedNet should be the same but are: ${serializedNet.trainOpts.log}`);
    });

    it('training options logPeriod', () => {
      assert.equal(originalNet.trainOpts.logPeriod, serializedNet.trainOpts.logPeriod, `originalNet.trainOpts are: ${originalNet.trainOpts.logPeriod} serializedNet should be the same but are: ${serializedNet.trainOpts.logPeriod}`);
    });

    it('training options learningRate', () => {
      assert.equal(originalNet.trainOpts.learningRate, serializedNet.trainOpts.learningRate, `originalNet.trainOpts are: ${originalNet.trainOpts.learningRate} serializedNet should be the same but are: ${serializedNet.trainOpts.learningRate}`);
    });

    it('training options momentum', () => {
      assert.equal(originalNet.trainOpts.momentum, serializedNet.trainOpts.momentum, `originalNet.trainOpts are: ${originalNet.trainOpts.momentum} serializedNet should be the same but are: ${serializedNet.trainOpts.momentum}`);
    });

    it('training options callback', () => {
      assert.equal(originalNet.trainOpts.callback, serializedNet.trainOpts.callback, `originalNet.trainOpts are: ${originalNet.trainOpts.callback} serializedNet should be the same but are: ${serializedNet.trainOpts.callback}`);
    });

    it('training options callbackPeriod', () => {
      assert.equal(originalNet.trainOpts.callbackPeriod, serializedNet.trainOpts.callbackPeriod, `originalNet.trainOpts are: ${originalNet.trainOpts.callbackPeriod} serializedNet should be the same but are: ${serializedNet.trainOpts.callbackPeriod}`);
    });

    it('training options timeout', () => {
      assert.equal(originalNet.trainOpts.timeout, serializedNet.trainOpts.timeout, `originalNet.trainOpts are: ${originalNet.trainOpts.timeout} serializedNet should be the same but are: ${serializedNet.trainOpts.timeout}`);
    });
  });

  it('can run originalNet, and serializedNet, with same output', () => {
    const output1 = originalNet.run(input);
    const output2 = serializedNet.run(input);
    assert.deepEqual(output2, output1,
      'loading json serialized network failed');
  });

  it('if json.trainOpts is not set, ._updateTrainingOptions() is not called and activation defaults to sigmoid', () => {
    const net = new NeuralNetwork();
    net._updateTrainingOptions = () => {
      throw new Error('_updateTrainingOptions was called');
    };
    net.fromJSON({ sizes: [], layers: [] });
    assert(net.activation === 'sigmoid');
  });
});
