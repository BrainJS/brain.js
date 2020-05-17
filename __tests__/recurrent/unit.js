const { GPU } = require('gpu.js');
const { Recurrent, layer } = require('../../src');
const { add, input, multiply, output, random, rnnCell } = layer;
const { setup, teardown } = require('../../src/utilities/kernel');
const { Filter } = require('../../src/layer/types');
const { injectIstanbulCoverage } = require('../test-utils');

function copy2D(matrix) {
  if (matrix.clone) {
    return matrix.clone();
  }
  return matrix.map((row) => Float32Array.from(row));
}

describe('Recurrent Class: Unit', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
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
            return rnnCell({ height: 3 }, inputLayer, recurrentInput);
          },
        ],
        outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
      });

      net.initialize();

      const layers = net._layerSets[net._layerSets.length - 1];
      expect(layers.map((l) => l.constructor.name)).toEqual([
        'Input',
        'Random',
        'Multiply',
        'Random',
        'RecurrentZeros',
        'Multiply',
        'Add',
        'Zeros',
        'Add',
        'Relu',
        'Random',
        'Multiply',
        'Random',
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
        outputLayer: (inputLayer) =>
          output({ width: 1, height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();

      const spySets = net._layerSets.map((layerSet) =>
        layerSet.map((l) => jest.spyOn(l, 'predict'))
      );

      net.runInput([0, 1]);
      expect(net._model.length).toEqual(3);
      for (let i = 0; i < spySets.length; i++) {
        for (let j = 0; j < spySets[i].length; j++) {
          expect(spySets[i][j]).toHaveBeenCalled();
        }
      }
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
        outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      expect(net._model.length).toEqual(3);
      expect(net._layerSets.length).toEqual(2);

      for (let i = 0; i < net._layerSets.length; i++) {
        for (let j = 0; j < net._layerSets[i].length; j++) {
          expect(
            net._layerSets[i][j].deltas.every((row) =>
              row.every((delta) => delta === 0)
            )
          ).toBeTruthy();
        }
      }

      const spySets = net._layerSets.map((layerSet) =>
        layerSet.map((l) => jest.spyOn(l, 'compare'))
      );

      net._calculateDeltas([1, 1]);
      // The last layer propagates delta from target, the last layer propagates zero
      for (let i = 0; i < net._layerSets[0].length; i++) {
        expect(
          net._layerSets[0][i].deltas.every((row) =>
            row.every((delta) => delta !== 0)
          )
        ).toBeTruthy();
      }

      for (let i = 0; i < spySets.length; i++) {
        for (let j = 0; j < spySets[i].length; j++) {
          // reuse the last matrix
          if (i === spySets.length - 1 && (j = spySets[i].length - 1)) {
            expect(spySets[i][j]).not.toHaveBeenCalled();
          } else {
            expect(spySets[i][j]).toHaveBeenCalled();
          }
        }
      }
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
        outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      expect(net._model.length).toEqual(3);
      expect(net._layerSets[0].length).toEqual(10);
      const weightSets = net._model.map((l) => copy2D(l.weights));
      const spys = net._model.map((l) => jest.spyOn(l, 'learn'));

      net._calculateDeltas([1, 1]);
      net.adjustWeights();

      for (let i = 0; i < spys.length; i++) {
        expect(spys[i]).toHaveBeenCalled();
      }

      // weights are adjusted in model only via .learn()
      for (let i = 0; i < weightSets.length; i++) {
        const weights = weightSets[i];
        for (let row = 0; row < weights.length; row++) {
          for (let col = 0; col < weights[row].length; col++) {
            expect(weights[row][col]).not.toEqual(
              net._model[i].weights[row][col]
            );
          }
        }
      }
    });
  });
  describe('._trainPattern()', () => {
    test('steps back through values correctly', () => {
      class SuperLayer extends Filter {
        constructor(inputLayer) {
          super();
          this.inputLayer = inputLayer;
          this.width = 1;
          this.height = 1;
        }

        setupKernels() {}

        reuseKernels() {}

        predict() {}

        compare() {
          this.errors = [[5]];
        }

        learn() {}
      }
      const net = new Recurrent({
        inputLayer: () => input({ width: 1 }),
        hiddenLayers: [(inputLayer) => new SuperLayer(inputLayer)],
        outputLayer: (inputLayer) => new SuperLayer(inputLayer),
      });

      net.initialize();
      net.initializeDeep();

      const runInputSpy = jest.spyOn(net, 'runInput');
      const calculateDeltasSpy = jest.spyOn(net, '_calculateDeltas');
      const adjustWeightsSpy = jest.spyOn(net, 'adjustWeights');

      const inputValue = [0, 1];
      const errorRate = net._trainPattern(inputValue, true);
      expect(errorRate).toEqual(new Float32Array([2.5]));
      expect(runInputSpy).toHaveBeenCalledWith(inputValue);
      expect(calculateDeltasSpy).toHaveBeenCalledWith(inputValue);
      expect(adjustWeightsSpy).toHaveBeenCalled();
    });
    describe('when called more than once', () => {
      test('continuously updates output layer', () => {
        const net = new Recurrent({
          inputLayer: () => input({ height: 1 }),
          hiddenLayers: [
            (inputLayer, recurrentInput) =>
              rnnCell({ height: 3 }, inputLayer, recurrentInput),
          ],
          outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
        });
        net.initialize();
        net.initializeDeep();

        const lastLayerSet = net._layerSets[net._layerSets.length - 1];
        const lastOutputLayer = lastLayerSet[lastLayerSet.length - 1];
        expect(lastOutputLayer.weights).toEqual([new Float32Array([0])]);
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
