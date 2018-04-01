import assert from 'assert';
import sinon from 'sinon';
import { Recurrent, layer } from '../../src/index';
import RecurrentConnection from "../../src/layer/recurrent-connection";
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
        'Random',
        'Multiply',
        'Random',
        'RecurrentZeros',
        'Multiply',
        'Add',
        'Random',
        'Add',
        'Relu'
      ]);
      assert.deepEqual(net._outputLayers.map(layer => layer.constructor.name), [
        'Random',
        'RecurrentConnection',
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
      assert.equal(net._inputLayers.length, 1);
      assert.equal(net._hiddenLayers[0].length, 4);
      assert.equal(net._hiddenLayers[1].length, 4);
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
      assert.equal(net._hiddenLayers.length, 2);
      assert.equal(net._hiddenLayers[0].length, 4);

      assert(net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._hiddenLayers[0][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][3].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._outputLayers[0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[3].deltas.every(row => row.every(delta => delta === 0)));

      net._calculateDeltas([0], 1);
      net._calculateDeltas([1], 0);

      // first layer
      assert(net._inputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net._hiddenLayers[0][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][3].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net._outputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[2].deltas.every(row => row.some(delta => delta !== 0)));


      // second layer
      assert(net._hiddenLayers[1][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][3].deltas.every(row => row.some(delta => delta !== 0)));
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
      assert.equal(net._hiddenLayers[0].length, 4);
      const hiddenLayers00Weights = net._hiddenLayers[0][0].weights;
      const hiddenLayers01Weights = net._hiddenLayers[0][1].weights;
      const hiddenLayers02Weights = net._hiddenLayers[0][2].weights;
      const hiddenLayers03Weights = net._hiddenLayers[0][3].weights;
      const hiddenLayers10Weights = net._hiddenLayers[1][0].weights;
      const hiddenLayers11Weights = net._hiddenLayers[1][1].weights;
      const hiddenLayers12Weights = net._hiddenLayers[1][2].weights;
      const hiddenLayers13Weights = net._hiddenLayers[1][3].weights;
      const outputLayers0Weights = net._outputLayers[0].weights;
      const outputLayers1Weights = net._outputLayers[1].weights;
      const outputLayers2Weights = net._outputLayers[2].weights;
      const outputLayers3Weights = net._outputLayers[3].weights;

      assert(net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._hiddenLayers[0][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][3].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._hiddenLayers[1][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[1][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[1][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[1][3].deltas.every(row => row.every(delta => delta === 0)));

      assert(net._outputLayers[0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[3].deltas.every(row => row.every(delta => delta === 0)));

      net._calculateDeltas([0], 1);
      net._calculateDeltas([1], 0);

      assert(net._inputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));

      // first hidden layer
      assert(net._hiddenLayers[0][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[0][3].deltas.every(row => row.some(delta => delta !== 0)));

      // second hidden layer
      assert(net._hiddenLayers[1][0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][2].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._hiddenLayers[1][3].deltas.every(row => row.some(delta => delta !== 0)));

      assert(net._outputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[2].deltas.every(row => row.some(delta => delta !== 0)));

      net._adjustWeights();

      assert.notDeepEqual(hiddenLayers00Weights, net._hiddenLayers[0][0].weights);
      assert.notDeepEqual(hiddenLayers01Weights, net._hiddenLayers[0][1].weights);
      assert.notDeepEqual(hiddenLayers02Weights, net._hiddenLayers[0][2].weights);
      assert.notDeepEqual(hiddenLayers03Weights, net._hiddenLayers[0][3].weights);
      assert.notDeepEqual(hiddenLayers10Weights, net._hiddenLayers[1][0].weights);
      assert.notDeepEqual(hiddenLayers11Weights, net._hiddenLayers[1][1].weights);
      assert.notDeepEqual(hiddenLayers12Weights, net._hiddenLayers[1][2].weights);
      assert.notDeepEqual(hiddenLayers13Weights, net._hiddenLayers[1][3].weights);
      assert.notDeepEqual(outputLayers0Weights, net._outputLayers[0].weights);
      assert.notDeepEqual(outputLayers1Weights, net._outputLayers[1].weights);
      assert.notDeepEqual(outputLayers2Weights, net._outputLayers[2].weights);
      assert.notDeepEqual(outputLayers3Weights, net._outputLayers[3].weights);
    });
  });
  describe('.trainPattern()', () => {
    it('steps back through values correctly', () => {
      class SuperLayer {
        constructor() {
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
      net.trainPattern([0, 1], [2]);

      assert.deepEqual(net._outputLayers[0].compare.firstCall.args, [[2]]);
      assert.deepEqual(net._outputLayers[0].compare.secondCall.args, [[1]]);
    });
  });
});