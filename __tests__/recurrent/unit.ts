import { GPU } from 'gpu.js';
import { add, input, multiply, output, random, rnnCell, IRecurrentInput, ILayer } from '../../src/layer';
import { Filter } from '../../src/layer/filter';
import { Recurrent } from '../../src/recurrent';
import { Matrix } from '../../src/recurrent/matrix';
import { setup, teardown } from '../../src/utilities/kernel';

function copy2D(matrix: Partial<Matrix> & any[][]) {
  return matrix.map((row) => Float32Array.from(row));
}

describe('Recurrent Class: Unit', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
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
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) => {
            if (recurrentInput.setDimensions) {
              recurrentInput.setDimensions(1, 3);
            }
            return rnnCell({ height: 3 }, inputLayer, recurrentInput);
          },
        ],
        outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
      });

      net.initialize();

      const layers = net._layerSets
        ? net._layerSets[net._layerSets.length - 1]
        : [];

      expect(layers.map((l: ILayer) => l.constructor.name)).toEqual([
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
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) => {
            if (recurrentInput.setDimensions) {
              recurrentInput.setDimensions(1, 1);
            }
            return multiply(
              multiply(random({ width: 1, height: 1 }), inputLayer),
              recurrentInput
            );
          },
        ],
        outputLayer: (inputLayer: ILayer) =>
          output({ width: 1, height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();

      const spySets = net._layerSets
        ? net._layerSets.map((layerSet: ILayer[]) =>
            layerSet.map((l) => jest.spyOn(l, 'predict'))
          )
        : [];

      net.runInputs([Float32Array.from([0, 1])]);

      if (!net._model) fail();

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
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) => {
            if (recurrentInput.setDimensions) {
              recurrentInput.setDimensions(1, 3);
            }
            return add(
              multiply(random({ height: 3 }), inputLayer),
              recurrentInput
            );
          },
        ],
        outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInputs([Float32Array.from([1, 1])]);

      if (!net._model) fail();
      if (!net._layerSets) fail();

      expect(net._model.length).toEqual(3);
      expect(net._layerSets.length).toEqual(2);

      for (let i = 0; i < net._layerSets.length; i++) {
        for (let j = 0; j < net._layerSets[i].length; j++) {
          expect(
            (net._layerSets[i][j].deltas as number[][]).every((row) =>
              row.every((delta) => delta === 0)
            )
          ).toBeTruthy();
        }
      }

      const spySets = net._layerSets.map((layerSet: ILayer[]) =>
        layerSet.map((l) => jest.spyOn(l, 'compare'))
      );

      net._calculateDeltas([
        [1, 1],
        [1, 1],
      ]);
      // The last layer propagates delta from target, the last layer propagates zero
      // TODO: fix
      // for (let i = 0; i < net._layerSets[0].length; i++) {
      //   expect(
      //     net._layerSets[0][i].deltas.every((row: number[]) =>
      //       row.every((delta) => delta !== 0)
      //     )
      //   ).toBeTruthy();
      // }

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
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) => {
            if (recurrentInput.setDimensions) {
              recurrentInput.setDimensions(1, 3);
            }
            return add(
              multiply(random({ height: 3 }), inputLayer),
              recurrentInput
            );
          },
        ],
        outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInputs([Float32Array.from([1, 1])]);

      if (!net._model) fail();
      if (!net._layerSets) fail();

      expect(net._model.length).toEqual(3);
      expect(net._layerSets[0].length).toEqual(10);
      const weightSets = net._model.map((l: ILayer) =>
        copy2D(l.weights as number[][])
      );
      const spys = net._model.map((l: ILayer) => jest.spyOn(l, 'learn'));

      net._calculateDeltas([[1, 1]]);
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
              (net._model[i].weights as number[][])[row][col]
            );
          }
        }
      }
    });
  });
  describe('._trainPattern()', () => {
    test('steps back through values correctly', () => {
      class SuperLayer extends Filter {
        errors?: number[][];
        constructor(inputLayer: ILayer) {
          super({}, inputLayer);
          this.inputLayer = inputLayer;

          this.settings.width = 1;
          this.settings.height = 1;

          // this.width = 1;
          // this.height = 1;
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
        hiddenLayers: [(inputLayer: ILayer) => new SuperLayer(inputLayer)],
        outputLayer: (inputLayer: ILayer) => new SuperLayer(inputLayer),
      });

      net.initialize();
      net.initializeDeep();

      const runInputsSpy = jest.spyOn(net, 'runInputs');
      const calculateDeltasSpy = jest.spyOn(net, '_calculateDeltas');
      const adjustWeightsSpy = jest.spyOn(net, 'adjustWeights');

      const inputValue = [
        [0, 1],
        [1, 1],
      ];
      const errorRate = net._trainPattern(inputValue, true);
      expect(errorRate).toEqual(Float32Array.from([2.5]));
      expect(runInputsSpy).toHaveBeenCalledWith(inputValue);
      expect(calculateDeltasSpy).toHaveBeenCalledWith(inputValue);
      expect(adjustWeightsSpy).toHaveBeenCalled();
    });
    describe('when called more than once', () => {
      test('continuously updates output layer', () => {
        const net = new Recurrent({
          inputLayer: () => input({ height: 1 }),
          hiddenLayers: [
            (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
              rnnCell({ height: 3 }, inputLayer, recurrentInput),
          ],
          outputLayer: (inputLayer: ILayer) =>
            output({ height: 1 }, inputLayer),
        });
        net.initialize();
        net.initializeDeep();

        const lastLayerSet = net._layerSets
          ? net._layerSets[net._layerSets.length - 1]
          : [];

        const lastOutputLayer = lastLayerSet[lastLayerSet.length - 1];
        expect(lastOutputLayer.weights).toEqual([new Float32Array([0])]);
        net._trainPattern([[1, 2]], false);
        const weights1 = lastOutputLayer.weights;
        expect(weights1).not.toEqual([[0]]);
        net._trainPattern([[3, 2]], false);
        const weights2 = lastOutputLayer.weights;
        expect(weights1).not.toEqual(weights2);
        net._trainPattern([[1, 1]], false);
        const weights3 = lastOutputLayer.weights;
        expect(weights2).not.toEqual(weights3);
        net._trainPattern([[3, 3]], false);
        const weights4 = lastOutputLayer.weights;
        expect(weights3).not.toEqual(weights4);
      });
    });
  });
  describe('.toJSON', () => {
    it('serializes and deserializes correctly', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
            rnnCell({ height: 3 }, inputLayer, recurrentInput),
        ],
        outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
      });
      net.initialize();
      const layers = net.layers as ILayer[];
      expect(net.toJSON()).toEqual({
        inputLayerIndex: 0,
        layers: [
          layers[0].toJSON(),
          layers[1].toJSON(),
          { ...layers[2].toJSON(), inputLayer1Index: 1, inputLayer2Index: 0 },
          layers[3].toJSON(),
          layers[4].toJSON(),
          { ...layers[5].toJSON(), inputLayer1Index: 3, inputLayer2Index: 4 },
          { ...layers[6].toJSON(), inputLayer1Index: 2, inputLayer2Index: 5 },
          layers[7].toJSON(),
          { ...layers[8].toJSON(), inputLayer1Index: 6, inputLayer2Index: 7 },
          { ...layers[9].toJSON(), inputLayerIndex: 8 },
          layers[10].toJSON(),
          { ...layers[11].toJSON(), inputLayer1Index: 10, inputLayer2Index: 9 },
          layers[12].toJSON(),
          { ...layers[13].toJSON(), inputLayer1Index: 11, inputLayer2Index: 12 },
          { ...layers[14].toJSON(), inputLayerIndex: 13 },
        ],
        outputLayerIndex: 14,
        sizes: [1, 3, 1],
        type: 'Recurrent'
      });
    });
  });
  describe('.fromJSON', () => {
    it('serializes and deserializes correctly', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
            rnnCell({ height: 3 }, inputLayer, recurrentInput),
        ],
        outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
      });
      net.initialize();
      const json = JSON.parse(JSON.stringify(net.toJSON()));
      const newNet = Recurrent.fromJSON(json);
      const newNetJson = newNet.toJSON();
      expect(newNetJson).toEqual(json);
    });
  });
});
