import assert from 'assert';
import { FeedForward, layer } from '../../src';
import zeros2D from '../../src/utilities/zeros-2d';
const {
  Base,
  Convolution,
  convolution,
  feedForward,
  Input,
  input,
  multiply,
  Output,
  output,
  Pool,
  pool,
  random,
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
      assert.equal(result[0][0] !== 0 && typeof result[0][0] === 'number', true, 'that any number comes out');
    });
  });
  describe('.train()', () => {
    it.only('outputs a number that is smaller than when it started', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input) => feedForward({ width: 3 }, input)
        ],
        outputLayer: (input) => {
          const outputGate = random({ width: 3, height: 1 });
          const outputConnector = multiply(
            outputGate,
            input
          );
          return output({}, outputConnector)
        }
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
        iterations: 300,
        threshold: 0.5,
        callbackPeriod: 1,
        callback: (info) => errors.push(info.error) });
      assert.equal(
        typeof errors[0] === 'number'
        && typeof errors[1] === 'number'
        && typeof errors[2] === 'number'
        && typeof errors[3] === 'number'
        && typeof errors[4] === 'number'
        && typeof errors[5] === 'number'
        && typeof errors[6] === 'number'
        && typeof errors[7] === 'number'
        && typeof errors[8] === 'number'
        && typeof errors[9] === 'number', true, 'training produces numerical errors');
      console.log(net.run([0, 0]));
      console.log(net.run([0, 1]));
      console.log(net.run([1, 0]));
      console.log(net.run([1, 1]));
      assert.equal(errors[0] > errors[299], true, 'error rate falls');

    });
  });
  describe('.calculateDeltas()', () => {
    it('populates deltas from output to input', () => {
      class SuperOutput extends Output {
        constructor(settings, inputLayer) {
          super(settings);
          this.deltas = zeros2D(this.width, this.height);
          this.inputLayer = inputLayer;
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
      net.layers[0].weights = [[1]];
      net.layers.forEach((layer, layerIndex) => {
        //inputs?
        if (!layer.deltas) return;
        layer.deltas.forEach((row, rowIndex) => {
          row.forEach((delta, deltaIndex) => {
            assert.equal(delta, 0, `delta is ${ delta } of layer type ${ layer.constructor.name } with layerIndex of ${ layerIndex }, rowIndex of ${ rowIndex }, and deltaIndex of ${ deltaIndex }`);
          })
        })
      });
      net.calculateDeltas([[1]]);
      net.layers.forEach((layer, layerIndex) => {
        if (!layer.deltas) return;
        if (layerIndex === net.layers.length - 1) return;
        layer.deltas.forEach((row, rowIndex) => {
          row.forEach((delta, deltaIndex) => {
            assert.notEqual(delta, 0, `delta is ${ delta } of layer type ${ layer.constructor.name } with layerIndex of ${ layerIndex }, rowIndex of ${ rowIndex }, and deltaIndex of ${ deltaIndex }`);
          })
        })
      });
    });
  });
});