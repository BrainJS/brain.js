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
          (input, recurrentInput) => recurrent({ height: 3 }, input, recurrentInput),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();

      assert.deepEqual(net.layers[0].map(layer => layer.constructor.name), [
        'Input',
        'Random',
        'Multiply',
        'Random',
        'RecurrentZeros',
        'Multiply',
        'Add',
        'Random',
        'Add',
        'Relu',
        'Random',
        'Multiply',
        'Target'
      ]);
    });
  });
  describe('.runInput()', () => {
    it('forward propagates', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 1 }),
        hiddenLayers: [
          (input, recurrentInput) => multiply(multiply(random({ width: 1, height: input.width }), input), recurrentInput),
        ],
        outputLayer: input => output({ width: 1, height: input.width }, input)
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([0, 1]);
      assert.equal(net.layers.length, 2);
      assert.equal(net.layers[0].length, 8);
      assert.equal(net.layers[1].length, 8);
    });
  });
  describe('.calculateDeltas()', () => {
    it('back propagates values through deltas', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 1 }),
        hiddenLayers: [
          (input, recurrentInput) => add(multiply(random({ height: 3 }), input), recurrentInput),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();
      net.initializeDeep();
      net.initializeDeep();
      net.runInput([1, 1, 1]);
      assert.equal(net.layers[0].length, 8);
      assert(net.layers[0][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][3].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][4].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][5].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][6].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][7].deltas.every(row => row.every(delta => delta === 0)));

      net._calculateDeltas([1, 1, 1]);

      assert(net.layers[0][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][7].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net.layers[1][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][7].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net.layers[2][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][7].deltas.every(row => row.some(delta => delta !== 0)));
    });
  });
  describe('.adjustWeights()', () => {
    it('', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 1 }),
        hiddenLayers: [
          (input, recurrentInput) => add(multiply(random({ height: 3 }), input), recurrentInput),
        ],
        outputLayer: input => output({ width: 1 }, input)
      });

      net.initialize();
      net.initializeDeep();
      net.initializeDeep();
      net.runInput([1, 1, 1]);
      assert.equal(net.layers[0].length, 8);
      assert(net.layers[0][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][3].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][4].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][5].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][6].deltas.every(row => row.every(delta => delta === 0)));
      assert(net.layers[0][7].deltas.every(row => row.every(delta => delta === 0)));

      net._calculateDeltas([1, 1, 1]);

      assert(net.layers[0][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[0][7].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net.layers[1][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[1][7].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net.layers[2][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][3].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][4].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][5].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][6].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net.layers[2][7].deltas.every(row => row.some(delta => delta !== 0)));

      net._adjustWeights();
    });
  });
});