const { GPU } = require('gpu.js');

const { add, input, multiply, output, random, recurrent } = require('../../src/layer');
const { setup, teardown } = require('../../src/utilities/kernel');

const { Recurrent } = require('../../src/recurrent');
const RNNTimeStep = require('../../src/recurrent/rnn-time-step');
const zeros2D = require('../../src/utilities/zeros-2d');

describe('Recurrent Class: End to End', () => {
  beforeEach(() => {
    setup(new GPU({ mode: 'cpu' }));
  });
  afterEach(() => {
    teardown();
  });
  describe('when configured like RNNTimeStep', () => {
    test('forward propagates equivalent to baseline', () => {
      const timeStep = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [3],
        outputSize: 1,
      });
      const recurrentNet = new Recurrent({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [
          (inputLayer, recurrentInput) =>
            recurrent({ width: 1, height: 3 }, inputLayer, recurrentInput),
        ],
        outputLayer: inputLayer => output({ height: 1 }, inputLayer),
      });
      timeStep.initialize();
      recurrentNet.initialize();

      expect(
        [
          timeStep.model.hiddenLayers[0].bias,
          timeStep.model.hiddenLayers[0].transition,
          timeStep.model.hiddenLayers[0].weight,
        ].length
      ).toEqual(recurrentNet._model.length);
      // set both nets exactly the same, then train them once, and compare
      // zero out
      recurrentNet._inputLayers.forEach(l => {
        l.deltas = zeros2D(l.width, l.height);
        l.weights = zeros2D(l.width, l.height);
      });
      recurrentNet._hiddenLayerSets[0].forEach(l => {
        l.deltas = zeros2D(l.width, l.height);
        l.weights = zeros2D(l.width, l.height);
      });
      recurrentNet._outputLayers.forEach(l => {
        l.deltas = zeros2D(l.width, l.height);
        l.weights = zeros2D(l.width, l.height);
      });
      // timeStep.model.input.weights.forEach((weight, i) => {
      //   timeStep.model.input.weights[i] = 0;
      //   timeStep.model.input.deltas[i] = 0;
      // });
      timeStep.model.hiddenLayers.forEach(l => {
        l.bias.weights.forEach((weight, i) => {
          l.bias.weights[i] = 0;
          l.bias.deltas[i] = 0;
        });
        l.transition.weights.forEach((weight, i) => {
          l.transition.weights[i] = 0;
          l.transition.deltas[i] = 0;
        });
        l.weight.weights.forEach((weight, i) => {
          l.weight.weights[i] = 0;
          l.weight.deltas[i] = 0;
        });
      });
      timeStep.model.output.weights.forEach((weight, i) => {
        timeStep.model.output.weights[i] = 0;
        timeStep.model.output.deltas[i] = 0;
      });

      // timeStep.model.allMatrices.forEach(l => l.weights.forEach((weight, i) => {
      //   l.weights[i] = 0;
      //   l.deltas[i] = 0;
      // }));

      const recurrentWeightLayers = recurrentNet._model.filter(
        l => l.name === 'weight'
      );
      const recurrentTransitionLayers = recurrentNet._model.filter(
        l => l.name === 'transition'
      );
      const recurrentBiasLayers = recurrentNet._model.filter(
        l => l.name === 'bias'
      );
      const recurrentOutputLayer = recurrentNet._outputLayers.filter(
        l => l.name === 'outputGate'
      )[0];

      const recurrentRecurrentLayer = recurrentNet._hiddenLayerSets[0][1];

      timeStep.bindEquation();
      const timeStepWeightLayers = timeStep.model.hiddenLayers.map(
        hiddenLayers => hiddenLayers.weight
      );
      const timeStepTransitionLayers = timeStep.model.hiddenLayers.map(
        hiddenLayers => hiddenLayers.transition
      );
      const timeStepBiasLayers = timeStep.model.hiddenLayers.map(
        hiddenLayers => hiddenLayers.bias
      );
      const timeStepOutputLayer = timeStep.model.allMatrices[3];
      const timeStepRecurrentLayer = timeStep.model.equations[0].states[2].right;

      expect(recurrentWeightLayers.length).toEqual(timeStepWeightLayers.length);
      expect(recurrentTransitionLayers.length).toEqual(
        timeStepTransitionLayers.length
      );
      expect(recurrentBiasLayers.length).toEqual(timeStepBiasLayers.length);

      // set weights
      recurrentWeightLayers[0].weights[0][0] = timeStepWeightLayers[0].weights[0] = 19;
      recurrentWeightLayers[0].weights[1][0] = timeStepWeightLayers[0].weights[1] = 16;
      recurrentWeightLayers[0].weights[2][0] = timeStepWeightLayers[0].weights[2] = 5;

      // set transition
      recurrentTransitionLayers[0].weights[0][0] = timeStepTransitionLayers[0].weights[0] = 12;
      recurrentTransitionLayers[0].weights[0][1] = timeStepTransitionLayers[0].weights[1] = 7;
      recurrentTransitionLayers[0].weights[0][2] = timeStepTransitionLayers[0].weights[2] = 7;
      recurrentTransitionLayers[0].weights[1][0] = timeStepTransitionLayers[0].weights[3] = 4;
      recurrentTransitionLayers[0].weights[1][1] = timeStepTransitionLayers[0].weights[4] = 14;
      recurrentTransitionLayers[0].weights[1][2] = timeStepTransitionLayers[0].weights[5] = 6;
      recurrentTransitionLayers[0].weights[2][0] = timeStepTransitionLayers[0].weights[6] = 3;
      recurrentTransitionLayers[0].weights[2][1] = timeStepTransitionLayers[0].weights[7] = 7;
      recurrentTransitionLayers[0].weights[2][2] = timeStepTransitionLayers[0].weights[8] = 19;

      recurrentOutputLayer.weights[0][0] = timeStepOutputLayer.weights[0] = 5;
      recurrentOutputLayer.weights[0][1] = timeStepOutputLayer.weights[1] = 3;
      recurrentOutputLayer.weights[0][2] = timeStepOutputLayer.weights[2] = 1;

      recurrentRecurrentLayer.weights[0][0] = timeStepRecurrentLayer.weights[0] = 4;
      recurrentRecurrentLayer.weights[1][0] = timeStepRecurrentLayer.weights[1] = 8;
      recurrentRecurrentLayer.weights[2][0] = timeStepRecurrentLayer.weights[2] = 12;

      timeStep.run([2, 3]);
      recurrentNet.run([2, 3]);

      // expect(recurrentNet._inputLayers[0].weights[0][0]).toEqual(
      //   timeStep.model.input.weights[0]
      // );

      expect(recurrentNet._hiddenLayerSets[0][0].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[1].product.weights[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][0].weights[1][0]).toEqual(
        timeStep.model.equations[0].states[1].product.weights[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][0].weights[2][0]).toEqual(
        timeStep.model.equations[0].states[1].product.weights[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][2].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[2].product.weights[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][2].weights[1][0]).toEqual(
        timeStep.model.equations[0].states[2].product.weights[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][2].weights[2][0]).toEqual(
        timeStep.model.equations[0].states[2].product.weights[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][3].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[3].product.weights[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][3].weights[1][0]).toEqual(
        timeStep.model.equations[0].states[3].product.weights[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][3].weights[2][0]).toEqual(
        timeStep.model.equations[0].states[3].product.weights[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][4].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[4].product.weights[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][4].weights[1][0]).toEqual(
        timeStep.model.equations[0].states[4].product.weights[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][4].weights[2][0]).toEqual(
        timeStep.model.equations[0].states[4].product.weights[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][5].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[5].product.weights[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][5].weights[1][0]).toEqual(
        timeStep.model.equations[0].states[5].product.weights[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][5].weights[2][0]).toEqual(
        timeStep.model.equations[0].states[5].product.weights[2]
      );

      // assert.equal(recurrentNet._outputLayers[0].weights, timeStep.model.);
      expect(recurrentNet._outputLayers[1].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[5].product.weights[0]
      );
      expect(recurrentNet._outputLayers[1].weights[1][0]).toEqual(
        timeStep.model.equations[0].states[5].product.weights[1]
      );
      expect(recurrentNet._outputLayers[1].weights[2][0]).toEqual(
        timeStep.model.equations[0].states[5].product.weights[2]
      );
      expect(recurrentNet._outputLayers[2].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[6].product.weights[0]
      );
      expect(recurrentNet._outputLayers[4].weights[0][0]).toEqual(
        timeStep.model.equations[0].states[7].product.weights[0]
      );

      recurrentNet._calculateDeltas([3], 0);
      // manually connect the product weights and deltas
      timeStep.model.equations[0].states[7].product.deltas = timeStep.model.equations[0].states[7].product.weights.slice(0);
      timeStep.model.equations[0].states[7].product.deltas[0] -= 3;
      timeStep.backpropagate();

      expect(recurrentNet._outputLayers[5].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[7].product.deltas[0]
      );
      expect(recurrentNet._outputLayers[4].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[6].product.deltas[0]
      );
      expect(recurrentNet._outputLayers[1].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[5].product.deltas[0]
      );
      expect(recurrentNet._outputLayers[1].deltas[1][0]).toEqual(
        timeStep.model.equations[0].states[5].product.deltas[1]
      );
      expect(recurrentNet._outputLayers[1].deltas[2][0]).toEqual(
        timeStep.model.equations[0].states[5].product.deltas[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][5].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[5].product.deltas[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][5].deltas[1][0]).toEqual(
        timeStep.model.equations[0].states[5].product.deltas[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][5].deltas[2][0]).toEqual(
        timeStep.model.equations[0].states[5].product.deltas[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][4].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[4].product.deltas[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][4].deltas[1][0]).toEqual(
        timeStep.model.equations[0].states[4].product.deltas[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][4].deltas[2][0]).toEqual(
        timeStep.model.equations[0].states[4].product.deltas[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][3].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[3].product.deltas[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][3].deltas[1][0]).toEqual(
        timeStep.model.equations[0].states[3].product.deltas[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][3].deltas[2][0]).toEqual(
        timeStep.model.equations[0].states[3].product.deltas[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][2].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[2].product.deltas[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][2].deltas[1][0]).toEqual(
        timeStep.model.equations[0].states[2].product.deltas[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][2].deltas[2][0]).toEqual(
        timeStep.model.equations[0].states[2].product.deltas[2]
      );

      expect(recurrentNet._hiddenLayerSets[0][0].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[1].product.deltas[0]
      );
      expect(recurrentNet._hiddenLayerSets[0][0].deltas[1][0]).toEqual(
        timeStep.model.equations[0].states[1].product.deltas[1]
      );
      expect(recurrentNet._hiddenLayerSets[0][0].deltas[2][0]).toEqual(
        timeStep.model.equations[0].states[1].product.deltas[2]
      );

      expect(recurrentNet._inputLayers[0].deltas[0][0]).toEqual(
        timeStep.model.equations[0].states[0].product.deltas[0]
      );
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
        outputLayer: inputLayer => output({ height: 1 }, inputLayer),
      });

      net.initialize();
      net.initializeDeep();
      net.runInput([1, 1]);
      expect(net._model.length).toEqual(1);
      expect(net._hiddenLayerSets[0].length).toEqual(3);
      const modelLayer0Weights = net._model[0].weights.slice(0);
      const hiddenLayers00Weights = net._hiddenLayerSets[0][0].weights.slice(0);
      const hiddenLayers01Weights = net._hiddenLayerSets[0][1].weights.slice(0);
      const hiddenLayers02Weights = net._hiddenLayerSets[0][2].weights.slice(0);
      const hiddenLayers10Weights = net._hiddenLayerSets[1][0].weights.slice(0);
      const hiddenLayers11Weights = net._hiddenLayerSets[1][1].weights.slice(0);
      const hiddenLayers12Weights = net._hiddenLayerSets[1][2].weights.slice(0);
      const outputLayers0Weights = net._outputLayers[0].weights.slice(0);
      const outputLayers1Weights = net._outputLayers[1].weights.slice(0);
      const outputLayers2Weights = net._outputLayers[2].weights.slice(0);
      const outputLayers3Weights = net._outputLayers[3].weights.slice(0);

      expect(
        net._model[0].deltas.every(row => row.every(delta => delta === 0))
      ).toBeTruthy();

      expect(
        net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0))
      ).toBeTruthy();

      expect(
        net._hiddenLayerSets[0][0].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[0][1].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[0][2].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();

      expect(
        net._hiddenLayerSets[1][0].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[1][1].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[1][2].deltas.every(row =>
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

      // two arbitrary values that are not zero
      net._calculateDeltas([0.01], 1);
      net._calculateDeltas([1], 0);

      // model
      expect(
        net._model[0].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();

      // input layer
      expect(
        net._inputLayers[0].deltas.every(row => row.some(delta => delta !== 0))
      ).toBeTruthy();

      // first hidden layer
      expect(
        net._hiddenLayerSets[0][0].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[0][1].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[0][2].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();

      // second hidden layer
      expect(
        net._hiddenLayerSets[1][0].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[1][1].deltas.every(row =>
          row.some(delta => delta !== 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[1][2].deltas.every(row =>
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

      net.adjustWeights();

      // weights are adjusted
      expect(modelLayer0Weights).not.toEqual(net._model[0].weights);

      expect(hiddenLayers00Weights).not.toEqual(net._hiddenLayerSets[0][0].weights);
      expect(hiddenLayers01Weights).not.toEqual(net._hiddenLayerSets[0][1].weights);
      expect(hiddenLayers02Weights).not.toEqual(net._hiddenLayerSets[0][2].weights);
      expect(hiddenLayers10Weights).not.toEqual(net._hiddenLayerSets[1][0].weights);
      expect(hiddenLayers11Weights).not.toEqual(net._hiddenLayerSets[1][1].weights);
      expect(hiddenLayers12Weights).not.toEqual(net._hiddenLayerSets[1][2].weights);

      expect(outputLayers0Weights).not.toEqual(net._outputLayers[0].weights);
      expect(outputLayers1Weights).not.toEqual(net._outputLayers[1].weights);
      expect(outputLayers2Weights).not.toEqual(net._outputLayers[2].weights);
      expect(outputLayers3Weights).not.toEqual(net._outputLayers[3].weights);

      // deltas reset
      // model
      expect(
        net._model[0].deltas.every(row => row.every(delta => delta === 0))
      ).toBeTruthy();

      // input layer
      expect(
        net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0))
      ).toBeTruthy();

      // first hidden layer
      expect(
        net._hiddenLayerSets[0][0].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[0][1].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[0][2].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();

      // second hidden layer
      expect(
        net._hiddenLayerSets[1][0].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[1][1].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();
      expect(
        net._hiddenLayerSets[1][2].deltas.every(row =>
          row.every(delta => delta === 0)
        )
      ).toBeTruthy();

      // output layer
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
    });
  });
  describe('.initializeDeep()', () => {
    describe('structure', () => {
      test('can create new hidden layers in the correct structure', () => {
        const model = {
          inputLayer: input({ height: 1 }),
          weights: random({ height: 3 }),
        };
        const net = new Recurrent({
          inputLayer: () => model.inputLayer,
          hiddenLayers: [
            (inputLayer, recurrentInput) => {
              recurrentInput.setDimensions(1, 3);
              return add(multiply(model.weights, inputLayer), recurrentInput);
            },
          ],
          outputLayer: inputLayer => output({ height: 1 }, inputLayer),
        });

        // single
        net.initialize();
        expect(net._inputLayers.length).toEqual(1);
        expect(net._inputLayers[0]).toEqual(model.inputLayer);
        expect(net._hiddenLayers.length).toEqual(1);

        // double
        net.initializeDeep();
        expect(net._hiddenLayerSets.length).toEqual(2);

        // triple
        net.initializeDeep();
        expect(net._hiddenLayerSets.length).toEqual(3);

        expect(net._hiddenLayerSets[0].length).toEqual(3);
        expect(net._hiddenLayerSets[0][0].constructor.name).toEqual('Multiply');
        expect(net._hiddenLayerSets[0][1].constructor.name).toEqual(
          'RecurrentZeros'
        );
        expect(net._hiddenLayerSets[0][2].constructor.name).toEqual('Add');

        expect(net._hiddenLayerSets[1].length).toEqual(3);
        expect(net._hiddenLayerSets[1][0].constructor.name).toEqual('Multiply');
        expect(net._hiddenLayerSets[1][1].constructor.name).toEqual(
          'RecurrentInput'
        );
        expect(net._hiddenLayerSets[1][2].constructor.name).toEqual('Add');

        expect(net._hiddenLayerSets[1][1].recurrentInput).toEqual(
          net._hiddenLayerSets[0][2]
        );
        expect(net._hiddenLayerSets[1][1].weights).toEqual(
          net._hiddenLayerSets[0][2].weights
        );
        expect(net._hiddenLayerSets[1][1].deltas).toEqual(
          net._hiddenLayerSets[0][2].deltas
        );

        expect(net._hiddenLayerSets[2].length).toEqual(3);
        expect(net._hiddenLayerSets[2][0].constructor.name).toEqual('Multiply');
        expect(net._hiddenLayerSets[2][1].constructor.name).toEqual(
          'RecurrentInput'
        );
        expect(net._hiddenLayerSets[2][2].constructor.name).toEqual('Add');

        expect(net._hiddenLayerSets[2][1].recurrentInput).toEqual(
          net._hiddenLayerSets[1][2]
        );
        expect(net._hiddenLayerSets[2][1].recurrentInput).not.toEqual(
          net._hiddenLayerSets[0][2]
        );
        expect(net._hiddenLayerSets[2][1].weights).toEqual(
          net._hiddenLayerSets[1][2].weights
        );
        expect(net._hiddenLayerSets[2][1].deltas).toEqual(
          net._hiddenLayerSets[1][2].deltas
        );

        expect(net._hiddenLayerSets[0][2]).not.toEqual(net._hiddenLayerSets[1][2]);
        expect(net._hiddenLayerSets[1][2]).not.toEqual(net._hiddenLayerSets[2][2]);
        expect(net._hiddenLayerSets[0][2]).not.toEqual(net._hiddenLayerSets[2][2]);

        expect(net._outputLayers.length).toEqual(6);
        expect(net._outputLayers[0].constructor.name).toEqual('Random');
        expect(net._outputLayers[1].constructor.name).toEqual(
          'RecurrentConnection'
        );
        expect(net._outputLayers[2].constructor.name).toEqual('Multiply');
        expect(net._outputLayers[3].constructor.name).toEqual('Zeros');
        expect(net._outputLayers[4].constructor.name).toEqual('Add');
        expect(net._outputLayers[5].constructor.name).toEqual('Target');

        net._outputConnection.setLayerOriginal = net._outputConnection.setLayer;
        const actualConnectedLayers = [];
        // last in first out
        net._outputConnection.setLayer = l => {
          actualConnectedLayers.unshift(l);
          net._outputConnection.setLayerOriginal(l);
        };

        net._inputLayers[0].weights = [[0]];
        net._calculateDeltas([0, 0, 0], 0);
        const desiredConnectionLayers = [
          net._hiddenLayerSets[0][2],
          net._hiddenLayerSets[1][2],
          net._hiddenLayerSets[2][2],
        ];
        expect(actualConnectedLayers[0]).toEqual(desiredConnectionLayers[0]);
        expect(actualConnectedLayers[1]).toEqual(desiredConnectionLayers[1]);
        expect(actualConnectedLayers[2]).toEqual(desiredConnectionLayers[2]);
      });
    });
  });
  test('can learn', () => {
    const net = new Recurrent({
      inputLayer: () => input({ width: 1 }),
      hiddenLayers: [
        (inputLayer, recurrentInput) =>
          recurrent({ width: 1, height: 1 }, inputLayer, recurrentInput),
      ],
      outputLayer: inputLayer => output({ width: 1, height: 1 }, inputLayer),
    });
    net.initialize();
    net.initializeDeep();
    expect(net._hiddenLayerSets.length).toEqual(2);
    expect(net._hiddenLayerSets[0].length).toEqual(6);
    expect(net._hiddenLayerSets[1].length).toEqual(6);
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
              recurrent({ height: 3, width: 1 }, inputLayer, recurrentInput),
            (inputLayer, recurrentInput) =>
              recurrent({ height: 1, width: 1 }, inputLayer, recurrentInput),
          ],
          outputLayer: inputLayer => output({ height: 1 }, inputLayer),
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
          recurrent({ height: 3 }, inputLayer, recurrentInput),
      ],
      outputLayer: inputLayer => output({ height: 1 }, inputLayer),
    });
    net.initialize();
    net.initializeDeep();
    expect(net._model.length).toEqual(3);
    expect(net._hiddenLayerSets.length).toEqual(2);
    expect(net._hiddenLayerSets[0].length).toEqual(6);
    expect(net._hiddenLayerSets[1].length).toEqual(6);
    let error;
    for (let i = 0; i < 100; i++) {
      error = net._trainPattern([0, 1], [2], true);
    }
    expect(error < 0.005).toBeTruthy();
  });

  // it('can learn xor', () => {
  //   const net = new Recurrent({
  //     inputLayer: () => input({ height: 1 }),
  //     hiddenLayers: [
  //       (input, recurrentInput) => recurrent({ height: 3 }, input, recurrentInput)
  //     ],
  //     outputLayer: input => output({ height: 1 }, input)
  //   });
  //   net.initialize();
  //   net.initializeDeep();
  //   assert.equal(net._model.length, 3);
  //   assert.equal(net._hiddenLayers.length, 2);
  //   assert.equal(net._hiddenLayerSets[0].length, 6);
  //   assert.equal(net._hiddenLayerSets[1].length, 6);
  //   let error;
  //   for (let i = 0; i < 100; i++) {
  //     error = net._trainPattern([0, 0], [0], true);
  //     error += net._trainPattern([0, 1], [1], true);
  //     error += net._trainPattern([1, 0], [1], true);
  //     error += net._trainPattern([1, 1], [0], true);
  //     console.log(error / 4);
  //   }
  //   console.log(net.runInput([0, 0]));
  //   console.log(net.runInput([0, 1]));
  //   console.log(net.runInput([1, 0]));
  //   console.log(net.runInput([1, 1]));
  //   assert(error / 4 < 0.005);
  // });
  test('can learn 1,2,3', () => {
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
    expect(net._model.length).toEqual(3);
    expect(net._hiddenLayerSets.length).toEqual(2);
    expect(net._hiddenLayerSets[0].length).toEqual(6);
    expect(net._hiddenLayerSets[1].length).toEqual(6);
    let error = Infinity;
    for (let i = 0; i < 101 && error > 0.005; i++) {
      error = net._trainPattern([1, 2], [3], true);
    }
    expect(error).toBeLessThan(0.005);
  });
  test('can learn 1,2,3 using .train()', () => {
    const net = new Recurrent({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (inputLayer, recurrentInput) =>
          recurrent({ height: 3 }, inputLayer, recurrentInput),
      ],
      outputLayer: inputLayer => output({ height: 1 }, inputLayer),
    });
    const results = net.train([
      {
        input: [1, 2],
        output: [3],
      },
    ],{
      errorCheckInterval: 1,
    });
    expect(results.error < 0.01).toBeTruthy();
  });
});
