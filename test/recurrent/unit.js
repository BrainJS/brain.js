import assert from 'assert';
import sinon from 'sinon';
import { Recurrent, layer } from '../../src/index';
import RecurrentConnection from "../../src/layer/recurrent-connection";
import {Filter, Model} from "../../src/layer/types";
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
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          (input, recurrentInput) => {
            recurrentInput.setDimensions(1, 3);
            return recurrent({ height: 3 }, input, recurrentInput);
          }
        ],
        outputLayer: input => output({ height: 1 }, input)
      });

      net.initialize();

      assert.deepEqual(net._inputLayers.map(layer => layer.constructor.name), [
        'Input'
      ]);
      assert.deepEqual(net._hiddenLayers[0].map(layer => layer.constructor.name), [
        'Multiply',
        'RecurrentZeros',
        'Multiply',
        'Add',
        'Add',
        'Relu'
      ]);
      assert.deepEqual(net._outputLayers.map(layer => layer.constructor.name), [
        'Random',
        'RecurrentConnection',
        'Multiply',
        'Zeros',
        'Add',
        'Target'
      ]);
    });
  });
  describe('.runInput()', () => {
    it('forward propagates', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 1 }),
        hiddenLayers: [
          (input, recurrentInput) => {
            recurrentInput.setDimensions(1, 1);
            return multiply(multiply(random({ width: 1, height: 1 }), input), recurrentInput);
          }
        ],
        outputLayer: input => output({ width: 1, height: 1 }, input)
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([0, 1]);
      assert.equal(net._model.length, 1);
      assert.equal(net._inputLayers.length, 1);
      assert.equal(net._hiddenLayers[0].length, 3);
      assert.equal(net._hiddenLayers[1].length, 3);
    });
  });
  describe('.calculateDeltas()', () => {
    it('back propagates values through deltas', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (input, recurrentInput) => {
            recurrentInput.setDimensions(1, 3);
            return add(multiply(random({ height: 3 }), input), recurrentInput);
          }
        ],
        outputLayer: input => output({ height: 1 }, input)
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      assert.equal(net._model.length, 1);
      assert.equal(net._hiddenLayers.length, 2);
      assert.equal(net._hiddenLayers[0].length, 3);

      assert(net._model[0].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._hiddenLayers[0][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._outputLayers[0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[2].deltas.every(row => row.every(delta => delta === 0)));

      net._calculateDeltas([0], 1);
      net._calculateDeltas([1], 0);

      assert(net._model[0].deltas.every(row => row.some(delta => delta !== 0)));

      // first layer
      assert(net._inputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net._hiddenLayers[0][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.some(delta => delta !== 0)));

      // second layer
      assert(net._hiddenLayers[1][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][2].deltas.every(row => row.some(delta => delta !== 0)));

      // output layer
      assert(net._outputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[2].deltas.every(row => row.some(delta => delta !== 0)));
    });
  });
  describe('.adjustWeights()', () => {
    it('back propagates values through weights', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (input, recurrentInput) => {
            recurrentInput.setDimensions(1, 3);
            return add(multiply(random({ height: 3 }), input), recurrentInput);
          }
        ],
        outputLayer: input => output({ height: 1 }, input)
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      assert.equal(net._model.length, 1);
      assert.equal(net._hiddenLayers[0].length, 3);
      const model0Weights = net._model[0].weights;
      const hiddenLayers00Weights = net._hiddenLayers[0][0].weights;
      const hiddenLayers01Weights = net._hiddenLayers[0][1].weights;
      const hiddenLayers02Weights = net._hiddenLayers[0][2].weights;
      const hiddenLayers10Weights = net._hiddenLayers[1][0].weights;
      const hiddenLayers11Weights = net._hiddenLayers[1][1].weights;
      const hiddenLayers12Weights = net._hiddenLayers[1][2].weights;
      const outputLayers0Weights = net._outputLayers[0].weights;
      const outputLayers1Weights = net._outputLayers[1].weights;
      const outputLayers2Weights = net._outputLayers[2].weights;
      const outputLayers3Weights = net._outputLayers[3].weights;

      net._adjustWeights();

      // weights are adjusted
      assert.notEqual(model0Weights, net._model[0].weights);
      assert.notEqual(hiddenLayers00Weights, net._hiddenLayers[0][0].weights);
      assert.notEqual(hiddenLayers01Weights, net._hiddenLayers[0][1].weights);
      assert.notEqual(hiddenLayers02Weights, net._hiddenLayers[0][2].weights);
      assert.notEqual(hiddenLayers10Weights, net._hiddenLayers[1][0].weights);
      assert.notEqual(hiddenLayers11Weights, net._hiddenLayers[1][1].weights);
      assert.notEqual(hiddenLayers12Weights, net._hiddenLayers[1][2].weights);
      assert.notEqual(outputLayers0Weights, net._outputLayers[0].weights);
      assert.notEqual(outputLayers1Weights, net._outputLayers[1].weights);
      assert.notEqual(outputLayers2Weights, net._outputLayers[2].weights);
      assert.notEqual(outputLayers3Weights, net._outputLayers[3].weights);
    });
  });
  describe('._trainPattern()', () => {
    it('steps back through values correctly', () => {
      class SuperLayer extends Filter {
        constructor() {
          super();
          this.width = 1;
          this.height = 1;
        }
        setupKernels() {}
        reuseKernels() {}
        predict() {}
        compare() {}
        learn() {}
      }
      const net = new Recurrent({
        inputLayer: () => new SuperLayer(),
        hiddenLayers: [
          (input, recurrentInput) => new SuperLayer(),
        ],
        outputLayer: input => new SuperLayer()
      });

      net.initialize();
      net.initializeDeep();
      net._inputLayers[0].compare = sinon.spy();
      net._hiddenLayers[0][0].compare = sinon.spy();
      net._hiddenLayers[1][0].compare = sinon.spy();
      net._outputLayers[0].compare = sinon.spy();
      net.runInput([0, 1]);
      net._trainPattern([0, 1], [2]);

      assert.equal(net._outputLayers[0].compare.callCount, 2);
      assert.deepEqual(net._outputLayers[0].compare.firstCall.args, [[2]]);
      assert.deepEqual(net._outputLayers[0].compare.secondCall.args, [[1]]);
    });
    describe('when called more than once', () => {
      it('continuously updates output layer', () => {
        const net = new Recurrent({
          inputLayer: () => input({ height: 1 }),
          hiddenLayers: [
            (input, recurrentInput) => recurrent({ height: 3 }, input, recurrentInput)
          ],
          outputLayer: input => output({ height: 1 }, input)
        });
        net.initialize();
        net.initializeDeep();

        const lastOutputLayer = net._outputLayers[net._outputLayers.length - 1];
        assert.deepEqual(lastOutputLayer.weights, [[0]]);
        net._trainPattern([1, 2], [3]);
        const weights1 = lastOutputLayer.weights;
        assert.notDeepEqual(weights1, [[0]]);
        net._trainPattern([3, 2], [1]);
        const weights2 = lastOutputLayer.weights;
        assert.notDeepEqual(weights1, weights2);
        net._trainPattern([1, 1], [1]);
        const weights3 = lastOutputLayer.weights;
        assert.notDeepEqual(weights2, weights3);
        net._trainPattern([3, 3], [3]);
        const weights4 = lastOutputLayer.weights;
        assert.notDeepEqual(weights3, weights4);
      });
    });
  });
});