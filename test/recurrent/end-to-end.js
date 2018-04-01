import assert from 'assert';
import Recurrent from '../../src/recurrent';
import {layer} from '../../src';
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
      errors.push(net.trainPattern([0, 0], [0], true));
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

  it.only('can learn xor', () => {
    const net = new Recurrent({
      inputLayer: () => input({ height: 1 }),
      hiddenLayers: [
        (input, recurrentInput) => recurrent({ height: 10 }, input, recurrentInput)
      ],
      outputLayer: input => output({ height: 1 }, input)
    });
    net.initialize();
    net.initializeDeep();
    assert.equal(net._hiddenLayers.length, 2);
    assert.equal(net._hiddenLayers[0].length, 9);
    assert.equal(net._hiddenLayers[1].length, 9);
    let error;
    for (let i = 0; i < 200; i++) {
      error = net.trainPattern([0, 0], [0], true);
      error += net.trainPattern([0, 1], [1], true);
      error += net.trainPattern([1, 0], [1], true);
      error += net.trainPattern([1, 1], [0], true);
      console.log(error / 4);
    }
    console.log(net.runInput([0, 0]));
    console.log(net.runInput([0, 1]));
    console.log(net.runInput([1, 0]));
    console.log(net.runInput([1, 1]));
    assert(error / 4 < 0.005);
  });
});