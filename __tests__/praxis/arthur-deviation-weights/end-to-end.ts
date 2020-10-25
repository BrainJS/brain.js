/* istanbul ignore file */
import { GPU } from 'gpu.js';
import { ArthurDeviationWeights } from '../../../src/praxis/arthur-deviation-weights';
import { random } from '../../../src/layer/random';
import { NeuralNetwork } from '../../../src/neural-network';
import { setup, teardown } from '../../../src/utilities/kernel';
import { injectIstanbulCoverage } from '../../test-utils';

describe('ArthurDeviationWeights Class: End to End', () => {
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
  describe('.run()', () => {
    test('correctly runs values', () => {
      const layer = { weights: [[1]], deltas: [[1]], width: 1, height: 1 };
      // @ts-expect-error missing properties in layer
      const praxis = new ArthurDeviationWeights(layer, {
        weightsLayer: {
          weights: [[1]],
          deltas: [[1]],
        },
        incomingLayer: {
          weights: [[1]],
          deltas: [[1]],
        },
        deltaLayer: {
          weights: [[1]],
          deltas: [[1]],
        },
      });
      praxis.setupKernels();
      const result = praxis.run() as number[][];
      expect(result[0][0].toFixed(5)).toEqual((1.3).toFixed(5).toString());
    });
  });
  test('matches NeuralNetwork.adjustWeights output', () => {
    const xorTrainingData = [
      { input: [0, 1], output: [1] },
      { input: [0, 0], output: [0] },
      { input: [1, 1], output: [0] },
      { input: [1, 0], output: [1] },
    ];
    const net = new NeuralNetwork();
    net.train(xorTrainingData, {
      iterations: 1,
    });

    const inputs = random({ name: 'input', height: 2 });
    const weights = random({ name: 'weights', height: 3, width: 2 });
    const biases = random({ name: 'biases', height: 3 });

    // TODO: Remove type coercion when NeuralNetwork is typed
    const trainOpts = net.trainOpts as typeof NeuralNetwork.trainDefaults;

    const praxis = new ArthurDeviationWeights(weights, {
      weightsLayer: weights,
      incomingLayer: inputs,
      deltaLayer: biases,
      learningRate: trainOpts.learningRate,
    });
    expect(praxis.learningRate).toBe(trainOpts.learningRate);

    const inputWeights = inputs.weights as number[][];
    const netOutputs = net.outputs as number[][];
    const netChanges = net.changes as number[][][];
    const netWeights = net.weights as number[][][];
    const netDeltas = net.deltas as number[][];
    const weightsWeights = weights.weights as number[][];
    const biasesWeights = biases.weights as number[][];
    const biasesDeltas = biases.deltas as number[][];

    let praxisChanges = praxis.changes as number[][];

    inputWeights[0][0] = netOutputs[0][0] = 11;
    inputWeights[1][0] = netOutputs[0][1] = 22;

    praxisChanges[0][0] = netChanges[1][0][0] = 1;
    praxisChanges[0][1] = netChanges[1][0][1] = 2;

    praxisChanges[1][0] = netChanges[1][1][0] = 3;
    praxisChanges[1][1] = netChanges[1][1][1] = 4;

    praxisChanges[2][0] = netChanges[1][2][0] = 5;
    praxisChanges[2][1] = netChanges[1][2][1] = 6;

    netChanges[2][0][0] = 7;
    netChanges[2][0][2] = 8;
    netChanges[2][0][3] = 9;

    weightsWeights[0][0] = netWeights[1][0][0] = 1;
    weightsWeights[0][1] = netWeights[1][0][1] = 2;

    weightsWeights[1][0] = netWeights[1][1][0] = 3;
    weightsWeights[1][1] = netWeights[1][1][1] = 4;

    weightsWeights[2][0] = netWeights[1][2][0] = 5;
    weightsWeights[2][1] = netWeights[1][2][1] = 6;

    biasesWeights[0][0] = netWeights[2][0][0] = 7;
    biasesWeights[1][0] = netWeights[2][0][1] = 8;
    biasesWeights[2][0] = netWeights[2][0][2] = 9;

    netDeltas[0][0] = 1;
    netDeltas[0][1] = 2;

    biasesDeltas[0][0] = netDeltas[1][0] = 3;
    biasesDeltas[1][0] = netDeltas[1][1] = 4;
    biasesDeltas[2][0] = netDeltas[1][2] = 5;

    netDeltas[2][0] = 6;

    net.adjustWeights();
    praxis.setupKernels();
    const result = praxis.run() as number[][];
    praxisChanges = praxis.changes as number[][];

    expect(praxisChanges[0][0]).toBe(netChanges[1][0][0]);
    expect(praxisChanges[0][1]).toBe(netChanges[1][0][1]);

    expect(praxisChanges[1][0]).toBe(netChanges[1][1][0]);
    expect(praxisChanges[1][1]).toBe(netChanges[1][1][1]);

    expect(praxisChanges[2][0]).toBe(netChanges[1][2][0]);
    expect(praxisChanges[2][1]).toBe(netChanges[1][2][1]);

    expect(result[0][0]).toBe(netWeights[1][0][0]);
    expect(result[0][1]).toBe(netWeights[1][0][1]);

    expect(result[1][0]).toBe(netWeights[1][1][0]);
    expect(result[1][1]).toBe(netWeights[1][1][1]);

    expect(result[2][0]).toBe(netWeights[1][2][0]);
    expect(result[2][1]).toBe(netWeights[1][2][1]);
  });
});
