import assert from 'assert';
import sinon from 'sinon';
import NeuralNetwork from '../../src/neural-network';
import FeedForward from '../../src/feed-forward';
import * as layer from '../../src/layer/index';
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
  softMax,
  Target,
  target,
  Zeros,
  zeros } = layer;

const xorTrainingData = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] }
];

describe('FeedForward Class: End to End', () => {
  describe('when configured like NeuralNetwork', () => {
    it.only('outputs the exact same values', () => {
      const standardNet = new NeuralNetwork([2, 3, 1]);
      const ffNet = new FeedForward({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input) => feedForward({ width: 3 }, input),
          (input) => feedForward({ width: 1 }, input)
        ],
        outputLayer: (input) => target({ width: 1 }, input)
      });

      ffNet.initialize();
      // learning deviates, which we'll test elsewhere, for the time being, just don't learn
      standardNet._adjustWeights = () => {};
      ffNet.layers.forEach(layer => {
        layer.praxis.run = () => {};
        layer.learn = () => {};
      });
      standardNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1
      });
      ffNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1
      });

      // set both nets exactly the same, then train them once, and compare
      const biasLayers = ffNet.layers.filter(layer => layer.name === 'biases');
      const weightLayers = ffNet.layers.filter(layer => layer.name === 'weights');
      const sigmoidLayers = ffNet.layers.filter(layer => layer.constructor === Sigmoid);

      // zero out
      ffNet.layers.forEach((layer, i) => {
        layer.deltas = zeros2D(layer.width, layer.height);
        layer.weights = zeros2D(layer.width, layer.height);
      });
      standardNet.deltas.forEach((deltas) => {
        for (let i = 0; i < deltas.length; i++) {
          deltas[i] = 0;
        }
      });

      // set biases
      standardNet.biases[1][0] = biasLayers[0].weights[0][0] = -0.15;
      standardNet.biases[1][1] = biasLayers[0].weights[1][0] -0.17;
      standardNet.biases[1][2] = biasLayers[0].weights[2][0] -0.12;
      standardNet.biases[2][0] = biasLayers[1].weights[0][0] = 0.17;

      // set weights
      standardNet.outputs[0][0] = ffNet._inputLayer.weights[0][0] = 1;
      standardNet.outputs[0][1] = ffNet._inputLayer.weights[1][0] = 1;

      standardNet.weights[1][0][0] = weightLayers[0].weights[0][0] = -0.15;
      standardNet.weights[1][0][1] = weightLayers[0].weights[0][1] = 0.10;
      standardNet.weights[1][1][0] = weightLayers[0].weights[1][0] = -0.13;
      standardNet.weights[1][1][1] = weightLayers[0].weights[1][1] = 0.01;
      standardNet.weights[1][2][0] = weightLayers[0].weights[2][0] = 0.08;
      standardNet.weights[1][2][1] = weightLayers[0].weights[2][1] = -0.14;

      standardNet.weights[2][0][0] = weightLayers[1].weights[0][0] = -0.12;
      standardNet.weights[2][0][1] = weightLayers[1].weights[0][1] = -0.6;
      standardNet.weights[2][0][2] = weightLayers[1].weights[0][2] = 0.13;

      standardNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1
      });
      ffNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1,
        reinforce: true
      });

      assert.equal(standardNet.outputs[1][0].toFixed(6), sigmoidLayers[0].weights[0][0].toFixed(6));
      assert.equal(standardNet.outputs[1][1].toFixed(6), sigmoidLayers[0].weights[1][0].toFixed(6));
      assert.equal(standardNet.outputs[1][2].toFixed(6), sigmoidLayers[0].weights[2][0].toFixed(6));
      assert.equal(standardNet.outputs[2][0].toFixed(6), sigmoidLayers[1].weights[0][0].toFixed(6));
      console.log(JSON.stringify(standardNet.toJSON(), null, 2));
      console.log(JSON.stringify(ffNet.toJSON(), null, 2));
    });
  });
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
      assert.equal(typeof result[0][0] === 'number', true, 'that any number comes out');
    });
  });
  describe('.train()', () => {
    it('outputs a number that is smaller than when it started', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input) => feedForward({ width: 3 }, input),
          (input) => feedForward({ width: 1 }, input)
        ],
        outputLayer: (input) => target({ width: 1 }, input)
      });
      const errors = [];
      net.train(xorTrainingData, {
        iterations: 10,
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
      assert(errors[0] > errors[9]);
    });
    it('can learn xor', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 2 }),
        hiddenLayers: [
          (input) => feedForward({ width: 3 }, input),
          (input) => feedForward({ width: 1 }, input)
        ],
        outputLayer: (input) => target({ width: 1 }, input)
      });
      const errors = [];
      net.train(xorTrainingData, {
        iterations: 1000,
        callbackPeriod: 1,
        callback: (info) => errors.push(info.error)
      });
      const json = net.toJSON();
      //console.log(JSON.stringify(json, null, 2));
      const result1 = net.run([0, 0]);
      const result2 = net.run([0, 1]);
      const result3 = net.run([1, 0]);
      const result4 = net.run([1, 1]);
      console.log(result1, result2, result3, result4);
      assert.equal(result1[0][0] < 0.5, true, `with input of [0, 0], output is ${result1}, but should be < 0.5`);
      assert.equal(result2[0][0] > 0.5, true, `with input of [0, 1], output is ${result2}, but should be > 0.5`);
      assert.equal(result3[0][0] > 0.5, true, `with input of [1, 0], output is ${result3}, but should be > 0.5`);
      assert.equal(result4[0][0] < 0.5, true, `with input of [1, 1], output is ${result4}, but should be < 0.5`);
    });
  });
  describe('.calculateDeltas()', () => {
    it('populates deltas from output to input', () => {
      class SuperOutput extends Target {
        constructor(settings, inputLayer) {
          super(settings, inputLayer);
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
        if (layerIndex === 0) return;
        layer.deltas.forEach((row, rowIndex) => {
          row.forEach((delta, deltaIndex) => {
            assert.equal(delta, 0, `delta is ${ delta } of layer type ${ layer.constructor.name } with layerIndex of ${ layerIndex }, rowIndex of ${ rowIndex }, and deltaIndex of ${ deltaIndex }`);
          });
        });
      });
      net.calculateDeltas([[1]]);
      net.layers.forEach((layer, layerIndex) => {
        if (!layer.deltas) return;
        if (layerIndex === net.layers.length - 1) return;
        layer.deltas.forEach((row, rowIndex) => {
          row.forEach((delta, deltaIndex) => {
            assert.notEqual(delta, 0, `delta is ${ delta } of layer type ${ layer.constructor.name } with layerIndex of ${ layerIndex }, rowIndex of ${ rowIndex }, and deltaIndex of ${ deltaIndex }`);
          });
        });
      });
    });
  });
});