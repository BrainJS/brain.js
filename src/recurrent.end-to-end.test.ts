import { GPU } from 'gpu.js';
import {
  add,
  random,
  input,
  lstmCell,
  multiply,
  output,
  rnnCell,
  ILayer,
  IRecurrentInput,
} from './layer';
import { Recurrent } from './recurrent';
import { setup, teardown } from './utilities/kernel';

describe('Recurrent Class: End to End', () => {
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
  describe('training life-cycle', () => {
    test('properly instantiates starts with random weights and zero deltas and back propagates values through weights', () => {
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
      const datum = [[1], [1]];
      net.runInputs(datum);
      expect(net._model?.length).toEqual(3);
      expect(net._layerSets.length).toEqual(2);
      expect(net._layerSets[0].length).toEqual(10);
      expect(net._layerSets[1].length).toEqual(10);

      const clonedModelWeights = net._model?.map(
        (l: ILayer): Float32Array[] => {
          return (l.weights as Float32Array[]).map(
            (row: Float32Array): Float32Array => {
              return row.slice(0);
            }
          );
        }
      );

      function deltasAreZero() {
        expect(
          net._layerSets[0].every((l: ILayer) =>
            (l.deltas as number[][]).every((row) =>
              row.every((delta: number) => delta === 0)
            )
          )
        ).toBeTruthy();
      }

      function deltasAreSet() {
        expect(
          net._layerSets[0].every((l: ILayer) =>
            (l.deltas as number[][]).every((row) =>
              row.every((delta: number) => delta !== 0)
            )
          )
        ).toBeTruthy();
      }

      function modelWeightsAreUpdated() {
        expect(
          clonedModelWeights?.every(
            (oldLayerWeights: Float32Array[], layerIndex: number) =>
              oldLayerWeights.every((row: Float32Array, rowIndex: number) =>
                row.every((oldWeight, columnIndex) => {
                  const model = net._model;

                  if (!model) return true;

                  const newLayerWeights = model[layerIndex]
                    .weights as Float32Array[];
                  if (layerIndex === 0) return true;
                  return oldWeight !== newLayerWeights[rowIndex][columnIndex];
                })
              )
          )
        ).toBeTruthy();
      }

      function modelDeltasAreZero() {
        expect(
          net._model?.every((l: ILayer) =>
            (l.deltas as number[][]).every((row) =>
              row.every((delta: number) => delta === 0)
            )
          )
        ).toBeTruthy();
      }

      deltasAreZero();
      // two arbitrary values that are not zero
      net._calculateDeltas(datum);

      deltasAreSet();

      net.adjustWeights();

      modelWeightsAreUpdated();
      modelDeltasAreZero();
    });
  });
  describe('.initializeDeep()', () => {
    describe('structure', () => {
      test('can create new hidden layers in the correct structure', () => {
        const inputLayer = input({ height: 1 });
        const weights = random({ height: 3 });
        let recurrentInput: IRecurrentInput | null = null;
        const net = new Recurrent({
          inputLayer: () => inputLayer,
          hiddenLayers: [
            (inputLayer: ILayer, _recurrentInput: IRecurrentInput) => {
              if (_recurrentInput.setDimensions) {
                _recurrentInput.setDimensions(1, 3);
              }
              recurrentInput = _recurrentInput;
              return add(multiply(weights, inputLayer), _recurrentInput);
            },
          ],
          outputLayer: (inputLayer: ILayer) =>
            output({ height: 1 }, inputLayer),
        });

        // single
        net.initialize();
        if (!recurrentInput) throw new Error('recurrentInput is not defined');
        expect(net._layerSets.length).toEqual(1);
        expect(net._layerSets[0].length).toEqual(10);
        expect(net._layerSets[0][0]).toEqual(inputLayer);
        expect(net._layerSets[0].indexOf(weights)).toBe(1);
        expect(net._layerSets[0].indexOf(recurrentInput)).toBe(3);

        // double
        net.initializeDeep();
        expect(net._layerSets.length).toEqual(2);
        expect(net._layerSets[1].length).toEqual(10);
        expect(net._layerSets[1][0]).not.toBe(inputLayer);
        expect(net._layerSets[1][0].constructor).toEqual(
          inputLayer.constructor
        ); // new instance of same type NOT model
        expect(net._layerSets[1].indexOf(weights)).toBe(1); // direct reference IMPORTANT because model
        expect(net._layerSets[1].indexOf(recurrentInput)).toBe(-1);
        expect(net._layerSets[1][3].deltas).toBe(net._layerSets[0][4].deltas); // recurrence
        expect(net._layerSets[1][3].weights).toBe(net._layerSets[0][4].weights); // recurrence

        // triple
        net.initializeDeep();
        expect(net._layerSets.length).toEqual(3);
        expect(net._layerSets[2].length).toEqual(10);
        expect(net._layerSets[2][0]).not.toBe(inputLayer);
        expect(net._layerSets[2][0].constructor).toEqual(
          inputLayer.constructor
        ); // new instance of same type NOT model
        expect(net._layerSets[2].indexOf(weights)).toBe(1); // direct reference IMPORTANT because model
        expect(net._layerSets[2][3].constructor.name).toBe('RecurrentInput');
        expect(net._layerSets[2][3].deltas).toBe(net._layerSets[1][4].deltas); // recurrence
        expect(net._layerSets[2][3].weights).toBe(net._layerSets[1][4].weights); // recurrence
      });
    });
  });
  test('can learn', () => {
    const net = new Recurrent({
      inputLayer: () => input({ width: 1 }),
      hiddenLayers: [
        (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
          rnnCell({ width: 1, height: 1 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer: ILayer) =>
        output({ width: 1, height: 1 }, inputLayer),
    });
    net.initialize();
    net.initializeDeep();
    expect(net._layerSets.length).toEqual(2);
    expect(net._layerSets[0].length).toEqual(15);
    expect(net._layerSets[1].length).toEqual(15);
    const errors = [];
    for (let i = 0; i < 20; i++) {
      errors.push(
        (net._trainPattern(
          [
            [1, 2],
            [1, 3],
          ],
          true
        ) as number[])[0]
      );
    }
    expect(errors[0]).toBeGreaterThan(errors[errors.length - 1]);
  });

  test('can have more than one hiddenLayer', () => {
    expect(() => {
      try {
        const net = new Recurrent({
          inputLayer: () => input({ width: 1 }),
          hiddenLayers: [
            (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
              rnnCell({ height: 3, width: 1 }, inputLayer, recurrentInput),
            (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
              rnnCell({ height: 1, width: 1 }, inputLayer, recurrentInput),
          ],
          outputLayer: (inputLayer: ILayer) =>
            output({ height: 1 }, inputLayer),
        });
        net.initialize();
      } catch (e) {
        throw new Error();
      }
    }).not.toThrow();
  });

  test('can learn to increment', () => {
    const net = new Recurrent({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
          rnnCell({ height: 3 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
    });
    net.initialize();
    net.initializeDeep();
    expect(net._model?.length).toEqual(5);
    expect(net._layerSets.length).toEqual(2);
    expect(net._layerSets[0].length).toEqual(15);
    expect(net._layerSets[1].length).toEqual(15);
    let error;
    for (let i = 0; i < 100; i++) {
      error = (net._trainPattern([[0], [1]], true) as number[])[0];
    }
    expect(error as number).toBeLessThan(0.005);
  });
  it('can learn xor', () => {
    const net = new Recurrent<number[]>({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
          lstmCell({ height: 10 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
    });
    const xorNetValues = [
      [[0.001], [0.001], [0.001]],
      [[0.001], [1], [1]],
      [[1], [0.001], [1]],
      [[1], [1], [0.001]],
    ];
    const errorThresh = 0.03;
    const iterations = 5000;
    const status = net.train(xorNetValues, { errorThresh, iterations });
    expect(
      status.error <= errorThresh || status.iterations <= iterations
    ).toBeTruthy();
    expect(net.run([[0.001], [0.001]])[0][0]).toBeLessThan(0.1);
    expect(net.run([[0.001], [1]])[0][0]).toBeGreaterThan(0.9);
    expect(net.run([[1], [0.001]])[0][0]).toBeGreaterThan(0.9);
    expect(net.run([[1], [1]])[0][0]).toBeLessThan(0.1);
  });
  test('can learn 1,2,3', () => {
    const net = new Recurrent<number[]>({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
          lstmCell({ height: 10 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
    });
    const iterations = 101;
    const errorThresh = 0.005;
    const status = net.train([[[1], [2], [3]]], {
      iterations: 101,
      errorThresh,
    });
    expect(
      status.iterations <= iterations || status.error < errorThresh
    ).toBeTruthy();
  });
  test('can learn 1,2,3 using .train()', () => {
    const net = new Recurrent<number[]>({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer: ILayer, recurrentInput: IRecurrentInput) =>
          lstmCell({ height: 3 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
    });
    const results = net.train([[[1], [2], [3]]]);
    expect(results.error < 0.01).toBeTruthy();
    expect(Math.round(net.run([[1], [2]])[0][0])).toBe(3);
  });
});
