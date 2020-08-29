const { GPU } = require('gpu.js');
const NeuralNetwork = require('../../src/neural-network');
const { FeedForward } = require('../../src/feed-forward');
// const { add } = require('../../src/layer/add');
// const { random } = require('../../src/layer/random');
const { input } = require('../../src/layer/input');
const { output } = require('../../src/layer/output');
const { Target, target } = require('../../src/layer/target');
const { Sigmoid } = require('../../src/layer/sigmoid');
// const { Multiply, multiply } = require('../../src/layer/multiply');
const {
  feedForward: feedForwardLayer,
} = require('../../src/layer/feed-forward');
const { arthurFeedForward } = require('../../src/layer/arthur-feed-forward');

// const {
//   arthurDeviationWeights,
// } = require('../../src/praxis/arthur-deviation-weights');
// const {
//   arthurDeviationBiases,
// } = require('../../src/praxis/arthur-deviation-biases');

const {
  momentumRootMeanSquaredPropagation,
} = require('../../src/praxis/momentum-root-mean-squared-propagation');
const zeros2D = require('../../src/utilities/zeros-2d');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

const xorTrainingData = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
];

/* eslint-disable no-multi-assign */

describe('FeedForward Class: End to End', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  /**
   *
   * @param {FeedForward} ff
   * @param {NeuralNetwork} net
   * @param {String} layerName
   */
  describe('when configured like NeuralNetwork', () => {
    function setupTwinXORNetworks(useDecimals) {
      const standardNet = new NeuralNetwork();
      const ffNet = new FeedForward({
        inputLayer: () => input({ height: 2, name: 'input' }),
        hiddenLayers: [
          (inputLayer) => arthurFeedForward({ height: 3 }, inputLayer),
          (inputLayer) => arthurFeedForward({ height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) =>
          target({ height: 1, name: 'output' }, inputLayer),
      });

      ffNet.initialize();

      standardNet.train([{ input: [1, 1], output: [1] }], {
        iterations: 1,
      });

      // set both nets exactly the same, then train them once, and compare
      const biasLayers = ffNet.layers.filter((l) => l.name === 'biases');
      const weightLayers = ffNet.layers.filter((l) => l.name === 'weights');
      const sigmoidLayers = ffNet.layers.filter(
        (l) => l.constructor === Sigmoid
      );
      const targetLayer = ffNet.layers[ffNet.layers.length - 1];

      // Use whole numbers to better test accuracy
      // set biases
      expect(standardNet.biases[1].length).toBe(3);
      standardNet.biases[1][0] = biasLayers[0].weights[0][0] = useDecimals
        ? 0.5
        : 5;
      standardNet.biases[1][1] = biasLayers[0].weights[1][0] = useDecimals
        ? 0.7
        : 7;
      standardNet.biases[1][2] = biasLayers[0].weights[2][0] = useDecimals
        ? 0.2
        : 2;

      expect(standardNet.biases[2].length).toBe(1);
      standardNet.biases[2][0] = biasLayers[1].weights[0][0] = useDecimals
        ? 0.12
        : 12;

      // set weights
      expect(standardNet.weights[1].length).toBe(3);
      expect(standardNet.weights[1][0].length).toBe(2);
      standardNet.weights[1][0][0] = weightLayers[0].weights[0][0] = useDecimals
        ? 0.5
        : 5;
      standardNet.weights[1][0][1] = weightLayers[0].weights[0][1] = useDecimals
        ? 0.1
        : 10;
      expect(standardNet.weights[1][1].length).toBe(2);
      standardNet.weights[1][1][0] = weightLayers[0].weights[1][0] = useDecimals
        ? 0.3
        : 3;
      standardNet.weights[1][1][1] = weightLayers[0].weights[1][1] = useDecimals
        ? 0.1
        : 1;
      expect(standardNet.weights[1][2].length).toBe(2);
      standardNet.weights[1][2][0] = weightLayers[0].weights[2][0] = useDecimals
        ? 0.8
        : 8;
      standardNet.weights[1][2][1] = weightLayers[0].weights[2][1] = useDecimals
        ? 0.4
        : 4;

      expect(standardNet.weights[2].length).toBe(1);
      expect(standardNet.weights[2][0].length).toBe(3);
      standardNet.weights[2][0][0] = weightLayers[1].weights[0][0] = useDecimals
        ? 0.2
        : 2;
      standardNet.weights[2][0][1] = weightLayers[1].weights[0][1] = useDecimals
        ? 0.6
        : 6;
      standardNet.weights[2][0][2] = weightLayers[1].weights[0][2] = useDecimals
        ? 0.3
        : 3;
      return {
        ffNet,
        standardNet,
        sigmoidLayers,
        targetLayer,
      };
    }
    describe('prediction', () => {
      test('it matches NeuralNetworks.deltas & NeuralNetworks.errors for 2 inputs, 3 hidden neurons, and 1 output', () => {
        const {
          standardNet,
          ffNet,
          sigmoidLayers,
          targetLayer,
        } = setupTwinXORNetworks(true);
        // learning deviates, which we'll test elsewhere, for the time being, just don't learn
        standardNet.adjustWeights = () => {};
        ffNet.adjustWeights = () => {};

        // retrain with these new weights, only ffNet needs reinforce, otherwise, values are lost
        standardNet.train(
          [
            {
              input: new Float32Array([0.9, 0.8]),
              output: new Float32Array([0.5]),
            },
          ],
          {
            iterations: 1,
          }
        );

        ffNet.train(
          [
            {
              input: new Float32Array([0.9, 0.8]),
              output: new Float32Array([0.5]),
            },
          ],
          {
            iterations: 1,
            reinforce: true,
          }
        );

        // test only the sigmoid layers and target layers, as that is the final equation location per layer
        // Also, NeuralNetwork uses a negative value, while FeedForward uses a positive one
        expect(-sigmoidLayers[0].inputLayer.deltas[0][0]).not.toEqual(0);
        expect(-sigmoidLayers[0].inputLayer.deltas[0][0]).toEqual(
          standardNet.deltas[1][0]
        );
        expect(-sigmoidLayers[0].inputLayer.deltas[1][0]).not.toEqual(0);
        expect(-sigmoidLayers[0].inputLayer.deltas[1][0]).toBeCloseTo(
          standardNet.deltas[1][1]
        );
        expect(-sigmoidLayers[0].inputLayer.deltas[2][0]).not.toEqual(0);
        expect(-sigmoidLayers[0].inputLayer.deltas[2][0]).toEqual(
          standardNet.deltas[1][2]
        );

        expect(-sigmoidLayers[1].inputLayer.deltas[0][0]).not.toEqual(0);
        expect(-sigmoidLayers[1].inputLayer.deltas[0][0]).toEqual(
          standardNet.deltas[2][0]
        );

        expect(-targetLayer.inputLayer.deltas[0][0]).not.toEqual(0);
        expect(-targetLayer.inputLayer.deltas[0][0]).toEqual(
          standardNet.errors[2][0]
        );
      });
    });
    describe('comparison', () => {
      test('it matches NeuralNetwork.outputs for 2 inputs, 3 hidden neurons, and 1 output', () => {
        const {
          standardNet,
          ffNet,
          sigmoidLayers,
          targetLayer,
        } = setupTwinXORNetworks(true);
        // learning deviates, which we'll test elsewhere, for the time being, just don't learn
        standardNet.adjustWeights = function () {};
        ffNet.adjustWeights = function () {};

        // retrain with these new weights, only ffNet needs reinforce, otherwise, values are lost
        standardNet.train([{ input: [0.9, 0.8], output: [0.3] }], {
          iterations: 1,
        });

        ffNet.train([{ input: [0.9, 0.8], output: [0.3] }], {
          iterations: 1,
          reinforce: true,
        });

        // test only the sigmoid layers, as that is the final equation location per layer
        expect(sigmoidLayers[0].weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers[0].weights[0][0]).toEqual(
          standardNet.outputs[1][0]
        );
        expect(sigmoidLayers[0].weights[1][0]).not.toEqual(0);
        expect(sigmoidLayers[0].weights[1][0]).toEqual(
          standardNet.outputs[1][1]
        );
        expect(sigmoidLayers[0].weights[2][0]).not.toEqual(0);
        expect(sigmoidLayers[0].weights[2][0]).toEqual(
          standardNet.outputs[1][2]
        );

        expect(sigmoidLayers[1].weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers[1].weights[0][0]).toEqual(
          standardNet.outputs[2][0]
        );

        expect(targetLayer.weights[0][0]).not.toEqual(0);
        expect(targetLayer.weights[0][0]).toEqual(standardNet.outputs[2][0]);
      });
    });
    describe('learn', () => {
      test('is the same value for 2 inputs, 3 hidden neurons, and 1 output', () => {
        const {
          standardNet,
          ffNet,
          sigmoidLayers,
          targetLayer,
        } = setupTwinXORNetworks(true);

        expect(sigmoidLayers[0].weights[0][0]).toEqual(0);
        expect(sigmoidLayers[0].weights[1][0]).toEqual(0);
        expect(sigmoidLayers[0].weights[2][0]).toEqual(0);

        expect(sigmoidLayers[1].weights[0][0]).toEqual(0);

        // retrain with these new weights, only ffNet needs reinforce, otherwise, values are lost
        standardNet.train([{ input: [0.9, 0.8], output: [0.3] }], {
          iterations: 1,
        });

        ffNet.train([{ input: [0.9, 0.8], output: [0.3] }], {
          iterations: 1,
          reinforce: true,
        });

        // test only the sigmoid layers, as that is the final equation location per layer
        expect(sigmoidLayers[0].weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers[0].weights[0][0]).toEqual(
          standardNet.outputs[1][0]
        );
        expect(sigmoidLayers[0].weights[1][0]).not.toEqual(0);
        expect(sigmoidLayers[0].weights[1][0]).toEqual(
          standardNet.outputs[1][1]
        );
        expect(sigmoidLayers[0].weights[2][0]).not.toEqual(0);
        expect(sigmoidLayers[0].weights[2][0]).toEqual(
          standardNet.outputs[1][2]
        );

        expect(sigmoidLayers[1].weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers[1].weights[0][0]).toEqual(
          standardNet.outputs[2][0]
        );

        expect(targetLayer.weights[0][0]).not.toEqual(0);
        expect(targetLayer.weights[0][0]).toEqual(standardNet.outputs[2][0]);
      });
    });
  });

  describe('.runInput()', () => {
    test('outputs a number', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          (inputLayer) => feedForwardLayer({ width: 1, height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) =>
          output({ width: 1, height: 1 }, inputLayer),
      });

      net.initialize();
      const result = net.runInput([[1]]);

      expect(typeof result[0][0] === 'number').toBeTruthy();
    });
  });

  describe('.train()', () => {
    function testOutputsSmaller() {
      const net = new FeedForward({
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          (inputLayer) => feedForwardLayer({ height: 3 }, inputLayer),
          (inputLayer) => feedForwardLayer({ height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) => target({ height: 1 }, inputLayer),
      });
      const errors = [];
      net.train(xorTrainingData, {
        iterations: 10,
        threshold: 0.5,
        callbackPeriod: 1,
        errorCheckInterval: 1,
        callback: (info) => errors.push(info.error),
      });

      expect(
        errors.reduce((prev, cur) => prev && typeof cur === 'number', true)
      ).toBeTruthy();

      expect(errors[0]).toBeGreaterThan(errors[errors.length - 1]);
    }

    function testCanLearnXOR() {
      const errors = [];
      const net = new FeedForward({
        praxis: (layer) => {
          switch (layer.name) {
            case 'biases':
              return momentumRootMeanSquaredPropagation(layer, {
                decayRate: 0.29,
              });
            case 'weights':
              return momentumRootMeanSquaredPropagation(layer, {
                decayRate: 0.29,
              });
            default:
              return {
                run: () => {
                  return layer.weights;
                },
              };
          }
        },
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          (inputLayer) => feedForwardLayer({ height: 3 }, inputLayer),
          (inputLayer) => feedForwardLayer({ height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) => target({ height: 1 }, inputLayer),
      });

      net.train(xorTrainingData, {
        callbackPeriod: 1,
        errorCheckInterval: 200,
        callback: (info) => {
          if (info.iterations % 200 === 0) {
            errors.push(info.error);
          }
        },
      });

      const result1 = net.run([0, 0]);
      const result2 = net.run([0, 1]);
      const result3 = net.run([1, 0]);
      const result4 = net.run([1, 1]);

      // TODO: this should be easier than result[0][0] https://github.com/BrainJS/brain.js/issues/439
      expect(result1[0][0]).toBeLessThan(0.2);
      expect(result2[0][0]).toBeGreaterThan(0.8);
      expect(result3[0][0]).toBeGreaterThan(0.8);
      expect(result4[0][0]).toBeLessThan(0.2);
      expect(errors[errors.length - 1]).toBeLessThan(0.1);
      expect(errors.length).toBeLessThan(net.trainOpts.iterations);
    }

    describe('on CPU', () => {
      test('outputs a number that is smaller than when it started', () => {
        testOutputsSmaller();
      });
      test('can learn xor', () => {
        testCanLearnXOR();
      });
    });
    describe('on GPU', () => {
      if (!GPU.isGPUSupported) return;
      beforeEach(() => {
        setup(new GPU({ mode: 'gpu', removeIstanbulCoverage: true }));
      });
      afterEach(() => {
        teardown();
      });
      test('outputs a number that is smaller than when it started', () => {
        testOutputsSmaller();
      });
      test('can learn xor', () => {
        testCanLearnXOR();
      });
    });
  });

  describe('._calculateDeltas()', () => {
    test('populates deltas from output to input', () => {
      class SuperOutput extends Target {
        constructor(settings, inputLayer) {
          super(settings, inputLayer);
          this.deltas = zeros2D(this.width, this.height);
          this.inputLayer = inputLayer;
        }
      }

      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          (inputLayer) => feedForwardLayer({ width: 1, height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) =>
          new SuperOutput({ width: 1, height: 1 }, inputLayer),
      });
      net.initialize();
      net.layers[0].weights = [[1]];

      net.layers.forEach((layerLayer) => {
        layerLayer.deltas.forEach((row) => {
          row.forEach((delta) => {
            expect(delta).toBe(0);
          });
        });
      });
      net.runInput([[1]]);
      net._calculateDeltas([[1]]);

      net.layers.forEach((l) => {
        l.deltas.forEach((row) => {
          row.forEach((delta) => {
            expect(delta === 0).toBeFalsy();
          });
        });
      });
    });
  });
});
