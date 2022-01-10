import { GPU, Input, KernelOutput } from 'gpu.js';
import {
  add,
  input,
  lstmCell,
  multiply,
  output,
  random,
  rnnCell,
  ILayer,
  IRecurrentInput,
} from './layer';
import { IMomentumRootMeanSquaredPropagationSettings } from './praxis/momentum-root-mean-squared-propagation';
import { Recurrent } from './recurrent';
import { Matrix } from './recurrent/matrix';
import { RNNTimeStep } from './recurrent/rnn-time-step';
import { setup, teardown } from './utilities/kernel';

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
// jest.mock('../../src/layer/random', () => {
//   class MockRandom extends Model implements ILayer {
//     constructor(settings: IRandomSettings) {
//       super(settings);
//     }
//   }
//   return {
//     Random: MockRandom,
//   }
// });
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
  describe('when configured like RNNTimeStep', () => {
    beforeEach(() => {
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
          }
        }
        return {
          RandomMatrix: MockRandomMatrix,
        };
      });
    });
    afterEach(() => {
      jest.unmock('./recurrent/matrix/random-matrix');
    });
    function setupNets(): { timeStep: RNNTimeStep; recurrentNet: Recurrent } {
      const timeStep: RNNTimeStep = new RNNTimeStep({
        regc: 0.001,
        inputSize: 1,
        hiddenLayers: [3],
        outputSize: 1,
      });
      const praxisOpts: Partial<IMomentumRootMeanSquaredPropagationSettings> = {
        regularizationStrength: timeStep.options.regc,
        learningRate: timeStep.trainOpts.learningRate,
      };
      const recurrentNet = new Recurrent({
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
      const amplification = 1;
      let i = amplification;
      function amplify() {
        return (i += 1);
      }
      const { weight, transition, bias } = timeStep.model.hiddenLayers[0];
      const { outputConnector, output: _output } = timeStep.model;
      // set both nets exactly the same, then train them once, and compare
      // zero out
      const recurrentLayers = recurrentNet._layerSets[0];
      const recurrentModelWeight = recurrentLayers.find(
        (l: ILayer) => l.settings.id === 'weight'
      ) as ILayer;
      weight.weights = weight.weights.map(amplify);
      recurrentModelWeight.weights = [
        new Float32Array([weight.weights[0]]),
        new Float32Array([weight.weights[1]]),
        new Float32Array([weight.weights[2]]),
      ];

      const recurrentModelTransition = recurrentLayers.find(
        (l: ILayer) => l.settings.id === 'transition'
      ) as ILayer;
      transition.weights = transition.weights.map(amplify);
      recurrentModelTransition.weights = [
        new Float32Array([
          transition.weights[0],
          transition.weights[1],
          transition.weights[2],
        ]),
        new Float32Array([
          transition.weights[3],
          transition.weights[4],
          transition.weights[5],
        ]),
        new Float32Array([
          transition.weights[6],
          transition.weights[7],
          transition.weights[8],
        ]),
      ];

      const recurrentModelBias = recurrentLayers.find(
        (l: ILayer) => l.settings.id === 'bias'
      ) as ILayer;
      bias.weights = bias.weights.map(amplify);
      recurrentModelBias.weights = [
        new Float32Array([bias.weights[0]]),
        new Float32Array([bias.weights[1]]),
        new Float32Array([bias.weights[2]]),
      ];

      const recurrentModelOutputGate = recurrentLayers.find(
        (l: ILayer) => l.settings.id === 'outputGate'
      ) as ILayer;
      recurrentModelOutputGate.weights = [new Float32Array(3)];
      outputConnector.weights = outputConnector.weights.map(amplify);
      recurrentModelOutputGate.weights[0][0] = outputConnector.weights[0];
      recurrentModelOutputGate.weights[0][1] = outputConnector.weights[1];
      recurrentModelOutputGate.weights[0][2] = outputConnector.weights[2];

      const recurrentModelOutput = recurrentLayers.find(
        (l: ILayer) => l.settings.id === 'output'
      ) as ILayer;
      recurrentModelOutput.weights = [new Float32Array(1)];
      _output.weights = _output.weights.map(amplify);
      recurrentModelOutput.weights[0][0] = _output.weights[0];

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

        expect((recurrentResult as number[][])[0][0]).toBe(timeStepResult);
      });

      test('.train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        timeStep.adjustWeights = () => {};
        recurrentNet.adjustWeights = () => {};
        timeStep.train([[100, 500, 1000]], { iterations: 1 });
        recurrentNet.train([[[100], [500], [1000]]], {
          iterations: 1,
          errorCheckInterval: 1,
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
          { iterations: 1, errorCheckInterval: 1 }
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
          expect(asArrayOfArrayOfNumber(model[2].weights)[1][0]).toBe(
            timeStep.model.allMatrices[2].weights[1]
          );
          expect(asArrayOfArrayOfNumber(model[2].weights)[2][0]).toBe(
            timeStep.model.allMatrices[2].weights[2]
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
        expect((recurrentNet.run([[2]]) as number[][])[0][0]).toBe(
          timeStep.run([2])
        );
      });
    });
    describe('forward propagate and backpropagate', () => {
      test('.train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        function testRecurrentLayerSetWeights(
          timeStep: RNNTimeStep,
          recurrentNet: Recurrent,
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
            // [1000, 500, 100],
          ],
          { iterations: 100 }
        );
        recurrentNet.train(
          [
            [
              [100],
              [500],
              [1000],
              // [1000], [500], [100],
            ],
          ],
          { iterations: 100, errorCheckInterval: 1 }
        );

        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );

        testRecurrentLayerSetWeights(timeStep, recurrentNet, 0);
        testRecurrentLayerSetWeights(timeStep, recurrentNet, 1);
        testRecurrentLayerSetWeights(timeStep, recurrentNet, 2);

        expect((recurrentNet.run([[100], [500]]) as number[][])[0][0]).toBe(
          timeStep.run([100, 500])
        );
        expect((recurrentNet.run([[1000], [500]]) as number[][])[0][0]).toBe(
          timeStep.run([1000, 500])
        );
      });
    });
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
        expect(net._layerSets[1][0]).not.toEqual(inputLayer);
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
        expect(net._layerSets[2][0]).not.toEqual(inputLayer);
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
      } catch (e: unknown) {
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
    const status = net.train(xorNetValues, {
      iterations,
      errorThresh,
      errorCheckInterval: 1,
    });
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
          rnnCell({ height: 3 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer: ILayer) => output({ height: 1 }, inputLayer),
    });
    const results = net.train([[[1], [2], [3]]], {
      errorCheckInterval: 1,
    });
    expect(results.error < 0.01).toBeTruthy();
  });
});
