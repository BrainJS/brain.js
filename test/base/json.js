import assert from 'assert';
import NeuralNetwork from './../../src/neural-network';

describe('JSON', () => {
  const originalNet = new NeuralNetwork();

  originalNet.train([
    {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }, {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }
  ]);

  const serialized = originalNet.toJSON();
  const serializedNet = new NeuralNetwork().fromJSON(serialized);

  const input = {'0' : Math.random(), b: Math.random()};
  describe('.toJSON()', () => {
    describe('.layers', () => {

      it('layer count is correct', () => {
        assert.equal(serialized.layers.length, 3);
        originalNet.sizes.forEach((size, i) => {
          assert.equal(size, Object.keys(serialized.layers[i]).length);
        });
      });

      describe('input layer', () => {
        const inputLayer = serialized.layers[0];
        it('is empty, but describes input', () => {
          const keys = Object.keys(inputLayer);
          assert(keys.length === 2);
          assert(inputLayer.hasOwnProperty('0'));
          assert(inputLayer.hasOwnProperty('b'));
          assert(Object.keys(inputLayer['0']).length === 0);
          assert(Object.keys(inputLayer['b']).length === 0);
        });
      });

      describe('hidden layers', () => {
        it('are populated exactly from original net', () => {
          assert.equal(serialized.layers[1][0].bias, originalNet.biases[1][0]);
          assert.equal(serialized.layers[1][1].bias, originalNet.biases[1][1]);
          assert.equal(serialized.layers[1][2].bias, originalNet.biases[1][2]);
          assert.equal(serialized.layers[2]['0'].bias, originalNet.biases[2][0]);
          assert.equal(serialized.layers[2]['c'].bias, originalNet.biases[2][1]);
        });
      });
    });

    describe('.activation', () => {
      it('exports correctly', () => {
        assert.equal(serialized.activation, originalNet.activation);
      });
    });
  });

  describe('.fromJSON()', () => {
    describe('importing values', () => {
      describe('.layers', () => {
        it('layer count is correct', () => {
          assert.equal(serializedNet.biases.length, 3);
          assert.equal(serializedNet.biases['1'].length, 3);
          assert.equal(serializedNet.weights.length, 3);
        });

        describe('hidden layers', () => {
          it('are populated exactly from serialized', () => {
            assert.equal(serializedNet.biases[1][0], serialized.layers[1][0].bias);
            assert.equal(serializedNet.biases[1][1], serialized.layers[1][1].bias);
            assert.equal(serializedNet.biases[1][2], serialized.layers[1][2].bias);
            assert.equal(serializedNet.biases[2][0], serialized.layers[2]['0'].bias);
            assert.equal(serializedNet.biases[2][1], serialized.layers[2]['c'].bias);
          });
        });
      });

      describe('.activation', () => {
        it('exports correctly', () => {
          assert.equal(serializedNet.activation, serialized.activation);
        });
      });
    });

    it('can run originalNet, and serializedNet, with same output', () => {
      const output1 = originalNet.run(input);
      const output2 = serializedNet.run(input);
      assert.deepEqual(output2, output1,
        'loading json serialized network failed');
    });
  });
});
