import assert from 'assert';
import { Recurrent, layer } from '../../src/index';
const {
  add,
  input,
  multiply,
  output,
  random,
  recurrent } = layer;

describe('Recurrent Class: Unit', () => {
  describe('.initialize()', () => {
    it('can validate a simple recurrent neural network', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input, recurrentInput) => recurrent({ height: 3 }, recurrentInput, input),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();

      assert.deepEqual(net.layers.map(layer => layer.constructor.name), [
        'Input',
        'Random',
        'Multiply',
        'Random',
        'RecurrentInput',
        'Multiply',
        'Add',
        'Zeros',
        'Add',
        'Relu',
        'Random',
        'Multiply',
        'Target'
      ]);
    });
  });
  describe('.runInput()', () => {
    it('forward propagates and properly caches layer weights and sets new random weights', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input, recurrentInput) => add(multiply(random({ width: 2 }), input), recurrentInput),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();
      net.runInput([[0, 1], [1, 0]]);
      assert.equal(net.weightsCache.length, 1);
      assert.equal(net.weightsCache[0].length, 8);
      assert.equal(net.layers.length, 8);

      const weightsCache = net.weightsCache[0];
      const { layers } = net;
      assert.equal(layers[0].weights.length, weightsCache[0].length);
      assert.equal(layers[1].weights.length, weightsCache[1].length);
      assert.equal(layers[2].weights.length, weightsCache[2].length);
      assert.equal(layers[3].weights.length, weightsCache[3].length);
      assert.equal(layers[4].weights.length, weightsCache[4].length);
      assert.equal(layers[5].weights.length, weightsCache[5].length);
      assert.equal(layers[6].weights.length, weightsCache[6].length);
      assert.equal(layers[7].weights.length, weightsCache[7].length);

      assert.equal(layers[0].weights[0].length, weightsCache[0][0].length);
      assert.equal(layers[1].weights[0].length, weightsCache[1][0].length);
      assert.equal(layers[2].weights[0].length, weightsCache[2][0].length);
      assert.equal(layers[3].weights[0].length, weightsCache[3][0].length);
      assert.equal(layers[4].weights[0].length, weightsCache[4][0].length);
      assert.equal(layers[5].weights[0].length, weightsCache[5][0].length);
      assert.equal(layers[6].weights[0].length, weightsCache[6][0].length);
      assert.equal(layers[7].weights[0].length, weightsCache[7][0].length);

      assert.notDeepEqual(layers[0].weights, weightsCache[0]);
      assert.notDeepEqual(layers[1].weights, weightsCache[1]);
      assert.notDeepEqual(layers[2].weights, weightsCache[2]);
      assert.notDeepEqual(layers[3].weights, weightsCache[3]);
      assert.notDeepEqual(layers[4].weights, weightsCache[4]);
      assert.notDeepEqual(layers[5].weights, weightsCache[5]);
      assert.notDeepEqual(layers[6].weights, weightsCache[6]);
      assert.notDeepEqual(layers[7].weights, weightsCache[7]);
    });
  });
  describe('.cacheWeights()', () => {
    it('caches weights properly and pushes them to net.weightsCache array', () => {
      const net = new Recurrent();
      const layers1 = net.layers = [
        { weights: [3, 2, 1] },
        { weights: [2, 1, 3] },
        { weights: [1, 2, 3] }
      ];
      net.cacheWeights();
      const layers2 = net.layers = [
        { weights: [5, 4, 3] },
        { weights: [4, 3, 5] },
        { weights: [3, 4, 5] }
      ];
      net.cacheWeights();
      assert(net.weightsCache.length, 2);
      assert.deepEqual(layers1.map(layer => layer.weights), net.weightsCache[0]);
      assert.deepEqual(layers2.map(layer => layer.weights), net.weightsCache[1]);
    });
  });
  describe('.cacheDeltas()', () => {
    it('caches weights properly and unshifts them to net.deltasCache array', () => {
      const net = new Recurrent();
      const layers1 = net.layers = [
        { deltas: [3, 2, 1] },
        { deltas: [2, 1, 3] },
        { deltas: [1, 2, 3] }
      ];
      net.cacheDeltas();
      const layers2 = net.layers = [
        { deltas: [5, 4, 3] },
        { deltas: [4, 3, 5] },
        { deltas: [3, 4, 5] }
      ];
      net.cacheDeltas();
      assert(net.deltasCache.length, 2);
      assert.deepEqual(layers2.map(layer => layer.deltas), net.deltasCache[0]);
      assert.deepEqual(layers1.map(layer => layer.deltas), net.deltasCache[1]);
    });
  });
  describe('.calculateDeltas()', () => {
    it('back propagates values through deltas', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input, recurrentInput) => add(multiply(random({ width: 2 }), input), recurrentInput),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();
      net.runInput([[0, 0], [0, 1]]);
      assert.equal(net.layers.length, 8);
      assert(net.layers[0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[3].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[4].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[5].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[6].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[7].deltas.every(row => row.every(delta => delta === 0)));

      net.calculateDeltas([[0, 0], [0, 1]]);

      assert.equal(net.deltasCache.length, 1);

      const deltasCache = net.deltasCache[0];
      assert(deltasCache[0].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[1].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[2].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[3].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[4].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[5].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[6].every(row => row.some(delta => delta !== 0)));
      assert(deltasCache[7].every(row => row.some(delta => delta !== 0)));

      assert(net.layers[0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[7].deltas.every(row => row.some(delta => delta !== 0)));
    });
  });
  describe('.adjustWeights()', () => {
    it('uncaches deltas and weights together and adjust weights', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input, recurrentInput) => add(multiply(random({ width: 2 }), input), recurrentInput),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();
      net.runInput([[0, 1], [1, 0]]);
      net.calculateDeltas([[0, 0], [0, 1]]);
      assert.equal(net.weightsCache.length, 1);
      assert.equal(net.deltasCache.length, 1);
      const weights = net.layers.map(layer => layer.weights);
      const cachedWeights = net.weightsCache[0];
      net.adjustWeights();
      assert.notDeepEqual(weights, net.layers.map(layer => layer.weights));
      assert.notDeepEqual(weights, cachedWeights);
      assert(weights.map(row => row.some(weight => weight !== 0)));
    });
  });
});