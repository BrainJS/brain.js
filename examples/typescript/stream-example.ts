import assert from 'assert';
import { brain } from '../../src';
import { TrainStream } from '../../src/train-stream';

const net = new brain.NeuralNetwork();
const xor = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
];

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const trainingStream = new brain.TrainStream({
  neuralNetwork: net,
  /**
   * Write training data to the stream. Called on each training iteration.
   */
  floodCallback: function () {
    readInputs(trainingStream, xor);
  },

  /**
   * Called when the network is done training.
   */
  doneTrainingCallback: function (stats) {
    console.log(
      `trained in ${stats.iterations} iterations with error: ${stats.error}`
    );

    const result01 = net.run([0, 1]);
    const result00 = net.run([0, 0]);
    const result11 = net.run([1, 1]);
    const result10 = net.run([1, 0]);

    assert(result01[0] > 0.9);
    assert(result00[0] < 0.1);
    assert(result11[0] < 0.1);
    assert(result10[0] > 0.9);

    console.log('0 XOR 1: ', result01); // 0.987
    console.log('0 XOR 0: ', result00); // 0.058
    console.log('1 XOR 1: ', result11); // 0.087
    console.log('1 XOR 0: ', result10); // 0.934
  },
});

// kick it off
readInputs(trainingStream, xor);

function readInputs(stream: TrainStream, data: string | any[]) {
  for (let i = 0; i < data.length; i++) {
    stream.write(data[i]);
  }

  // let it know we've reached the end of the inputs
  stream.endInputs();
}
