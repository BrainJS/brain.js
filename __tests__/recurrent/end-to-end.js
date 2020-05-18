const { GPU } = require('gpu.js');
const {
  add,
  input,
  multiply,
  output,
  random,
  rnnCell,
  lstmCell,
} = require('../../src/layer');
const { setup, teardown } = require('../../src/utilities/kernel');

const { Recurrent } = require('../../src/recurrent');
const RNNTimeStep = require('../../src/recurrent/rnn-time-step');
// const zeros2D = require('../../src/utilities/zeros-2d');

const { injectIstanbulCoverage } = require('../test-utils');

describe('Recurrent Class: End to End', () => {
  beforeEach(() => {
    const gpu = new GPU({
      mode: 'cpu',
      onIstanbulCoverageVariable: injectIstanbulCoverage,
    });
    setup(gpu);
  });
  afterEach(() => {
    teardown();
  });
  describe('when configured like RNNTimeStep', () => {
    function setupNets() {
      const timeStep = new RNNTimeStep({
        regc: 0.001,
        inputSize: 1,
        hiddenLayers: [3],
        outputSize: 1,
      });
      const recurrentNet = new Recurrent({
        praxisOpts: {
          regularizationStrength: timeStep.regc,
          learningRate: timeStep.trainOpts.learningRate,
        },
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer, recurrentInput) =>
            rnnCell({ width: 1, height: 3 }, inputLayer, recurrentInput),
        ],
        outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
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
        (l) => l.name === 'weight'
      );
      weight.weights = weight.weights.map(amplify);
      recurrentModelWeight.weights[0] = new Float32Array([weight.weights[0]]);
      recurrentModelWeight.weights[1] = new Float32Array([weight.weights[1]]);
      recurrentModelWeight.weights[2] = new Float32Array([weight.weights[2]]);

      const recurrentModelTransition = recurrentLayers.find(
        (l) => l.name === 'transition'
      );
      transition.weights = transition.weights.map(amplify);
      recurrentModelTransition.weights[0] = new Float32Array([
        transition.weights[0],
        transition.weights[1],
        transition.weights[2],
      ]);
      recurrentModelTransition.weights[1] = new Float32Array([
        transition.weights[3],
        transition.weights[4],
        transition.weights[5],
      ]);
      recurrentModelTransition.weights[2] = new Float32Array([
        transition.weights[6],
        transition.weights[7],
        transition.weights[8],
      ]);

      const recurrentModelBias = recurrentLayers.find((l) => l.name === 'bias');
      bias.weights = bias.weights.map(amplify);
      recurrentModelBias.weights[0] = new Float32Array([bias.weights[0]]);
      recurrentModelBias.weights[1] = new Float32Array([bias.weights[1]]);
      recurrentModelBias.weights[2] = new Float32Array([bias.weights[2]]);

      const recurrentModelOutputGate = recurrentLayers.find(
        (l) => l.name === 'outputGate'
      );
      recurrentModelOutputGate.weights = [new Float32Array(3)];
      outputConnector.weights = outputConnector.weights.map(amplify);
      recurrentModelOutputGate.weights[0][0] = outputConnector.weights[0];
      recurrentModelOutputGate.weights[0][1] = outputConnector.weights[1];
      recurrentModelOutputGate.weights[0][2] = outputConnector.weights[2];

      const recurrentModelOutput = recurrentLayers.find(
        (l) => l.name === 'output'
      );
      recurrentModelOutput.weights = [new Float32Array(1)];
      _output.weights = _output.weights.map(amplify);
      recurrentModelOutput.weights[0][0] = _output.weights[0];

      return { timeStep, recurrentNet };
    }
    describe('forward propagation', () => {
      function testRecurrentLayerSet(timeStep, recurrentNet, index) {
        expect(recurrentNet._layerSets[index][0].weights[0][0]).toBe(
          timeStep.model.equations[index].inputValue[0]
        );
        expect(recurrentNet._layerSets[index][1].weights[0][0]).toBe(
          timeStep.model.hiddenLayers[0].weight.weights[0]
        );
        expect(recurrentNet._layerSets[index][1].weights[1][0]).toBe(
          timeStep.model.hiddenLayers[0].weight.weights[1]
        );
        expect(recurrentNet._layerSets[index][1].weights[2][0]).toBe(
          timeStep.model.hiddenLayers[0].weight.weights[2]
        );
        expect(recurrentNet._layerSets[index][2].weights[0][0]).toBe(
          timeStep.model.equations[index].states[1].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][2].weights[1][0]).toBe(
          timeStep.model.equations[index].states[1].product.weights[1]
        );
        expect(recurrentNet._layerSets[index][2].weights[2][0]).toBe(
          timeStep.model.equations[index].states[1].product.weights[2]
        );
        expect(recurrentNet._layerSets[index][3].weights[0][0]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[0]
        );
        expect(recurrentNet._layerSets[index][3].weights[0][1]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[1]
        );
        expect(recurrentNet._layerSets[index][3].weights[0][2]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[2]
        );
        expect(recurrentNet._layerSets[index][3].weights[1][0]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[3]
        );
        expect(recurrentNet._layerSets[index][3].weights[1][1]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[4]
        );
        expect(recurrentNet._layerSets[index][3].weights[1][2]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[5]
        );
        expect(recurrentNet._layerSets[index][3].weights[2][0]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[6]
        );
        expect(recurrentNet._layerSets[index][3].weights[2][1]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[7]
        );
        expect(recurrentNet._layerSets[index][3].weights[2][2]).toBe(
          timeStep.model.hiddenLayers[0].transition.weights[8]
        );
        expect(recurrentNet._layerSets[index][4].weights[0][0]).toBe(
          timeStep.model.equations[index].states[2].right.weights[0]
        );
        expect(recurrentNet._layerSets[index][4].weights[1][0]).toBe(
          timeStep.model.equations[index].states[2].right.weights[1]
        );
        expect(recurrentNet._layerSets[index][4].weights[2][0]).toBe(
          timeStep.model.equations[index].states[2].right.weights[2]
        );
        expect(recurrentNet._layerSets[index][5].weights[0][0]).toBe(
          timeStep.model.equations[index].states[2].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][5].weights[1][0]).toBe(
          timeStep.model.equations[index].states[2].product.weights[1]
        );
        expect(recurrentNet._layerSets[index][5].weights[2][0]).toBe(
          timeStep.model.equations[index].states[2].product.weights[2]
        );
        expect(recurrentNet._layerSets[index][6].weights[0][0]).toBe(
          timeStep.model.equations[index].states[3].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][6].weights[1][0]).toBe(
          timeStep.model.equations[index].states[3].product.weights[1]
        );
        expect(recurrentNet._layerSets[index][6].weights[2][0]).toBe(
          timeStep.model.equations[index].states[3].product.weights[2]
        );
        expect(recurrentNet._layerSets[index][8].weights[0][0]).toBe(
          timeStep.model.equations[index].states[4].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][8].weights[1][0]).toBe(
          timeStep.model.equations[index].states[4].product.weights[1]
        );
        expect(recurrentNet._layerSets[index][8].weights[2][0]).toBe(
          timeStep.model.equations[index].states[4].product.weights[2]
        );
        expect(recurrentNet._layerSets[index][9].weights[0][0]).toBe(
          timeStep.model.equations[index].states[5].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][9].weights[1][0]).toBe(
          timeStep.model.equations[index].states[5].product.weights[1]
        );
        expect(recurrentNet._layerSets[index][9].weights[2][0]).toBe(
          timeStep.model.equations[index].states[5].product.weights[2]
        );
        expect(recurrentNet._layerSets[index][10].weights[0][0]).toBe(
          timeStep.model.outputConnector.weights[0]
        );
        expect(recurrentNet._layerSets[index][10].weights[0][1]).toBe(
          timeStep.model.outputConnector.weights[1]
        );
        expect(recurrentNet._layerSets[index][10].weights[0][2]).toBe(
          timeStep.model.outputConnector.weights[2]
        );
        expect(recurrentNet._layerSets[index][11].weights[0][0]).toBe(
          timeStep.model.equations[index].states[6].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][12].weights[0][0]).toBe(
          timeStep.model.output.weights[0]
        );
        expect(recurrentNet._layerSets[index][13].weights[0][0]).toBe(
          timeStep.model.equations[index].states[7].product.weights[0]
        );
        expect(recurrentNet._layerSets[index][14].weights[0][0]).toBe(
          timeStep.model.equations[index].states[7].product.weights[0]
        );
      }
      test('.run() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        const timeStepResult = timeStep.run([100, 500]);
        const recurrentResult = recurrentNet.run([100, 500]);

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
        recurrentNet.train([[100, 500, 1000]], {
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

        function testRecurrentLayerSet(index) {
          expect(recurrentNet._layerSets[index][14].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[7].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][13].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[7].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][12].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[7].right.deltas[0]
          );
          expect(recurrentNet._layerSets[index][11].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[6].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][10].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[6].left.deltas[0]
          );
          expect(recurrentNet._layerSets[index][10].deltas[0][1]).toBe(
            timeStep.model.equations[index].states[6].left.deltas[1]
          );
          expect(recurrentNet._layerSets[index][10].deltas[0][2]).toBe(
            timeStep.model.equations[index].states[6].left.deltas[2]
          );
          expect(recurrentNet._layerSets[index][9].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[5].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][9].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[5].product.deltas[1]
          );
          expect(recurrentNet._layerSets[index][9].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[5].product.deltas[2]
          );
          expect(recurrentNet._layerSets[index][8].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[4].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][8].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[4].product.deltas[1]
          );
          expect(recurrentNet._layerSets[index][8].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[4].product.deltas[2]
          );
          expect(recurrentNet._layerSets[index][6].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[3].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][6].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[3].product.deltas[1]
          );
          expect(recurrentNet._layerSets[index][6].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[3].product.deltas[2]
          );
          expect(recurrentNet._layerSets[index][5].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[2].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][5].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[2].product.deltas[1]
          );
          expect(recurrentNet._layerSets[index][5].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[2].product.deltas[2]
          );
          expect(recurrentNet._layerSets[index][4].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[2].right.deltas[0]
          );
          expect(recurrentNet._layerSets[index][4].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[2].right.deltas[1]
          );
          expect(recurrentNet._layerSets[index][4].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[2].right.deltas[2]
          );
          expect(recurrentNet._layerSets[index][3].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[0]
          );
          expect(recurrentNet._layerSets[index][3].deltas[0][1]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[1]
          );
          expect(recurrentNet._layerSets[index][3].deltas[0][2]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[2]
          );
          expect(recurrentNet._layerSets[index][3].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[3]
          );
          expect(recurrentNet._layerSets[index][3].deltas[1][1]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[4]
          );
          expect(recurrentNet._layerSets[index][3].deltas[1][2]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[5]
          );
          expect(recurrentNet._layerSets[index][3].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[6]
          );
          expect(recurrentNet._layerSets[index][3].deltas[2][1]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[7]
          );
          expect(recurrentNet._layerSets[index][3].deltas[2][2]).toBe(
            timeStep.model.equations[index].states[2].left.deltas[8]
          );
          expect(recurrentNet._layerSets[index][2].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[1].product.deltas[0]
          );
          expect(recurrentNet._layerSets[index][2].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[1].product.deltas[1]
          );
          expect(recurrentNet._layerSets[index][2].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[1].product.deltas[2]
          );
          expect(recurrentNet._layerSets[index][1].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[1].left.deltas[0]
          );
          expect(recurrentNet._layerSets[index][1].deltas[1][0]).toBe(
            timeStep.model.equations[index].states[1].left.deltas[1]
          );
          expect(recurrentNet._layerSets[index][1].deltas[2][0]).toBe(
            timeStep.model.equations[index].states[1].left.deltas[2]
          );
          expect(recurrentNet._layerSets[index][0].deltas[0][0]).toBe(
            timeStep.model.equations[index].states[1].right.deltas[0]
          );
        }

        timeStep.adjustWeights = () => {};
        const timeStepResult = timeStep.train(
          [new Float32Array([100, 500, 1000])],
          { iterations: 1 }
        );
        recurrentNet.adjustWeights = () => {};
        const recurrentNetResult = recurrentNet.train(
          [new Float32Array([100, 500, 1000])],
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
          expect(recurrentNet._model[0].weights[0][0]).toBe(
            timeStep.model.allMatrices[0].weights[0]
          );
          expect(recurrentNet._model[0].weights[1][0]).toBe(
            timeStep.model.allMatrices[0].weights[1]
          );
          expect(recurrentNet._model[0].weights[2][0]).toBe(
            timeStep.model.allMatrices[0].weights[2]
          );
          expect(recurrentNet._model[1].weights[0][0]).toBe(
            timeStep.model.allMatrices[1].weights[0]
          );
          expect(recurrentNet._model[1].weights[0][1]).toBe(
            timeStep.model.allMatrices[1].weights[1]
          );
          expect(recurrentNet._model[1].weights[0][2]).toBe(
            timeStep.model.allMatrices[1].weights[2]
          );
          expect(recurrentNet._model[1].weights[1][0]).toBe(
            timeStep.model.allMatrices[1].weights[3]
          );
          expect(recurrentNet._model[1].weights[1][1]).toBe(
            timeStep.model.allMatrices[1].weights[4]
          );
          expect(recurrentNet._model[1].weights[1][2]).toBe(
            timeStep.model.allMatrices[1].weights[5]
          );
          expect(recurrentNet._model[1].weights[2][0]).toBe(
            timeStep.model.allMatrices[1].weights[6]
          );
          expect(recurrentNet._model[1].weights[2][1]).toBe(
            timeStep.model.allMatrices[1].weights[7]
          );
          expect(recurrentNet._model[1].weights[2][2]).toBe(
            timeStep.model.allMatrices[1].weights[8]
          );
          expect(recurrentNet._model[2].weights[0][0]).toBe(
            timeStep.model.allMatrices[2].weights[0]
          );
          expect(recurrentNet._model[2].weights[1][0]).toBe(
            timeStep.model.allMatrices[2].weights[1]
          );
          expect(recurrentNet._model[2].weights[2][0]).toBe(
            timeStep.model.allMatrices[2].weights[2]
          );
          expect(recurrentNet._model[3].weights[0][0]).toBe(
            timeStep.model.allMatrices[3].weights[0]
          );
          expect(recurrentNet._model[3].weights[0][1]).toBe(
            timeStep.model.allMatrices[3].weights[1]
          );
          expect(recurrentNet._model[3].weights[0][2]).toBe(
            timeStep.model.allMatrices[3].weights[2]
          );
          expect(recurrentNet._model[4].weights[0][0]).toBe(
            timeStep.model.allMatrices[4].weights[0]
          );
        }

        const timeStepResult = timeStep.train([[100, 500, 1000]], {
          iterations: 1,
        });
        const recurrentNetResult = recurrentNet.train([[100, 500, 1000]], {
          iterations: 1,
          errorCheckInterval: 1,
        });

        expect(recurrentNetResult.iterations).toBe(timeStepResult.iterations);
        // expect(recurrentNetResult.error.toFixed(5)).toBe(timeStepResult.error.toFixed(5));
        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );
        testRecurrentModel();
        expect(recurrentNet.run([2])[0][0]).toBe(timeStep.run([2]));
      });
    });
    describe('forward propagate and backpropagate', () => {
      test('.train() is equivalent to baseline', () => {
        const { timeStep, recurrentNet } = setupNets();
        function testRecurrentLayerSetWeights(timeStep, recurrentNet, index) {
          expect(
            recurrentNet._layerSets[index][14].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[7].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][13].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[7].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][12].weights[0][0].toFixed(5)
          ).toBe(timeStep.model.output.weights[0].toFixed(5));
          expect(
            recurrentNet._layerSets[index][11].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[6].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][10].weights[0][0].toFixed(5)
          ).toBe(timeStep.model.outputConnector.weights[0].toFixed(5));
          expect(
            recurrentNet._layerSets[index][10].weights[0][1].toFixed(5)
          ).toBe(timeStep.model.outputConnector.weights[1].toFixed(5));
          expect(
            recurrentNet._layerSets[index][10].weights[0][2].toFixed(5)
          ).toBe(timeStep.model.outputConnector.weights[2].toFixed(5));
          expect(
            recurrentNet._layerSets[index][9].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[5].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][9].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[5].product.weights[1].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][9].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[5].product.weights[2].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][8].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[4].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][8].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[4].product.weights[1].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][8].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[4].product.weights[2].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][6].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[3].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][6].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[3].product.weights[1].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][6].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[3].product.weights[2].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][5].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[2].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][5].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[2].product.weights[1].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][5].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[2].product.weights[2].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][4].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[index].states[2].right.weights[0].toFixed(
              5
            )
          );
          expect(
            recurrentNet._layerSets[index][4].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[index].states[2].right.weights[1].toFixed(
              5
            )
          );
          expect(
            recurrentNet._layerSets[index][4].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[index].states[2].right.weights[2].toFixed(
              5
            )
          );
          expect(
            recurrentNet._layerSets[index][3].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[0][1].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[1].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[0][2].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[2].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[3].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[1][1].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[4].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[1][2].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[5].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[6].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[2][1].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[7].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][3].weights[2][2].toFixed(5)
          ).toBe(
            timeStep.model.hiddenLayers[0].transition.weights[8].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][2].weights[0][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[1].product.weights[0].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][2].weights[1][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[1].product.weights[1].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][2].weights[2][0].toFixed(5)
          ).toBe(
            timeStep.model.equations[
              index
            ].states[1].product.weights[2].toFixed(5)
          );
          expect(
            recurrentNet._layerSets[index][1].weights[0][0].toFixed(5)
          ).toBe(timeStep.model.hiddenLayers[0].weight.weights[0].toFixed(5));
          expect(
            recurrentNet._layerSets[index][1].weights[1][0].toFixed(5)
          ).toBe(timeStep.model.hiddenLayers[0].weight.weights[1].toFixed(5));
          expect(
            recurrentNet._layerSets[index][1].weights[2][0].toFixed(5)
          ).toBe(timeStep.model.hiddenLayers[0].weight.weights[2].toFixed(5));
          expect(
            recurrentNet._layerSets[index][0].weights[0][0].toFixed(5)
          ).toBe(timeStep.model.equations[index].inputValue[0].toFixed(5));
        }

        timeStep.train(
          [
            [100, 500, 1000],
            [1000, 500, 100],
          ],
          { iterations: 100, log: true }
        );
        recurrentNet.train(
          [
            [100, 500, 1000],
            [1000, 500, 100],
          ],
          { iterations: 100, errorCheckInterval: 1, log: true }
        );

        expect(recurrentNet._layerSets.length).toBe(
          timeStep.model.equations.length
        );

        testRecurrentLayerSetWeights(timeStep, recurrentNet, 0);
        testRecurrentLayerSetWeights(timeStep, recurrentNet, 1);
        testRecurrentLayerSetWeights(timeStep, recurrentNet, 2);

        expect(recurrentNet.run([100, 500])[0][0]).toBe(
          timeStep.run([100, 500])
        );
        expect(recurrentNet.run([1000, 500])[0][0]).toBe(
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
      const datum = [1, 1];
      net.runInput(datum);
      expect(net._model.length).toEqual(3);
      expect(net._layerSets.length).toEqual(2);
      expect(net._layerSets[0].length).toEqual(10);
      expect(net._layerSets[1].length).toEqual(10);

      const clonedModelWeights = net._model.map((l) =>
        l.weights.map((row) => row.slice(0))
      );

      function deltasAreZero() {
        expect(
          net._layerSets[0].every((l) =>
            l.deltas.every((row) => row.every((delta) => delta === 0))
          )
        ).toBeTruthy();
      }

      function deltasAreSet() {
        expect(
          net._layerSets[0].every((l) =>
            l.deltas.every((row) => row.every((delta) => delta !== 0))
          )
        ).toBeTruthy();
      }

      function modelWeightsAreUpdated() {
        expect(
          clonedModelWeights.every((oldLayerWeights, layerIndex) =>
            oldLayerWeights.every((row, rowIndex) =>
              row.every((oldWeight, columnIndex) => {
                const newLayerWeights = net._model[layerIndex].weights;
                if (layerIndex === 0) return true;
                return oldWeight !== newLayerWeights[rowIndex][columnIndex];
              })
            )
          )
        ).toBeTruthy();
      }

      function modelDeltasAreZero() {
        expect(
          net._model.every((l) =>
            l.deltas.every((row) => row.every((delta) => delta === 0))
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
        let recurrentZeros = null;
        const net = new Recurrent({
          inputLayer: () => inputLayer,
          hiddenLayers: [
            (inputLayer, recurrentInput) => {
              recurrentInput.setDimensions(1, 3);
              recurrentZeros = recurrentInput;
              return add(multiply(weights, inputLayer), recurrentInput);
            },
          ],
          outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
        });

        // single
        net.initialize();
        expect(net._layerSets.length).toEqual(1);
        expect(net._layerSets[0].length).toEqual(10);
        expect(net._layerSets[0][0]).toEqual(inputLayer);
        expect(net._layerSets[0].indexOf(weights)).toBe(1);
        expect(net._layerSets[0].indexOf(recurrentZeros)).toBe(3);

        // double
        net.initializeDeep();
        expect(net._layerSets.length).toEqual(2);
        expect(net._layerSets[1].length).toEqual(10);
        expect(net._layerSets[1][0]).not.toEqual(inputLayer);
        expect(net._layerSets[1][0].constructor).toEqual(
          inputLayer.constructor
        ); // new instance of same type NOT model
        expect(net._layerSets[1].indexOf(weights)).toBe(1); // direct reference IMPORTANT because model
        expect(net._layerSets[1].indexOf(recurrentZeros)).toBe(-1);
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
        (inputLayer, recurrentInput) =>
          rnnCell({ width: 1, height: 1 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer) => output({ width: 1, height: 1 }, inputLayer),
    });
    net.initialize();
    net.initializeDeep();
    expect(net._layerSets.length).toEqual(2);
    expect(net._layerSets[0].length).toEqual(15);
    expect(net._layerSets[1].length).toEqual(15);
    const errors = [];
    for (let i = 0; i < 20; i++) {
      errors.push(net._trainPattern([1, 2], [3], true));
    }
    expect(errors[0] > errors[errors.length - 1]).toBeTruthy();
  });

  test('can have more than one hiddenLayer', () => {
    expect(() => {
      try {
        const net = new Recurrent({
          inputLayer: () => input({ width: 1 }),
          hiddenLayers: [
            (inputLayer, recurrentInput) =>
              rnnCell({ height: 3, width: 1 }, inputLayer, recurrentInput),
            (inputLayer, recurrentInput) =>
              rnnCell({ height: 1, width: 1 }, inputLayer, recurrentInput),
          ],
          outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
        });
        net.initialize();
      } catch (e) {
        throw new Error(e);
      }
    }).not.toThrow();
  });

  test('can learn to increment', () => {
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
    expect(net._model.length).toEqual(5);
    expect(net._layerSets.length).toEqual(2);
    expect(net._layerSets[0].length).toEqual(15);
    expect(net._layerSets[1].length).toEqual(15);
    let error;
    for (let i = 0; i < 100; i++) {
      error = net._trainPattern([0, 1], [2], true);
    }
    expect(error < 0.005).toBeTruthy();
  });

  it('can learn xor', () => {
    const net = new Recurrent({
      praxisOpts: {
        regularizationStrength: 0.000001,
        learningRate: 0.01,
      },
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (input, recurrentInput) =>
          lstmCell({ height: 20 }, input, recurrentInput),
      ],
      outputLayer: (input) => output({ height: 1 }, input),
    });
    const xorNetValues = [
      [0.001, 0.001, 0.001],
      [0.001, 1, 1],
      [1, 0.001, 1],
      [1, 1, 0.001],
    ];
    net.train(xorNetValues, { iterations: 300 });
    expect(net.run([0.001, 0.001])[0][0] < 0.1).toBeTruthy();
    expect(net.run([0.001, 1])[0][0] > 0.9).toBeTruthy();
    expect(net.run([1, 0.001])[0][0] > 0.9).toBeTruthy();
    expect(net.run([1, 1])[0][0] < 0.1).toBeTruthy();
  });
  test('can learn 1,2,3', () => {
    const net = new Recurrent({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer, recurrentInput) =>
          lstmCell({ height: 10 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
    });
    net.initialize();
    net.initializeDeep();
    expect(net._model.length).toEqual(14);
    expect(net._layerSets.length).toEqual(2);
    expect(net._layerSets[0].length).toEqual(44);
    expect(net._layerSets[1].length).toEqual(44);
    let error = Infinity;
    for (let i = 0; i < 101 && error > 0.005; i++) {
      error = net._trainPattern([1, 2, 3], true)[0];
    }
    expect(error).toBeLessThan(0.005);
  });
  test('can learn 1,2,3 using .train()', () => {
    const net = new Recurrent({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer, recurrentInput) =>
          rnnCell({ height: 3 }, inputLayer, recurrentInput),
      ],
      outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
    });
    const results = net.train([[1, 2, 3]], {
      errorCheckInterval: 1,
    });
    expect(results.error < 0.01).toBeTruthy();
  });
});
