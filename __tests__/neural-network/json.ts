import {
  NeuralNetwork,
  defaults,
  trainDefaults,
} from '../../src/neural-network';

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

    describe('hidden layers', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const layer1Biases = net.biases[1];
        const jsonLayer1Bias = json.layers[1].biases;
        expect(jsonLayer1Bias.length).toBe(layer1Biases.length);
        expect(jsonLayer1Bias[0]).toBe(layer1Biases[0]);
        expect(jsonLayer1Bias[1]).toBe(layer1Biases[1]);
        expect(jsonLayer1Bias[2]).toBe(layer1Biases[2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const layer1Weights = net.weights[1];
        const jsonLayer1Weights = json.layers[1].weights;
        expect(jsonLayer1Weights.length).toBe(layer1Weights.length);
        expect(jsonLayer1Weights[0]).toEqual(Array.from(layer1Weights[0]));
        expect(jsonLayer1Weights[1]).toEqual(Array.from(layer1Weights[1]));
        expect(jsonLayer1Weights[2]).toEqual(Array.from(layer1Weights[2]));
      });
    });

    describe('output layer', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const layer2Biases = net.biases[2];
        const jsonLayer2Biases = json.layers[2].biases;

        expect(jsonLayer2Biases.length).toBe(layer2Biases.length);
        expect(jsonLayer2Biases[0]).toBe(layer2Biases[0]);
        expect(jsonLayer2Biases[1]).toBe(layer2Biases[1]);
        expect(jsonLayer2Biases[2]).toBe(layer2Biases[2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const layer2Weights = net.weights[2];
        const jsonLayer2Weights = json.layers[2].weights;
        expect(jsonLayer2Weights.length).toBe(layer2Weights.length);

        expect(jsonLayer2Weights[0]).toEqual(Array.from(layer2Weights[0]));
        expect(jsonLayer2Weights[1]).toEqual(Array.from(layer2Weights[1]));
        expect(jsonLayer2Weights[2]).toEqual(Array.from(layer2Weights[2]));
      });
    });

    describe('.options', () => {
      describe('.inputSize', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          expect(net.toJSON().options.inputSize).toEqual(defaults().inputSize);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ inputSize: 7 });
          expect(net.toJSON().options.inputSize).toEqual(7);
        });
      });
      describe('.outputSize', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          expect(net.toJSON().options.outputSize).toEqual(
            defaults().outputSize
          );
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ outputSize: 7 });
          expect(net.toJSON().options.outputSize).toEqual(7);
        });
      });
      describe('.binaryThresh', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          expect(net.toJSON().options.binaryThresh).toEqual(
            defaults().binaryThresh
          );
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ binaryThresh: 7 });
          expect(net.toJSON().options.binaryThresh).toEqual(7);
        });
      });
      describe('.hiddenLayers', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          expect(net.toJSON().options.hiddenLayers).toEqual(
            defaults().hiddenLayers
          );
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ hiddenLayers: [7, 8, 9] });
          expect(net.toJSON().options.hiddenLayers).toEqual([7, 8, 9]);
        });
      });
    });
    describe('.trainOpts', () => {
      describe('.activation', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          net.sizes = [];
          expect(net.trainOpts.activation).toBe(trainDefaults().activation);
          const json = net.toJSON();
          expect(json.trainOpts.activation).toBe(trainDefaults().activation);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ activation: 'leaky-relu' });
          net.sizes = [];
          expect(net.trainOpts.activation).toBe('leaky-relu');
          const json = net.toJSON();
          expect(json.trainOpts.activation).toBe('leaky-relu');
        });
      });
      describe('.iterations', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.iterations).toBe(trainDefaults().iterations);
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
          expect(json.trainOpts.errorThresh).toBe(trainDefaults().errorThresh);
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
          expect(json.trainOpts.log).toEqual(trainDefaults().log);
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
          expect(json.trainOpts.logPeriod).toBe(trainDefaults().logPeriod);
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
            trainDefaults().learningRate
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
          expect(json.trainOpts.momentum).toBe(trainDefaults().momentum);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { momentum: 0.313 });
          const json = net.toJSON();
          expect(json.trainOpts.momentum).toBe(0.313);
        });
      });

      describe('.callbackPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          expect(json.trainOpts.callbackPeriod).toBe(
            trainDefaults().callbackPeriod
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
          expect(trainDefaults().timeout).toBe(Infinity);
          expect(json.trainOpts.timeout).toBe('Infinity');
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

    describe('hidden layers', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);
        const biases = net.biases;
        const newNetBiases = newNet.biases;

        expect(newNetBiases[1].length).toBe(biases[1].length);
        expect(newNetBiases[1][0]).toBe(biases[1][0]);
        expect(newNetBiases[1][1]).toBe(biases[1][1]);
        expect(newNetBiases[1][2]).toBe(biases[1][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(
          JSON.parse(JSON.stringify(json))
        );
        const layer2Weights = net.weights[2];
        const newNetLayer2Weights = newNet.weights[2];
        expect(layer2Weights).toEqual(newNetLayer2Weights);
      });
    });

    describe('output layer', () => {
      it('copies biases correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(json);
        const biases = net.biases;
        const newNetBiases = newNet.biases;

        expect(newNetBiases[2].length).toBe(biases[2].length);
        expect(newNetBiases[2][0]).toBe(biases[2][0]);
        expect(newNetBiases[2][1]).toBe(biases[2][1]);
        expect(newNetBiases[2][2]).toBe(biases[2][2]);
      });
      it('copies weights correctly', () => {
        const net = new NeuralNetwork({ hiddenLayers: [3] });
        net.verifyIsInitialized([
          {
            input: Float32Array.from([1, 2]),
            output: Float32Array.from([1, 2, 3]),
          },
        ]);
        const json = net.toJSON();
        const newNet = new NeuralNetwork().fromJSON(
          JSON.parse(JSON.stringify(json))
        );
        const layer2Weights = net.weights[2];
        const newNetLayer2Weights = newNet.weights[2];

        expect(newNetLayer2Weights).toEqual(layer2Weights);
      });
    });

    describe('.options', () => {
      describe('.inputSize', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          net.sizes = [1];
          expect(net.options.inputSize).toBe(defaults().inputSize);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.inputSize).toBe(defaults().inputSize);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ inputSize: 4 });
          net.sizes = [1];
          expect(net.options.inputSize).toBe(4);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.inputSize).toBe(4);
        });
      });
      describe('.outputSize', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          net.sizes = [1];
          expect(net.options.outputSize).toBe(defaults().outputSize);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.outputSize).toBe(defaults().outputSize);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ outputSize: 4 });
          net.sizes = [1];
          expect(net.options.outputSize).toBe(4);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.outputSize).toBe(4);
        });
      });
      describe('.binaryThresh', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          net.sizes = [1];
          expect(net.options.binaryThresh).toBe(defaults().binaryThresh);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.binaryThresh).toBe(defaults().binaryThresh);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ binaryThresh: 4 });
          net.sizes = [1];
          expect(net.options.binaryThresh).toBe(4);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.binaryThresh).toBe(4);
        });
      });
      describe('.hiddenLayers', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          net.sizes = [1];
          expect(net.options.hiddenLayers).toEqual(defaults().hiddenLayers);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.hiddenLayers).toEqual(defaults().hiddenLayers);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ hiddenLayers: [4, 5, 6] });
          net.sizes = [1];
          expect(net.options.hiddenLayers).toEqual([4, 5, 6]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.options.hiddenLayers).toEqual([4, 5, 6]);
        });
      });
    });
    describe('.trainOpts', () => {
      describe('.activation', () => {
        it('exports default correctly', () => {
          const net = new NeuralNetwork();
          net.sizes = [1];
          expect(net.trainOpts.activation).toBe(trainDefaults().activation);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.activation).toBe(trainDefaults().activation);
        });
        it('exports non-default correctly', () => {
          const net = new NeuralNetwork({ activation: 'leaky-relu' });
          net.sizes = [1];
          expect(net.trainOpts.activation).toBe('leaky-relu');
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.activation).toBe('leaky-relu');
        });
      });
      describe('.iterations', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.iterations).toBe(trainDefaults().iterations);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { iterations: 3 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.iterations).toBe(3);
        });
      });

      describe('.errorThresh', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.errorThresh).toBe(
            trainDefaults().errorThresh
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { errorThresh: 0.05 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.errorThresh).toBe(0.05);
        });
      });

      describe('.log', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.log).toBe(trainDefaults().log);
        });
        it('uses net.logTrainingStatus for `true`', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = true;
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.log).toBe(net.logTrainingStatus);
        });
        it('reverts to net.logTrainingStatus when used with custom function', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const log = () => {};
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { log });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.log).toBe(net.logTrainingStatus);
        });
      });

      describe('.logPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.logPeriod).toBe(trainDefaults().logPeriod);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { logPeriod: 4 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.logPeriod).toBe(4);
        });
      });

      describe('.learningRate', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.learningRate).toBe(
            trainDefaults().learningRate
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { learningRate: 0.72 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.learningRate).toBe(0.72);
        });
      });

      describe('.momentum', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.momentum).toBe(trainDefaults().momentum);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { momentum: 0.313 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.momentum).toBe(0.313);
        });
      });

      describe('.callback', () => {
        it('does not copy', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { iterations: 1 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.callback).toBe(undefined);
        });
        it('does not copy when used with custom value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          const callback = () => {};
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { callback });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.callback).toBe(undefined);
        });
      });

      describe('.callbackPeriod', () => {
        it('copies default value when no value used', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.callbackPeriod).toBe(
            trainDefaults().callbackPeriod
          );
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { callbackPeriod: 50 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.callbackPeriod).toBe(50);
        });
      });

      describe('.timeout', () => {
        it('uses undefined in place of Infinity when no value used for default value', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }]);
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(trainDefaults().timeout).toBe(Infinity);
          expect(newNet.trainOpts.timeout).toBe(Infinity);
        });
        it('copies custom value when defined', () => {
          const net = new NeuralNetwork({ hiddenLayers: [2] });
          net.trainingTick = () => false;
          net.train([{ input: [], output: [] }], { timeout: 50 });
          const json = net.toJSON();
          const newNet = new NeuralNetwork().fromJSON(json);
          expect(newNet.trainOpts.timeout).toBe(50);
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
      // net.fromJSON({ sizes: [], layers: [] });
      // expect(net.activation === 'sigmoid').toBeTruthy();
    });
  });
});

