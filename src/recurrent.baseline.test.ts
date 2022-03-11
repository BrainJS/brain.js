import { GPU, Input, KernelOutput } from 'gpu.js';
import { Matrix } from './recurrent/matrix';
import { input, output, rnnCell, ILayer, IRecurrentInput } from './layer';
import { IMomentumRootMeanSquaredPropagationSettings } from './praxis/momentum-root-mean-squared-propagation';
import { Recurrent } from './recurrent';
import { RNNTimeStep } from './recurrent/rnn-time-step';
import { setup, teardown } from './utilities/kernel';

jest.mock('./utilities/randos', () => {
  return {
    randos2D: (width: number, height: number) => {
      const weights: Float32Array[] = [];
      let value = 1;
      for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        weights[rowIndex] = new Float32Array(width);
        for (let columnIndex = 0; columnIndex < width; columnIndex++) {
          weights[rowIndex][columnIndex] = value++;
        }
      }
      return weights;
    },
  };
});
jest.mock('./recurrent/matrix/random-matrix', () => {
  class MockRandomMatrix extends Matrix {
    constructor(rows: number, columns: number, std: number) {
      super(rows, columns);

      let value = 1;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          this.setWeight(row, column, value++);
        }
      }
      console.log(this.weights);
    }
  }
  return {
    RandomMatrix: MockRandomMatrix,
  };
});

function asArrayOfArrayOfNumber(v: KernelOutput | Input): number[][] {
  if (!Array.isArray(v) || typeof (v as number[][])[0][0] !== 'number') {
    throw new Error('unexpected value');
  }
  return v as number[][];
}
function asMatrix(v?: Matrix): Matrix {
  if (!v) throw new Error('undefined Matrix');
  return v;
}

