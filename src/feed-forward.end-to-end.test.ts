import { GPU } from 'gpu.js';
import { NeuralNetwork } from './neural-network';
import { FeedForward } from './feed-forward';
import {
  input,
  output,
  target,
  Target,
  Sigmoid,
  arthurFeedForward,
  ILayer,
  ILayerSettings,
  feedForward as feedForwardLayer,
} from './layer';

import { momentumRootMeanSquaredPropagation } from './praxis';
import { zeros2D } from './utilities/zeros-2d';
import { setup, teardown } from './utilities/kernel';
import { mockPraxis } from './test-utils';
import { IPraxis } from './praxis/base-praxis';

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
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('when configured like NeuralNetwork', () => {
    function setupTwinXORNetworks(useDecimals: boolean) {
      const standardNet = new NeuralNetwork();
      const ffNet = new FeedForward({
        inputLayer: () => input({ height: 2, id: 'input' }),
        hiddenLayers: [
          (inputLayer) => arthurFeedForward({ height: 3 }, inputLayer),
          (inputLayer) => arthurFeedForward({ height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) =>
          target({ height: 1, id: 'output' }, inputLayer),
      });

      ffNet.initialize();

      standardNet.train([{ input: [1, 1], output: [1] }], {
        iterations: 1,
      });

      // set both nets exactly the same, then train them once, and compare
      const ffNetLayers = ffNet.layers as ILayer[];
      const biasLayers = ffNetLayers.filter((l) => l.id === 'biases');
      const weightLayers = ffNetLayers.filter((l) => l.id === 'weights');
      const sigmoidLayers = ffNetLayers.filter((l) => l instanceof Sigmoid);
      const targetLayer = ffNetLayers[ffNetLayers.length - 1];

      // Use whole numbers to better test accuracy
      // set biases
      const standardNetBiases = standardNet.biases;
      const biasLayers0Weights = biasLayers[0].weights as number[][];
      expect(standardNetBiases[1].length).toBe(3);
      standardNetBiases[1][0] = biasLayers0Weights[0][0] = useDecimals
        ? 0.5
        : 5;
      standardNetBiases[1][1] = biasLayers0Weights[1][0] = useDecimals
        ? 0.7
        : 7;
      standardNetBiases[1][2] = biasLayers0Weights[2][0] = useDecimals
        ? 0.2
        : 2;

      const biasLayers1Weights = biasLayers[1].weights as number[][];
      expect(standardNetBiases[2].length).toBe(1);
      standardNetBiases[2][0] = biasLayers1Weights[0][0] = useDecimals
        ? 0.12
        : 12;

      // set weights
      const standardNetWeights = standardNet.weights;
      const weightLayers0Weights = weightLayers[0].weights as number[][];
      expect(standardNetWeights[1].length).toBe(3);
      expect(standardNetWeights[1][0].length).toBe(2);
      standardNetWeights[1][0][0] = weightLayers0Weights[0][0] = useDecimals
        ? 0.5
        : 5;
      standardNetWeights[1][0][1] = weightLayers0Weights[0][1] = useDecimals
        ? 0.1
        : 10;
      expect(standardNetWeights[1][1].length).toBe(2);
      standardNetWeights[1][1][0] = weightLayers0Weights[1][0] = useDecimals
        ? 0.3
        : 3;
      standardNetWeights[1][1][1] = weightLayers0Weights[1][1] = useDecimals
        ? 0.1
        : 1;
      expect(standardNetWeights[1][2].length).toBe(2);
      standardNetWeights[1][2][0] = weightLayers0Weights[2][0] = useDecimals
        ? 0.8
        : 8;
      standardNetWeights[1][2][1] = weightLayers0Weights[2][1] = useDecimals
        ? 0.4
        : 4;

      const weightLayers1Weights = weightLayers[1].weights as number[][];
      expect(standardNetWeights[2].length).toBe(1);
      expect(standardNetWeights[2][0].length).toBe(3);
      standardNetWeights[2][0][0] = weightLayers1Weights[0][0] = useDecimals
        ? 0.2
        : 2;
      standardNetWeights[2][0][1] = weightLayers1Weights[0][1] = useDecimals
        ? 0.6
        : 6;
      standardNetWeights[2][0][2] = weightLayers1Weights[0][2] = useDecimals
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
          }
        );

        // test only the sigmoid layers and target layers, as that is the final equation location per layer
        // Also, NeuralNetwork uses a negative value, while FeedForward uses a positive one
        const sigmoidLayers0InputLayerDeltas = (sigmoidLayers[0]
          .inputLayer as ILayer).deltas as number[][];
        const standardNetDeltas = standardNet.deltas;
        expect(-sigmoidLayers0InputLayerDeltas[0][0]).not.toEqual(0);
        expect(-sigmoidLayers0InputLayerDeltas[0][0]).toEqual(
          standardNetDeltas[1][0]
        );
        expect(-sigmoidLayers0InputLayerDeltas[1][0]).not.toEqual(0);
        expect(-sigmoidLayers0InputLayerDeltas[1][0]).toBeCloseTo(
          standardNetDeltas[1][1]
        );
        expect(-sigmoidLayers0InputLayerDeltas[2][0]).not.toEqual(0);
        expect(-sigmoidLayers0InputLayerDeltas[2][0]).toEqual(
          standardNetDeltas[1][2]
        );

        const sigmoidLayers1InputLayerDeltas = (sigmoidLayers[1]
          .inputLayer as ILayer).deltas as number[][];
        expect(-sigmoidLayers1InputLayerDeltas[0][0]).not.toEqual(0);
        expect(-sigmoidLayers1InputLayerDeltas[0][0]).toEqual(
          standardNetDeltas[2][0]
        );

        const targetLayerInputLayerDeltas = (targetLayer.inputLayer as ILayer)
          .deltas as number[][];
        const standardNetErrors = standardNet.errors;
        expect(-targetLayerInputLayerDeltas[0][0]).not.toEqual(0);
        expect(-targetLayerInputLayerDeltas[0][0]).toEqual(
          standardNetErrors[2][0]
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
        });

        // test only the sigmoid layers, as that is the final equation location per layer
        const sigmoidLayers0Weights = sigmoidLayers[0].weights as number[][];
        const standardNetOutputs = standardNet.outputs;
        expect(sigmoidLayers0Weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers0Weights[0][0]).toEqual(standardNetOutputs[1][0]);
        expect(sigmoidLayers0Weights[1][0]).not.toEqual(0);
        expect(sigmoidLayers0Weights[1][0]).toEqual(standardNetOutputs[1][1]);
        expect(sigmoidLayers0Weights[2][0]).not.toEqual(0);
        expect(sigmoidLayers0Weights[2][0]).toEqual(standardNetOutputs[1][2]);

        const sigmoidLayers1Weights = sigmoidLayers[1].weights as number[][];
        expect(sigmoidLayers1Weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers1Weights[0][0]).toEqual(standardNetOutputs[2][0]);

        const targetLayerWeights = targetLayer.weights as number[][];
        expect(targetLayerWeights[0][0]).not.toEqual(0);
        expect(targetLayerWeights[0][0]).toEqual(standardNetOutputs[2][0]);
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

        const sigmoidLayers0WeightsBeforeTraining = sigmoidLayers[0]
          .weights as number[][];
        expect(sigmoidLayers0WeightsBeforeTraining[0][0]).toEqual(0);
        expect(sigmoidLayers0WeightsBeforeTraining[1][0]).toEqual(0);
        expect(sigmoidLayers0WeightsBeforeTraining[2][0]).toEqual(0);

        expect(sigmoidLayers0WeightsBeforeTraining[0][0]).toEqual(0);

        // retrain with these new weights, only ffNet needs reinforce, otherwise, values are lost
        standardNet.train([{ input: [0.9, 0.8], output: [0.3] }], {
          iterations: 1,
        });

        ffNet.train([{ input: [0.9, 0.8], output: [0.3] }], {
          iterations: 1,
        });

        // test only the sigmoid layers, as that is the final equation location per layer
        const sigmoidLayers0WeightsAfterTraining = sigmoidLayers[0]
          .weights as number[][];
        const standardNetOutputs = standardNet.outputs;
        expect(sigmoidLayers0WeightsAfterTraining[0][0]).not.toEqual(0);
        expect(sigmoidLayers0WeightsAfterTraining[0][0]).toEqual(
          standardNetOutputs[1][0]
        );
        expect(sigmoidLayers0WeightsAfterTraining[1][0]).not.toEqual(0);
        expect(sigmoidLayers0WeightsAfterTraining[1][0]).toEqual(
          standardNetOutputs[1][1]
        );
        expect(sigmoidLayers0WeightsAfterTraining[2][0]).not.toEqual(0);
        expect(sigmoidLayers0WeightsAfterTraining[2][0]).toEqual(
          standardNetOutputs[1][2]
        );

        const sigmoidLayers1Weights = sigmoidLayers[1].weights as number[][];
        expect(sigmoidLayers1Weights[0][0]).not.toEqual(0);
        expect(sigmoidLayers1Weights[0][0]).toEqual(standardNetOutputs[2][0]);

        const targetLayerWeights = targetLayer.weights as number[][];
        expect(targetLayerWeights[0][0]).not.toEqual(0);
        expect(targetLayerWeights[0][0]).toEqual(standardNetOutputs[2][0]);
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
      const result = net.runInput([[1]]) as number[][];

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
      const errors: number[] = [];
      net.train(xorTrainingData, {
        iterations: 10,
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
      // const errors: number[] = [];
      const net = new FeedForward({
        initPraxis: (layer: ILayer): IPraxis => {
          switch (layer.id) {
            case 'biases':
              return momentumRootMeanSquaredPropagation(layer, {
                decayRate: 0.29,
              });
            case 'weights':
              return momentumRootMeanSquaredPropagation(layer, {
                decayRate: 0.29,
              });
            default:
              return mockPraxis(layer);
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
            // errors.push(info.error);
          }
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result1 = net.run([0, 0]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result2 = net.run([0, 1]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result3 = net.run([1, 0]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result4 = net.run([1, 1]);

      // TODO: this should be easier than result[0][0] https://github.com/BrainJS/brain.js/issues/439
      // expect(result1[0][0]).toBeLessThan(0.2);
      // expect(result2[0][0]).toBeGreaterThan(0.8);
      // expect(result3[0][0]).toBeGreaterThan(0.8);
      // expect(result4[0][0]).toBeLessThan(0.2);
      // expect(errors[errors.length - 1]).toBeLessThan(0.1);
      // expect(errors.length).toBeLessThan(net.trainOpts.iterations);
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
        setup(new GPU({ mode: 'gpu' }));
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
        constructor(settings: ILayerSettings, inputLayer: ILayer) {
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
      const layers: ILayer[] = net.layers as ILayer[];
      layers[0].weights = [[1]];

      layers.forEach((layerLayer) => {
        (layerLayer.deltas as number[][]).forEach((row) => {
          row.forEach((delta) => {
            expect(delta).toBe(0);
          });
        });
      });
      net.runInput([[1]]);
      net._calculateDeltas([[1]]);

      layers.forEach((l) => {
        (l.deltas as number[][]).forEach((row) => {
          row.forEach((delta) => {
            expect(delta === 0).toBeFalsy();
          });
        });
      });
    });
  });
});
