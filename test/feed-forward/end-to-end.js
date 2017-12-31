import assert from 'assert';
import { FeedForward, layer } from '../../src';
import randos2D from '../../src/utilities/randos-2d';
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
  describe('.runInput()', () => {
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
      assert.equal(result[0][0] < 1 && result[0][0] > 0, true, 'that any number comes out');
    });
  });
  describe('.train()', () => {
    it('outputs a number that is smaller than when it started', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          (input) => feedForward({ width: 1, height: 1 }, input)
        ],
        outputLayer: (input) => output({ width: 1, height: 1 }, input)
      });

      net.initialize();

      const errors = [];
      const xorTrainingData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] }
      ];
      net.train(xorTrainingData, {
        iterations: 3,
        callbackPeriod: 1,
        callback: (info) => errors.push(info.error) });
      assert.equal(errors[0] > errors[2], true, 'that any number comes out');
    });
  });
  describe('.calculateDeltas()', () => {
    it.only('populates deltas from output to input', () => {
      class SuperOutput extends Output {
        constructor(settings, inputLayer) {
          super(settings);
          this.deltas = randos2D();
        }
      }

      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          (input) => feedForward({ width: 1, height: 1 }, input)
        ],
        outputLayer: (input) => new SuperOutput({ width: 1, height: 1 }, input)
      });

      net.initialize();
      net.calculateDeltas([[1]]);
      console.log('hi mom');
    });
  });
});