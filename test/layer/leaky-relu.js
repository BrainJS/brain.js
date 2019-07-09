const assert = require('chai').assert;
const gpuMock = require('gpu-mock.js');
const llr = require('../../src/layer/leaky-relu');
const predict = llr.predict;
const compare = llr.predict;

describe('Leaky Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can leaky relu a simple matrix', () => {
      const inputs = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
      ];
      const results = gpuMock(predict, {
        output: [3,3]
      })(inputs);

      assert.deepEqual(results, [
        [.1, -.002, .3],
        [-.004, .5, -.006],
        [.7, -.008, .9]
      ]);
    });
  });

  describe('.compare (back propagation)', () => {
    it('can leaky relu a simple matrix', () => {
      const inputs = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
      ];
      const deltas = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ];
      const results = gpuMock(compare, {
        output: [3,3]
      })(inputs, deltas);
      assert.deepEqual(results, [
        [ 1, .01, 1 ],
        [ .01, 1, .01 ],
        [ 1, .01, 1 ]
      ]);
    });
  });
});