describe('default net json', () => {
  const activation = 'leaky-relu';
  const originalNet = new NeuralNetwork({ activation });
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
  const originalNetTrainOpts = originalNet.trainOpts;
  const serializedNetTrainOpts = serializedNet.trainOpts;

  describe('.options', () => {
    it('option inputSize', () => {
      expect(originalNet.options.inputSize).toEqual(serialized.options.inputSize);
    });
    it('option hiddenLayers', () => {
      expect(originalNet.options.hiddenLayers).toEqual(serialized.options.hiddenLayers);
    });
    it('option outputSize', () => {
      expect(originalNet.options.outputSize).toEqual(serialized.options.outputSize);
    });
    it('option binaryThresh', () => {
      expect(originalNet.options.binaryThresh).toEqual(serialized.options.binaryThresh);
    });
  });
  describe('.trainOpts', () => {
    it('training options activation', () => {
      expect(originalNetTrainOpts.activation).toBe(
        serializedNetTrainOpts.activation
      );
    });
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

    it('training options praxis', () => {
      expect(originalNetTrainOpts.praxis).toBe(serializedNetTrainOpts.praxis);
    });

    it('training options beta1', () => {
      expect(originalNetTrainOpts.beta1).toBe(serializedNetTrainOpts.beta1);
    });

    it('training options beta2', () => {
      expect(originalNetTrainOpts.beta2).toBe(serializedNetTrainOpts.beta2);
    });

    it('training options epsilon', () => {
      expect(originalNetTrainOpts.epsilon).toBe(serializedNetTrainOpts.epsilon);
    });
  });

  describe('.sizes', () => {
    it('sizes are same', () => {
      expect(serialized.sizes).toEqual(originalNet.sizes);
    });
  });

  it('can run originalNet, and serializedNet, with same output', () => {
    const output1 = originalNet.run(input);
    const output2 = serializedNet.run(input);
    expect(output2).toEqual(output1);
  });
});
