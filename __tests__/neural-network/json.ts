import { NeuralNetwork } from '../../src/neural-network';

function typedArrayToObject(value: Float32Array) {
  return JSON.parse(JSON.stringify(value));
}

function assertTypedArraysArrayAreEqual(a: Float32Array[], b: Float32Array[]) {
  expect(a.length).toBe(b.length);

  for (const [indexTypedArray, aTypedArray] of a.entries()) {
    const bTypedArray = b[indexTypedArray];

    expect(aTypedArray.length).toBe(bTypedArray.length);

    for (const [
      indexTypedArrayElement,
      aTypedArrayElement,
    ] of aTypedArray.entries()) {
      expect(aTypedArrayElement).toBe(bTypedArray[indexTypedArrayElement]);
    }
  }
}

describe('JSON', () => {
  describe('.toJSON() serialization', () => {
    describe('json.sizes', () => {
      it('copies json.sizes correctly [1,2,3]', () => {
        const net = new NeuralNetwork();
        net.sizes = [1, 2, 3];
        const json = net.toJSON();
        expect(json.sizes).toEqual([1, 2, 3]);
      });
      it('copies json.sizes correctly [3,2,1]', () => {
        const net = new NeuralNetwork();
        net.sizes = [3, 2, 1];
        const json = net.toJSON();
        expect(json.sizes).toEqual([3, 2, 1]);
      });
    });

    describe('json.layers[0] (input layer)', () => {
      describe('as array', () => {
        it('describes it with integer keys', () => {
          const net = new NeuralNetwork();
          net.sizes = [3];
          const json = net.toJSON();
          expect(json.layers[0]).toEqual({ 0: {}, 1: {}, 2: {} });
        });
      });
      describe('as object', () => {
        it('describes it with string keys', () => {
          const net = new NeuralNetwork();
          net.inputLookup = { zero: 0, one: 1, two: 2 };
          net.inputLookupLength = 3;
          net.sizes = [];
          const json = net.toJSON();
          expect(json.layers[0]).toEqual({ zero: {}, one: {}, two: {} });
        });
      });
    });

    describe('hidden layers', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();

        // TODO: remove type coercion later when NeuralNetwork is typed
        const biases = net.biases as Float32Array[];

        expect(Object.keys(json.layers[1]).length).toBe(biases[1].length);
        expect(json.layers[1][0].bias).toBe(biases[1][0]);
        expect(json.layers[1][1].bias).toBe(biases[1][1]);
        expect(json.layers[1][2].bias).toBe(biases[1][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();

        // TODO: remove type coercion later when NeuralNetwork is typed
        const weights = net.weights as Float32Array[][];

        expect(Object.keys(json.layers[1]).length).toBe(weights[1].length);
        expect(json.layers[1][0].weights).toEqual(
          typedArrayToObject(weights[1][0])
        );
        expect(json.layers[1][1].weights).toEqual(
          typedArrayToObject(weights[1][1])
        );
        expect(json.layers[1][2].weights).toEqual(
          typedArrayToObject(weights[1][2])
        );
      });
    });

    describe('output layer', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();

        // TODO: remove type coercion later when NeuralNetwork is typed
        const biases = net.biases as Float32Array[];

        expect(Object.keys(json.layers[2]).length).toBe(biases[2].length);
        expect(json.layers[2][0].bias).toBe(biases[2][0]);
        expect(json.layers[2][1].bias).toBe(biases[2][1]);
        expect(json.layers[2][2].bias).toBe(biases[2][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();

        // TODO: remove type coercion later when NeuralNetwork is typed
        const weights = net.weights as Float32Array[][];

        expect(Object.keys(json.layers[2]).length).toBe(weights[2].length);
        expect(json.layers[2][0].weights).toEqual(
          typedArrayToObject(weights[2][0])
        );
        expect(json.layers[2][1].weights).toEqual(
          typedArrayToObject(weights[2][1])
        );
        expect(json.layers[2][2].weights).toEqual(
          typedArrayToObject(weights[2][2])
        );
      });
    });

    describe('json.activation', () => {
      it('exports default correctly', () => {
        const net = new NeuralNetwork();
        net.sizes = [];
        expect(net.activation).toBe(NeuralNetwork.defaults.activation);
        const json = net.toJSON();
        expect(json.activation).toBe(NeuralNetwork.defaults.activation);
      });
      it('exports non-default correctly', () => {
        const net = new NeuralNetwork({ activation: 'leaky-relu' });
        net.sizes = [];
        expect(net.activation).toBe('leaky-relu');
        const json = net.toJSON();
        expect(json.activation).toBe('leaky-relu');
      });
    });

    describe('.trainOpts', () => {
      describe('.iterations', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.iterations).toBe(
            NeuralNetwork.trainDefaults.iterations
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { iterations: 3 });
          const json = net.toJSON();
          expect(json.trainOpts.iterations).toBe(3);
        });
      });

      describe('.errorThresh', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.errorThresh).toBe(
            NeuralNetwork.trainDefaults.errorThresh
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { errorThresh: 0.05 });
          const json = net.toJSON();
          expect(json.trainOpts.errorThresh).toBe(0.05);
        });
      });

      describe('.log', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.log).toBe(NeuralNetwork.trainDefaults.log);
        });
        it('copies custom value when defined as boolean', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = true;
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          expect(json.trainOpts.log).toBe(log);
        });
        it('uses `true` when used with a custom function', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = () => {};
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          expect(json.trainOpts.log).toBe(true);
        });
      });

      describe('.logPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.logPeriod).toBe(
            NeuralNetwork.trainDefaults.logPeriod
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { logPeriod: 4 });
          const json = net.toJSON();
          expect(json.trainOpts.logPeriod).toBe(4);
        });
      });

      describe('.learningRate', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.learningRate).toBe(
            NeuralNetwork.trainDefaults.learningRate
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { learningRate: 0.72 });
          const json = net.toJSON();
          expect(json.trainOpts.learningRate).toBe(0.72);
        });
      });

      describe('.momentum', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.momentum).toBe(
            NeuralNetwork.trainDefaults.momentum
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { momentum: 0.313 });
          const json = net.toJSON();
          expect(json.trainOpts.momentum).toBe(0.313);
        });
      });

      describe('.callback', () => {
        it('does not copy', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.callback).toBe(undefined);
        });
        it('does not copy when used with custom value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const callback = () => {};
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { callback });
          const json = net.toJSON();
          expect(json.trainOpts.callback).toBe(undefined);
        });
      });

      describe('.callbackPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.callbackPeriod).toBe(
            NeuralNetwork.trainDefaults.callbackPeriod
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { callbackPeriod: 50 });
          const json = net.toJSON();
          expect(json.trainOpts.callbackPeriod).toBe(50);
        });
      });

      describe('.timeout', () => {
        it('uses undefined in place of Infinity when no value used for default value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(NeuralNetwork.trainDefaults.timeout).toBe(Infinity);
          expect(json.trainOpts.timeout).toBe(undefined);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { timeout: 50 });
          const json = net.toJSON();
          expect(json.trainOpts.timeout).toBe(50);
        });
      });
    });
  });

  describe('.fromJSON() deserialization', () => {
    describe('json.sizes', () => {
      it('copies json.sizes correctly [1,2,3]', () => {
        const net = new NeuralNetwork();
        net.sizes = [1, 2, 3];
        net.initialize();
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);
        expect(newNet.sizes).toEqual([1, 2, 3]);
      });
      it('copies json.sizes correctly [3,2,1]', () => {
        const net = new NeuralNetwork();
        net.sizes = [3, 2, 1];
        net.initialize();
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);
        expect(newNet.sizes).toEqual([3, 2, 1]);
      });
    });

    describe('json.layers[0] (input layer)', () => {
      describe('as array', () => {
        it('describes it with integer keys', () => {
          const net = new NeuralNetwork();
          net.sizes = [3];
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // @ts-expect-error Property 'layers' does not exist on type 'NeuralNetwork'
          expect(newNet.layers[0]).toEqual({ 0: {}, 1: {}, 2: {} });
        });
      });
      describe('as object', () => {
        it('describes it with string keys', () => {
          const net = new NeuralNetwork();
          net.inputLookup = { zero: 0, one: 1, two: 2 };
          net.inputLookupLength = 3;
          net.sizes = [];
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // @ts-expect-error Property 'layers' does not exist on type 'NeuralNetwork'
          expect(newNet.layers[0]).toEqual({ zero: {}, one: {}, two: {} });
        });
      });
    });

    describe('hidden layers', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);

        // TODO: remove type coercion later when NeuralNetwork is typed
        const biases = net.biases as Float32Array[];
        const newNetBiases = newNet.biases as Float32Array[];

        expect(newNetBiases[1].length).toBe(biases[1].length);
        expect(newNetBiases[1][0]).toBe(biases[1][0]);
        expect(newNetBiases[1][1]).toBe(biases[1][1]);
        expect(newNetBiases[1][2]).toBe(biases[1][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);

        // TODO: remove type coercion later when NeuralNetwork is typed
        const weights = net.weights as Float32Array[][];
        const newNetWeights = newNet.weights as Float32Array[][];

        assertTypedArraysArrayAreEqual(newNetWeights[2], weights[2]);
      });
    });

    describe('output layer', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);

        // TODO: remove type coercion later when NeuralNetwork is typed
        const biases = net.biases as Float32Array[];
        const newNetBiases = newNet.biases as Float32Array[];

        expect(newNetBiases[2].length).toBe(biases[2].length);
        expect(newNetBiases[2][0]).toBe(biases[2][0]);
        expect(newNetBiases[2][1]).toBe(biases[2][1]);
        expect(newNetBiases[2][2]).toBe(biases[2][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([{ input: [1, 2], output: [1, 2, 3] }]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);

        // TODO: remove type coercion later when NeuralNetwork is typed
        const weights = net.weights as Float32Array[][];
        const newNetWeights = newNet.weights as Float32Array[][];

        assertTypedArraysArrayAreEqual(newNetWeights[2], weights[2]);
      });
    });

    describe('json.activation', () => {
      it('exports default correctly', () => {
        const net = new NeuralNetwork();
        net.sizes = [];
        expect(net.activation).toBe(NeuralNetwork.defaults.activation);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);
        expect(newNet.activation).toBe(NeuralNetwork.defaults.activation);
      });
      it('exports non-default correctly', () => {
        const net = new NeuralNetwork({ activation: 'leaky-relu' });
        net.sizes = [];
        expect(net.activation).toBe('leaky-relu');
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);
        expect(newNet.activation).toBe('leaky-relu');
      });
    });

    describe('.trainOpts', () => {
      describe('.iterations', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).iterations
          ).toBe(NeuralNetwork.trainDefaults.iterations);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { iterations: 3 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).iterations
          ).toBe(3);
        });
      });

      describe('.errorThresh', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).errorThresh
          ).toBe(NeuralNetwork.trainDefaults.errorThresh);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { errorThresh: 0.05 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).errorThresh
          ).toBe(0.05);
        });
      });

      describe('.log', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).log
          ).toBe(NeuralNetwork.trainDefaults.log);
        });
        it('uses net.logTrainingStatus for `true`', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = true;
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).log
          ).toBe(net.logTrainingStatus);
        });
        it('reverts to net.logTrainingStatus when used with custom function', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = () => {};
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).log
          ).toBe(net.logTrainingStatus);
        });
      });

      describe('.logPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).logPeriod
          ).toBe(NeuralNetwork.trainDefaults.logPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { logPeriod: 4 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).logPeriod
          ).toBe(4);
        });
      });

      describe('.learningRate', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults)
              .learningRate
          ).toBe(NeuralNetwork.trainDefaults.learningRate);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { learningRate: 0.72 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults)
              .learningRate
          ).toBe(0.72);
        });
      });

      describe('.momentum', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).momentum
          ).toBe(NeuralNetwork.trainDefaults.momentum);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { momentum: 0.313 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).momentum
          ).toBe(0.313);
        });
      });

      describe('.callback', () => {
        it('does not copy', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).callback
          ).toBe(null);
        });
        it('does not copy when used with custom value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const callback = () => {};
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { callback });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).callback
          ).toBe(null);
        });
      });

      describe('.callbackPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults)
              .callbackPeriod
          ).toBe(NeuralNetwork.trainDefaults.callbackPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { callbackPeriod: 50 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults)
              .callbackPeriod
          ).toBe(50);
        });
      });

      describe('.timeout', () => {
        it('uses undefined in place of Infinity when no value used for default value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(NeuralNetwork.trainDefaults.timeout).toBe(Infinity);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).timeout
          ).toBe(Infinity);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { timeout: 50 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          // TODO: remove type coercion later when NeuralNetwork is typed
          expect(
            (newNet.trainOpts as typeof NeuralNetwork.trainDefaults).timeout
          ).toBe(50);
        });
      });
    });

    it('can run originalNet, and serializedNet, with same output', () => {
      const net = new NeuralNetwork({ hiddenLayers: [3] });
      net.train([{ input: [1, 1, 1], output: [1, 1, 1] }], {
        iterations: 3,
      });
      const input = [1, 1, 1];
      const json = net.toJSON();
      const newNet = new NeuralNetwork().fromJSON(json);
      const output1 = net.run(input);
      const output2 = newNet.run(input);
      expect(output2).toEqual(output1);
    });

    it('if json.trainOpts is not set, ._updateTrainingOptions() is not called abd activation defaults to sigmoid', () => {
      const net = new NeuralNetwork();
      // @ts-expect-error Property '_updateTrainingOptions' does not exist on type 'NeuralNetwork'
      // This is a private function
      net._updateTrainingOptions = () => {
        throw new Error('_updateTrainingOptions was called');
      };
      net.fromJSON({ sizes: [], layers: [] });
      expect(net.activation === 'sigmoid').toBeTruthy();
    });
  });
});

