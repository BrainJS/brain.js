const { GPU } = require('gpu.js');
const { Recurrent, layer } = require('../../src');
const { setup, teardown } = require('../../src/utilities/kernel');
// import RecurrentConnection from '../../src/layer/recurrent-connection'
const { Filter } = require('../../src/layer/types');

const { add, input, multiply, output, random, recurrent } = layer;

describe('Recurrent Class: Unit', () => {
  beforeEach(() => {
    setup(new GPU({ mode: 'cpu' }));
  });
  afterEach(() => {
    teardown();
  });
  describe('.initialize()', () => {
    test('can validate a simple recurrent neural network', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          (inputLayer, recurrentInput) => {
            recurrentInput.setDimensions(1, 3);
            return recurrent({ height: 3 }, inputLayer, recurrentInput);
          },
        ],
        outputLayer: inputLayer => output({ height: 1 }, inputLayer),
      });

      net.initialize();

      expect(net._inputLayers.map(l => l.constructor.name)).toEqual(['Input']);
      expect(net._hiddenLayers[0].map(l => l.constructor.name)).toEqual([
        'Multiply',
        'RecurrentZeros',
        'Multiply',
        'Add',
        'Add',
        'Relu',
      ]);
      expect(net._outputLayers.map(l => l.constructor.name)).toEqual([
        'Random',
        'RecurrentConnection',
        'Multiply',
        'Zeros',
        'Add',
        'Target',
      ]);
    });
  });
  describe('.runInput()', () => {
    test('forward propagates', () => {
      const net = new Recurrent({
        inputLayer: () => input({ width: 1 }),
        hiddenLayers: [
          (inputLayer, recurrentInput) => {
            recurrentInput.setDimensions(1, 1);
            return multiply(
              multiply(random({ width: 1, height: 1 }), inputLayer),
              recurrentInput
            );
          },
        ],
        outputLayer: inputLayer => output({ width: 1, height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([0, 1]);
      expect(net._model.length).toEqual(1);
      expect(net._inputLayers.length).toEqual(1);
      expect(net._hiddenLayers[0].length).toEqual(3);
      expect(net._hiddenLayers[1].length).toEqual(3);
    });
  });
  describe('.calculateDeltas()', () => {
    test('back propagates values through deltas', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer, recurrentInput) => {
            recurrentInput.setDimensions(1, 3);
            return add(
              multiply(random({ height: 3 }), inputLayer),
              recurrentInput
            );
          },
        ],
        outputLayer: inputLayer => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      expect(net._model.length).toEqual(1);
      expect(net._hiddenLayers.length).toEqual(2);
      expect(net._hiddenLayers[0].length).toEqual(3);

      expect(
        net._model[0].deltas.every(row => row.every(delta => delta === 0))
      ).toBeTruthy();

      expect(
        net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0))
      ).toBeTruthy();

      expect(
        net._hiddenLayers[0][0].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayers[0][1].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayers[0][2].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();

      expect(
        net._outputLayers[0].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._outputLayers[1].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._outputLayers[2].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();

      net._calculateDeltas([0], 1);
      net._calculateDeltas([1], 0);

      expect(
        net._model[0].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();

      // first layer
      expect(
        net._inputLayers[0].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();

      expect(
        net._hiddenLayers[0][0].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayers[0][1].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayers[0][2].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();

      // second layer
      expect(
        net._hiddenLayers[1][0].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayers[1][1].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayers[1][2].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();

      // output layer
      expect(
        net._outputLayers[0].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();
      expect(
        net._outputLayers[1].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();
      expect(
        net._outputLayers[2].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();
    });
  });
  describe('.adjustWeights()', () => {
    test('back propagates values through weights', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer, recurrentInput) => {
            recurrentInput.setDimensions(1, 3);
            return add(
              multiply(random({ height: 3 }), inputLayer),
              recurrentInput
            );
          },
        ],
        outputLayer: inputLayer => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      expect(net._model.length).toEqual(1);
      expect(net._hiddenLayers[0].length).toEqual(3);
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

      net._calculateDeltas([1], 0);
      net._calculateDeltas([1], 1);
      net.adjustWeights();

      // weights are adjusted
      expect(model0Weights).not.toEqual(net._model[0].weights);
      expect(hiddenLayers00Weights).not.toEqual(net._hiddenLayers[0][0].weights);
      expect(hiddenLayers01Weights).not.toEqual(net._hiddenLayers[0][1].weights);
      expect(hiddenLayers02Weights).not.toEqual(net._hiddenLayers[0][2].weights);
      expect(hiddenLayers10Weights).not.toEqual(net._hiddenLayers[1][0].weights);
      expect(hiddenLayers11Weights).not.toEqual(net._hiddenLayers[1][1].weights);
      expect(hiddenLayers12Weights).not.toEqual(net._hiddenLayers[1][2].weights);
      expect(outputLayers0Weights).not.toEqual(net._outputLayers[0].weights);
      expect(outputLayers1Weights).not.toEqual(net._outputLayers[1].weights);
      expect(outputLayers2Weights).not.toEqual(net._outputLayers[2].weights);
      expect(outputLayers3Weights).not.toEqual(net._outputLayers[3].weights);
    });
  });
  describe('._trainPattern()', () => {
    test('steps back through values correctly', () => {
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
        hiddenLayers: [() => new SuperLayer()],
        outputLayer: () => new SuperLayer(),
      });

      net.initialize();
      net.initializeDeep();
      net._inputLayers[0].compare = jest.fn();
      net._hiddenLayers[0][0].compare = jest.fn();
      net._hiddenLayers[1][0].compare = jest.fn();
      net._outputLayers[0].compare = jest.fn();
      net.runInput([0, 1]);
      net._trainPattern([0, 1], [2]);

      // expect(net._outputLayers[0].compare).toHaveBeenCalledWith(2);
      expect(net._outputLayers[0].compare).toHaveBeenCalledWith([2]);
      expect(net._outputLayers[0].compare).toHaveBeenCalledWith([1]);
    });
    describe('when called more than once', () => {
      test('continuously updates output layer', () => {
        const net = new Recurrent({
          inputLayer: () => input({ height: 1 }),
          hiddenLayers: [
            (inputLayer, recurrentInput) =>
              recurrent({ height: 3 }, inputLayer, recurrentInput),
          ],
          outputLayer: inputLayer => output({ height: 1 }, inputLayer),
        });
        net.initialize();
        net.initializeDeep();

        const lastOutputLayer = net._outputLayers[net._outputLayers.length - 1];
        expect(Array.from(lastOutputLayer.weights)).toEqual([0]);
        net._trainPattern([1, 2], [3]);
        const weights1 = lastOutputLayer.weights;
        expect(weights1).not.toEqual([[0]]);
        net._trainPattern([3, 2], [1]);
        const weights2 = lastOutputLayer.weights;
        expect(weights1).not.toEqual(weights2);
        net._trainPattern([1, 1], [1]);
        const weights3 = lastOutputLayer.weights;
        expect(weights2).not.toEqual(weights3);
        net._trainPattern([3, 3], [3]);
        const weights4 = lastOutputLayer.weights;
        expect(weights3).not.toEqual(weights4);
      });
    });
  });
});
