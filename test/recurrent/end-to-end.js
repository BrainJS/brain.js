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

  it('can learn xor', () => {
    const net = new Recurrent({
      inputLayer: () => input({ width: 1 }),
      hiddenLayers: [
        (input, recurrentInput) => recurrent({ height: 3 }, input, recurrentInput),
      ],
      outputLayer: input => output({ width: 1 }, input)
    });
    net.initialize();
    net.initializeDeep();
    net.initializeDeep();
    let error;
    for (let i = 0; i < 20; i++) {
      error = net.trainPattern([0, 0, 0]);
      error += net.trainPattern([0, 1, 1]);
      error += net.trainPattern([1, 0, 1]);
      error += net.trainPattern([1, 1, 0]);
      console.log(error / 4);
    }
    assert(error / 4 < 0.005);
  });
});