describe('default net json', () => {
  const originalNet = new NeuralNetwork({ activation: 'leaky-relu' });

  originalNet.train(
    [
      {
        input: { 0: Math.random(), b: Math.random() },
        output: { c: Math.random(), 0: Math.random() },
      },
      {
        input: { 0: Math.random(), b: Math.random() },
        output: { c: Math.random(), 0: Math.random() },
      },
    ],
    { timeout: 4 }
  );

  const serialized = originalNet.toJSON();
  const serializedNet = new NeuralNetwork().fromJSON(
    JSON.parse(JSON.stringify(serialized))
  );

  const input = { 0: Math.random(), b: Math.random() };

  // TODO: remove type coercion later when NeuralNetwork is typed
  const originalNetTrainOpts = originalNet.trainOpts as typeof NeuralNetwork.trainDefaults;
  const serializedNetTrainOpts = serializedNet.trainOpts as typeof NeuralNetwork.trainDefaults;

  describe('.trainOpts', () => {
    it('training options iterations', () => {
      expect(originalNetTrainOpts.iterations).toBe(
        serializedNetTrainOpts.iterations
      );
    });

    it('training options errorThresh', () => {
      expect(originalNetTrainOpts.errorThresh).toBe(
        serializedNetTrainOpts.errorThresh
      );
    });

    it('training options log', () => {
      expect(originalNetTrainOpts.log).toBe(serializedNetTrainOpts.log);
    });

    it('training options logPeriod', () => {
      expect(originalNetTrainOpts.logPeriod).toBe(
        serializedNetTrainOpts.logPeriod
      );
    });

    it('training options learningRate', () => {
      expect(originalNetTrainOpts.learningRate).toBe(
        serializedNetTrainOpts.learningRate
      );
    });

    it('training options momentum', () => {
      expect(originalNetTrainOpts.momentum).toBe(
        serializedNetTrainOpts.momentum
      );
    });

    it('training options callback', () => {
      expect(originalNetTrainOpts.callback).toBe(
        serializedNetTrainOpts.callback
      );
    });

    it('training options callbackPeriod', () => {
      expect(originalNetTrainOpts.callbackPeriod).toBe(
        serializedNetTrainOpts.callbackPeriod
      );
    });

    it('training options timeout', () => {
      expect(originalNetTrainOpts.timeout).toBe(serializedNetTrainOpts.timeout);
    });
  });

  it('can run originalNet, and serializedNet, with same output', () => {
    const output1 = originalNet.run(input);
    const output2 = serializedNet.run(input);
    expect(output2).toEqual(output1);
  });

  it('if json.trainOpts is not set, ._updateTrainingOptions() is not called and activation defaults to sigmoid', () => {
    const net = new NeuralNetwork();
    // @ts-expect-error Property '_updateTrainingOptions' does not exist on type 'NeuralNetwork'
    // This is a private function
    net._updateTrainingOptions = () => {
      throw new Error('_updateTrainingOptions was called');
    };
    net.fromJSON({ sizes: [], layers: [] });
    expect(net.activation === 'sigmoid').toBeTruthy();
  });
});
