'use strict';
import assert from 'assert';
import { FeedForward, layer } from '../../../src';
const {
  Base,
  Convolution,
  convolution,
  feedForward,
  Input,
  input,
  Output,
  output,
  Pool,
  pool,
  Relu,
  relu,
  Sigmoid,
  sigmoid,
  SoftMax,
  softMax } = layer;

describe('FeedForward Class: End to End', () => {
  describe('simple implementation', () => {
    //Todo: rewrite when real values are moving through network
    it('outputs a number', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          (input) => feedForward({ width: 1, height: 1 }, input)
        ],
        outputLayer: (input) => output({ width: 1, height: 1 }, input)
      });

      net.initialize();

      const result = net.runInput([[1]]);
      console.log(result);
      assert.equal(result < 1 && result > 0, true, 'that any number comes out');
    });
  });
});