import { Recurrent, layer } from '../../src/index';
const { input, output, recurrent } = layer;
import assert from 'assert';

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
});