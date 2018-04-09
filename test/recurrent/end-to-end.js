import assert from 'assert';
import Recurrent from '../../src/recurrent';
import TimeStep from '../../src/recurrent/time-step';

import {layer} from '../../src';
import Equation from "../../src/recurrent/matrix/equation";
import RandomMatrix from "../../src/recurrent/matrix/random-matrix";
import Matrix from "../../src/recurrent/matrix";
const {
  add,
  input,
  multiply,
  output,
  random,
  recurrent } = layer;

describe('Recurrent Class: End to End', () => {
  const xorTrainingData = [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] }
  ];
  describe('training life-cycle', () => {
    it('properly instantiates starts with random weights and zero deltas and back propagates values through weights', () => {
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
      const hiddenLayers00Weights = net._hiddenLayers[0][0].weights.slice(0);
      const hiddenLayers01Weights = net._hiddenLayers[0][1].weights.slice(0);
      const hiddenLayers02Weights = net._hiddenLayers[0][2].weights.slice(0);
      const hiddenLayers03Weights = net._hiddenLayers[0][3].weights.slice(0);
      const hiddenLayers10Weights = net._hiddenLayers[1][0].weights.slice(0);
      const hiddenLayers11Weights = net._hiddenLayers[1][1].weights.slice(0);
      const hiddenLayers12Weights = net._hiddenLayers[1][2].weights.slice(0);
      const hiddenLayers13Weights = net._hiddenLayers[1][3].weights.slice(0);
      const outputLayers0Weights = net._outputLayers[0].weights.slice(0);
      const outputLayers1Weights = net._outputLayers[1].weights.slice(0);
      const outputLayers2Weights = net._outputLayers[2].weights.slice(0);
      const outputLayers3Weights = net._outputLayers[3].weights.slice(0);

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

      // two arbitrary values that are not zero
      net._calculateDeltas([0.01], 1);
      net._calculateDeltas([1], 0);

      // input layer
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

      // output layer
      assert(net._outputLayers[0].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[1].deltas.every(row => row.some(delta => delta !== 0)));
      assert(net._outputLayers[2].deltas.every(row => row.some(delta => delta !== 0)));

      net._adjustWeights();

      // weights are adjusted
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


      // deltas reset
      // input layer
      assert(net._inputLayers[0].deltas.every(row => row.every(delta => delta === 0)));

      // first hidden layer
      assert(net._hiddenLayers[0][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[0][3].deltas.every(row => row.every(delta => delta === 0)));

      // second hidden layer
      assert(net._hiddenLayers[1][0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[1][1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[1][2].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._hiddenLayers[1][3].deltas.every(row => row.every(delta => delta === 0)));

      // output layer
      assert(net._outputLayers[0].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[1].deltas.every(row => row.every(delta => delta === 0)));
      assert(net._outputLayers[2].deltas.every(row => row.every(delta => delta === 0)));
    });
  });
  describe('.initializeDeep()', () => {
    describe('structure', () => {
      it.only('can create new hidden layers in the correct structure', () => {
        const model = {
          inputLayer: input({ height: 1 }),
          weights: random({ height: 3 })
        };
        const net = new Recurrent({
          inputLayer: () => model.inputLayer,
          hiddenLayers: [
            (input, recurrentInput) => {
              recurrentInput.setDimensions(1, 3);
              return add(multiply(model.weights, input), recurrentInput);
            }
          ],
          outputLayer: input => output({ height: 1 }, input)
        });

        // single
        net.initialize();
        assert.equal(net._inputLayers.length, 1);
        assert.equal(net._inputLayers[0], model.inputLayer);
        assert.equal(net._hiddenLayers.length, 1);
        
        // double
        net.initializeDeep();
        assert.equal(net._hiddenLayers.length, 2);

        //triple
        net.initializeDeep();
        assert.equal(net._hiddenLayers.length, 3);

        assert.equal(net._hiddenLayers[0].length, 4);
        assert.equal(net._hiddenLayers[0][0].constructor.name, 'Random');
        assert.equal(net._hiddenLayers[0][1].constructor.name, 'Multiply');
        assert.equal(net._hiddenLayers[0][2].constructor.name, 'RecurrentZeros');
        assert.equal(net._hiddenLayers[0][3].constructor.name, 'Add');

        assert.equal(net._hiddenLayers[1].length, 4);
        assert.equal(net._hiddenLayers[1][0].constructor.name, 'Random');
        assert.equal(net._hiddenLayers[1][1].constructor.name, 'Multiply');
        assert.equal(net._hiddenLayers[1][2].constructor.name, 'RecurrentInput');
        assert.equal(net._hiddenLayers[1][3].constructor.name, 'Add');

        assert.equal(net._hiddenLayers[1][2].recurrentInput, net._hiddenLayers[0][3]);
        assert.equal(net._hiddenLayers[1][2].weights, net._hiddenLayers[0][3].weights);
        assert.equal(net._hiddenLayers[1][2].deltas, net._hiddenLayers[0][3].deltas);

        assert.equal(net._hiddenLayers[2].length, 4);
        assert.equal(net._hiddenLayers[2][0].constructor.name, 'Random');
        assert.equal(net._hiddenLayers[2][1].constructor.name, 'Multiply');
        assert.equal(net._hiddenLayers[2][2].constructor.name, 'RecurrentInput');
        assert.equal(net._hiddenLayers[2][3].constructor.name, 'Add');

        assert.equal(net._hiddenLayers[2][2].recurrentInput, net._hiddenLayers[1][3]);
        assert.notEqual(net._hiddenLayers[2][2].recurrentInput, net._hiddenLayers[0][3]);
        assert.equal(net._hiddenLayers[2][2].weights, net._hiddenLayers[1][3].weights);
        assert.equal(net._hiddenLayers[2][2].deltas, net._hiddenLayers[1][3].deltas);

        assert.notEqual(net._hiddenLayers[0][3], net._hiddenLayers[1][3]);
        assert.notEqual(net._hiddenLayers[1][3], net._hiddenLayers[2][3]);
        assert.notEqual(net._hiddenLayers[0][3], net._hiddenLayers[2][3]);

        assert.equal(net._outputLayers.length, 4);
        assert.equal(net._outputLayers[0].constructor.name, 'Random');
        assert.equal(net._outputLayers[1].constructor.name, 'RecurrentConnection');
        assert.equal(net._outputLayers[2].constructor.name, 'Multiply');
        assert.equal(net._outputLayers[3].constructor.name, 'Target');

        net._outputConnection.setLayerOriginal = net._outputConnection.setLayer;
        let actualConnectedLayers = [];
        // last in first out
        net._outputConnection.setLayer = function(layer) {
          actualConnectedLayers.unshift(layer);
          this.setLayerOriginal(layer);
        };

        net._inputLayers[0].weights = [[0]];
        net._calculateDeltas([0, 0, 0], 0);
        const desiredConnectionLayers = [net._hiddenLayers[0][3], net._hiddenLayers[1][3], net._hiddenLayers[2][3]];
        assert.equal(actualConnectedLayers[0], desiredConnectionLayers[0], `actualConnectedLayers[0] should be desiredConnectionLayers[0] but is actualConnectedLayers[${ desiredConnectionLayers.indexOf(actualConnectedLayers[0]) }]`);
        assert.equal(actualConnectedLayers[1], desiredConnectionLayers[1], `actualConnectedLayers[1] should be desiredConnectionLayers[1] but is actualConnectedLayers[${ desiredConnectionLayers.indexOf(actualConnectedLayers[1]) }]`);
        assert.equal(actualConnectedLayers[2], desiredConnectionLayers[2], `actualConnectedLayers[2] should be desiredConnectionLayers[2] but is actualConnectedLayers[${ desiredConnectionLayers.indexOf(actualConnectedLayers[2]) }]`);
      });
    });
  });
  it('can learn', () => {
    const net = new Recurrent({
      inputLayer: () => input({ width: 1 }),
      hiddenLayers: [
        (input, recurrentInput) => recurrent({ width: 1, height: 1 }, input, recurrentInput)
      ],
      outputLayer: input => output({ width: 1, height: 1 }, input)
    });
    net.initialize();
    net.initializeDeep();
    assert.equal(net._hiddenLayers.length, 2);
    assert.equal(net._hiddenLayers[0].length, 9);
    assert.equal(net._hiddenLayers[1].length, 9);
    const errors = [];
    for (let i = 0; i < 20; i++) {
      errors.push(net.trainPattern([0, 0], [1], true));
    }
    assert(errors[0] > errors[errors.length - 1]);
  });

  it('can have more than one hiddenLayer', () => {
    assert.doesNotThrow(() => {
      try {
        const net = new Recurrent({
          inputLayer: () => input({width: 1}),
          hiddenLayers: [
            (input, recurrentInput) => recurrent({ height: 3, width: 1 }, input, recurrentInput),
            (input, recurrentInput) => recurrent({ height: 1, width: 1 }, input, recurrentInput)
          ],
          outputLayer: input => output({height: 1}, input)
        });
        net.initialize();
      } catch(e) {
        console.warn(e);
        throw new Error(e);
      }
    }, 'net could not initialize');
  });

  it('can learn xor', () => {
    const net = new Recurrent({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (input, recurrentInput) => recurrent({ height: 20 }, input, recurrentInput)
      ],
      outputLayer: input => output({ height: 1 }, input)
    });
    net.initialize();
    net.initializeDeep();
    assert.equal(net._hiddenLayers.length, 2);
    assert.equal(net._hiddenLayers[0].length, 9);
    assert.equal(net._hiddenLayers[1].length, 9);
    let error;
    for (let i = 0; i < 500; i++) {
      error = net.trainPattern([0, 0], [0], true);
      error += net.trainPattern([0, 1], [1], true);
      error += net.trainPattern([1, 0], [1], true);
      error += net.trainPattern([1, 1], [0], true);
      console.log(error / 4);
    }
    net.log = true;
    console.log(net.runInput([0, 0]));
    console.log(net.runInput([0, 1]));
    console.log(net.runInput([1, 0]));
    console.log(net.runInput([1, 1]));
    assert(error / 4 < 0.005);
  });
});