describe('Recurrent Class: Baseline', () => {
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
  describe('when configured like RNNTimeStep', () => {
    function setupNets(): {
      timeStep: RNNTimeStep;
      recurrentNet: Recurrent<number[]>;
    } {
      const timeStep: RNNTimeStep = new RNNTimeStep({
        regc: 0.000001,
        inputSize: 1,
        hiddenLayers: [3],
        outputSize: 1,
      });
      const praxisOpts: Partial<IMomentumRootMeanSquaredPropagationSettings> = {
        regularizationStrength: timeStep.options.regc,
        learningRate: timeStep.trainOpts.learningRate,
      };
      const recurrentNet = new Recurrent<number[]>({
        praxisOpts,
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer: ILayer, recurrentInput: IRecurrentInput) => {
            return rnnCell({ width: 1, height: 3 }, inputLayer, recurrentInput);
          },
        ],
        outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
      });
      timeStep.initialize();
      recurrentNet.initialize();
      timeStep.bindEquation();
      return { timeStep, recurrentNet };
    }
    describe('forward propagation', () => {
      function testRecurrentLayerSet(
        timeStep: RNNTimeStep,
        recurrentNet: Recurrent,
        index: number
      ) {
        const layerSet = recurrentNet._layerSets[index];
        expect(layerSet.length).toBe(15);
        expect(asArrayOfArrayOfNumber(layerSet[0].weights)[0][0]).toBe(
          (timeStep.model.equations[index].inputValue as Float32Array)[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[1].weights)[0][0]).toBe(
          timeStep.model.hiddenLayers[0].weight.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[1].weights)[1][0]).toBe(
          timeStep.model.hiddenLayers[0].weight.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[1].weights)[2][0]).toBe(
          timeStep.model.hiddenLayers[0].weight.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[2].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[1].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[2].weights)[1][0]).toBe(
          timeStep.model.equations[index].states[1].product.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[2].weights)[2][0]).toBe(
          timeStep.model.equations[index].states[1].product.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[0][0]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[0][1]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[0][2]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[1][0]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[3]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[1][1]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[4]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[1][2]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[5]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[2][0]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[6]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[2][1]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[7]
        );
        expect(asArrayOfArrayOfNumber(layerSet[3].weights)[2][2]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[8]
        );
        expect(asArrayOfArrayOfNumber(layerSet[4].weights)[0][0]).toBe(
          asMatrix(timeStep.model.equations[index].states[2].right).weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[4].weights)[1][0]).toBe(
          asMatrix(timeStep.model.equations[index].states[2].right).weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[4].weights)[2][0]).toBe(
          asMatrix(timeStep.model.equations[index].states[2].right).weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[5].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[2].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[5].weights)[1][0]).toBe(
          timeStep.model.equations[index].states[2].product.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[5].weights)[2][0]).toBe(
          timeStep.model.equations[index].states[2].product.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[6].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[3].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[6].weights)[1][0]).toBe(
          timeStep.model.equations[index].states[3].product.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[6].weights)[2][0]).toBe(
          timeStep.model.equations[index].states[3].product.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[8].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[4].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[8].weights)[1][0]).toBe(
          timeStep.model.equations[index].states[4].product.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[8].weights)[2][0]).toBe(
          timeStep.model.equations[index].states[4].product.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[9].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[5].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[9].weights)[1][0]).toBe(
          timeStep.model.equations[index].states[5].product.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[9].weights)[2][0]).toBe(
          timeStep.model.equations[index].states[5].product.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[10].weights)[0][0]).toBe(
          timeStep.model.outputConnector.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[10].weights)[0][1]).toBe(
          timeStep.model.outputConnector.weights[1]
        );
        expect(asArrayOfArrayOfNumber(layerSet[10].weights)[0][2]).toBe(
          timeStep.model.outputConnector.weights[2]
        );
        expect(asArrayOfArrayOfNumber(layerSet[11].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[6].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[12].weights)[0][0]).toBe(
          timeStep.model.output.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[13].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[7].product.weights[0]
        );
        expect(asArrayOfArrayOfNumber(layerSet[14].weights)[0][0]).toBe(
          timeStep.model.equations[index].states[7].product.weights[0]
        );
      }
      test('.run() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        const timeStepResult = timeStep.run([100, 500]);
        const recurrentResult = recurrentNet.run([[100], [500]]);

        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );
        testRecurrentLayerSet(timeStep, recurrentNet, 0);
        testRecurrentLayerSet(timeStep, recurrentNet, 1);
        testRecurrentLayerSet(timeStep, recurrentNet, 2);

        expect(recurrentResult[0][0]).toBe(timeStepResult);
      });

      test('.train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        timeStep.adjustWeights = () => {};
        recurrentNet.adjustWeights = () => {};
        timeStep.train([[100, 500, 1000]], { iterations: 1 });
        recurrentNet.train([[[100], [500], [1000]]], {
          iterations: 1,
          errorCheckInterval: 1,
          logPeriod: 1,
        });

        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );
        testRecurrentLayerSet(timeStep, recurrentNet, 0);
        testRecurrentLayerSet(timeStep, recurrentNet, 1);
        testRecurrentLayerSet(timeStep, recurrentNet, 2);
      });
    });
    describe('back propagation', () => {
      test('.compare() via .train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();

        function testRecurrentLayerSet(index: number) {
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][14].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[7].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][13].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[7].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][12].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[7].right).deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][11].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[6].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][10].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[6].left).deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][10].deltas
            )[0][1]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[6].left).deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][10].deltas
            )[0][2]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[6].left).deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][9].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[5].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][9].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[5].product)
              .deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][9].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[5].product)
              .deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][8].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[4].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][8].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[4].product)
              .deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][8].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[4].product)
              .deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][6].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[3].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][6].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[3].product)
              .deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][6].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[3].product)
              .deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][5].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][5].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].product)
              .deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][5].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].product)
              .deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][4].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].right).deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][4].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].right).deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][4].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].right).deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[0][1]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[0][2]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[3]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[1][1]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[4]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[1][2]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[5]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[6]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[2][1]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[7]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].deltas
            )[2][2]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[2].left).deltas[8]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][2].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].product)
              .deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][2].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].product)
              .deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][2].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].product)
              .deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][1].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].left).deltas[0]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][1].deltas
            )[1][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].left).deltas[1]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][1].deltas
            )[2][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].left).deltas[2]
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][0].deltas
            )[0][0]
          ).toBe(
            asMatrix(timeStep.model.equations[index].states[1].right).deltas[0]
          );
        }

        timeStep.adjustWeights = () => {};
        const timeStepResult = timeStep.train([[100, 500, 1000]], {
          iterations: 1,
        });
        recurrentNet.adjustWeights = () => {};
        const recurrentNetResult = recurrentNet.train(
          [[[100], [500], [1000]]],
          { iterations: 1, errorCheckInterval: 1, logPeriod: 1 }
        );

        expect(recurrentNetResult.error.toFixed(2)).toBe(
          timeStepResult.error.toFixed(2)
        );
        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );
        testRecurrentLayerSet(2);
        testRecurrentLayerSet(1);
        testRecurrentLayerSet(0);
      });

      test('.learn() via .train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();

        function testRecurrentModel() {
          const model = recurrentNet._model;
          if (!model) return;

          expect(asArrayOfArrayOfNumber(model[0].weights)[0][0]).toBe(
            timeStep.model.allMatrices[0].weights[0]
          );
          expect(asArrayOfArrayOfNumber(model[0].weights)[1][0]).toBe(
            timeStep.model.allMatrices[0].weights[1]
          );
          expect(asArrayOfArrayOfNumber(model[0].weights)[2][0]).toBe(
            timeStep.model.allMatrices[0].weights[2]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[0][0]).toBe(
            timeStep.model.allMatrices[1].weights[0]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[0][1]).toBe(
            timeStep.model.allMatrices[1].weights[1]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[0][2]).toBe(
            timeStep.model.allMatrices[1].weights[2]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[1][0]).toBe(
            timeStep.model.allMatrices[1].weights[3]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[1][1]).toBe(
            timeStep.model.allMatrices[1].weights[4]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[1][2]).toBe(
            timeStep.model.allMatrices[1].weights[5]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[2][0]).toBe(
            timeStep.model.allMatrices[1].weights[6]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[2][1]).toBe(
            timeStep.model.allMatrices[1].weights[7]
          );
          expect(asArrayOfArrayOfNumber(model[1].weights)[2][2]).toBe(
            timeStep.model.allMatrices[1].weights[8]
          );
          expect(asArrayOfArrayOfNumber(model[2].weights)[0][0]).toBe(
            timeStep.model.allMatrices[2].weights[0]
          );
          expect(asArrayOfArrayOfNumber(model[2].weights)[1][0]).toBeCloseTo(
            timeStep.model.allMatrices[2].weights[1],
            0.00000000009
          );
          expect(asArrayOfArrayOfNumber(model[2].weights)[2][0]).toBeCloseTo(
            timeStep.model.allMatrices[2].weights[2],
            0.00000000009
          );
          expect(asArrayOfArrayOfNumber(model[3].weights)[0][0]).toBe(
            timeStep.model.allMatrices[3].weights[0]
          );
          expect(asArrayOfArrayOfNumber(model[3].weights)[0][1]).toBe(
            timeStep.model.allMatrices[3].weights[1]
          );
          expect(asArrayOfArrayOfNumber(model[3].weights)[0][2]).toBe(
            timeStep.model.allMatrices[3].weights[2]
          );
          expect(asArrayOfArrayOfNumber(model[4].weights)[0][0]).toBe(
            timeStep.model.allMatrices[4].weights[0]
          );
        }

        const timeStepResult = timeStep.train([[100, 500, 1000]], {
          iterations: 1,
        });
        const recurrentNetResult = recurrentNet.train(
          [[[100], [500], [1000]]],
          {
            iterations: 1,
            errorCheckInterval: 1,
            logPeriod: 1,
          }
        );

        expect(recurrentNetResult.iterations).toBe(timeStepResult.iterations);
        expect(recurrentNetResult.error).toBeCloseTo(
          timeStepResult.error,
          0.005
        );
        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );
        testRecurrentModel();
        expect(recurrentNet.run([[2]])[0][0]).toBe(timeStep.run([2]));
      });
    });
    describe('forward propagate and backpropagate', () => {
      test('.train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        function testRecurrentLayerSetWeights(
          timeStep: RNNTimeStep,
          recurrentNet: Recurrent<number[]>,
          index: number
        ) {
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][14].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[7].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][13].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[7].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][12].weights
            )[0][0].toFixed(5)
          ).toBe(timeStep.model.output.weights[0].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][11].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[6].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][10].weights
            )[0][0].toFixed(5)
          ).toBe(timeStep.model.outputConnector.weights[0].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][10].weights
            )[0][1].toFixed(5)
          ).toBe(timeStep.model.outputConnector.weights[1].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][10].weights
            )[0][2].toFixed(5)
          ).toBe(timeStep.model.outputConnector.weights[2].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][9].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[5].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][9].weights
            )[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[5].product.weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][9].weights
            )[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[5].product.weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][8].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[4].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][8].weights
            )[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[4].product.weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][8].weights
            )[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[4].product.weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][6].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[3].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][6].weights
            )[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[3].product.weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][6].weights
            )[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[3].product.weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][5].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[2].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][5].weights
            )[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[2].product.weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][5].weights
            )[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[2].product.weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][4].weights
            )[0][0].toFixed(5)
          ).toBe(
            asMatrix(
              timeStep.model.equations[index].states[2].right
            ).weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][4].weights
            )[1][0].toFixed(5)
          ).toBe(
            asMatrix(
              timeStep.model.equations[index].states[2].right
            ).weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][4].weights
            )[2][0].toFixed(5)
          ).toBe(
            asMatrix(
              timeStep.model.equations[index].states[2].right
            ).weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[0][1].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[0][2].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[1][0].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[3].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[1][1].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[4].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[1][2].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[5].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[2][0].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[6].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[2][1].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[7].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][3].weights
            )[2][2].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[8].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][2].weights
            )[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[1].product.weights[0].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][2].weights
            )[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[1].product.weights[1].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][2].weights
            )[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[1].product.weights[2].toFixed(5)
          );
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][1].weights
            )[0][0].toFixed(5)
          ).toBe(timeStep.model.hiddenLayers[0].weight.weights[0].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][1].weights
            )[1][0].toFixed(5)
          ).toBe(timeStep.model.hiddenLayers[0].weight.weights[1].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][1].weights
            )[2][0].toFixed(5)
          ).toBe(timeStep.model.hiddenLayers[0].weight.weights[2].toFixed(5));
          expect(
            asArrayOfArrayOfNumber(
              recurrentNet._layerSets[index][0].weights
            )[0][0].toFixed(5)
          ).toBe(
            (timeStep.model.equations[index]
              .inputValue as Float32Array)[0].toFixed(5)
          );
        }

        timeStep.train(
          [
            [100, 500, 1000],
            [1000, 500, 100],
          ],
          { iterations: 100 }
        );
        recurrentNet.train(
          [
            [[100], [500], [1000]],
            [[1000], [500], [100]],
          ],
          { iterations: 100 }
        );

        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );

        testRecurrentLayerSetWeights(timeStep, recurrentNet, 0);
        testRecurrentLayerSetWeights(timeStep, recurrentNet, 1);
        testRecurrentLayerSetWeights(timeStep, recurrentNet, 2);

        console.log(recurrentNet.run([[100], [500]]), timeStep.run([100, 500]));
        console.log(
          recurrentNet.run([[1000], [500]]),
          timeStep.run([1000, 500])
        );
        expect(recurrentNet.run([[100], [500]])[0][0]).toBe(
          timeStep.run([100, 500])
        );
        expect(recurrentNet.run([[1000], [500]])[0][0]).toBe(
          timeStep.run([1000, 500])
        );
      });
    });
  });
});
