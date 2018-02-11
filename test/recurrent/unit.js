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
      net.runInput([[0, 1], [0, 1]]);
      assert.equal(net.weightsCache.length, 1);
      assert.equal(net.weightsCache[0].length, 4);
      assert.equal(net.layers.length, 8);

      const weightsCache = net.weightsCache[0];
      const { layers } = net;
      assert.equal(layers[0].weights.length, weightsCache[0].length);
      assert.equal(layers[0].weights[0].length, weightsCache[0][0].length);
      assert.deepEqual(layers[0].weights, weightsCache[0]);

      assert.equal(layers[1].weights.length, weightsCache[1].length);
      assert.equal(layers[1].weights[0].length, weightsCache[1][0].length);
      assert.notDeepEqual(layers[1].weights, weightsCache[1]);

      assert.equal(layers[2].weights.length, weightsCache[2].length);
      assert.equal(layers[2].weights[0].length, weightsCache[2][0].length);
      assert.notDeepEqual(layers[2].weights, weightsCache[2]);

      assert.equal(layers[3].weights.length, weightsCache[3].length);
      assert.equal(layers[3].weights[0].length, weightsCache[3][0].length);
      assert.notDeepEqual(layers[3].weights, weightsCache[3]);
    });
  });
});