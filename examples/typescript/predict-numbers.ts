import assert from 'assert';
import * as brain from '../../src';

const net = new brain.recurrent.LSTMTimeStep({
  inputSize: 2,
  hiddenLayers: [10],
  outputSize: 2,
});

// Same test as previous, but combined on a single set
const trainingData = [
  [
    [1, 5],
    [2, 4],
    [3, 3],
    [4, 2],
    [5, 1],
  ],
] as brain.RNNTimeStepInput[];

net.train(trainingData, { log: true, errorThresh: 0.09 });

const closeToFiveAndOne = net.run([
  [1, 5],
  [2, 4],
  [3, 3],
  [4, 2],
]);

assert(
  Math.round(closeToFiveAndOne[0]) === 5,
  `${closeToFiveAndOne[0]} does not round to 5`
);
assert(
  Math.round(closeToFiveAndOne[1]) === 1,
  `${closeToFiveAndOne[1]} does not round to 1`
);

console.log(closeToFiveAndOne);

// now we're cookin' with gas!
const forecast = net.forecast(
  [
    [1, 5],
    [2, 4],
  ],
  3
);
assert(
  Math.round(forecast[2][0]) === 5,
  `${forecast[2][0]} does not round to 5`
);
assert(
  Math.round(forecast[2][1]) === 1,
  `${forecast[2][1]} does not round to 1`
);

console.log('next 3 predictions', forecast);
