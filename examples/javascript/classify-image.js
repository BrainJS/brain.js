const brain = require('brain.js');

const trainingOptions = {
  iterations: 4000,
  errorThresh: 0.02,
  learningRate: 0.01,
  momentum: 0.99,
  log: true,
  logPeriod: 100,
};

const network = new brain.NeuralNetwork({
  activation: 'sigmoid',
  hiddenLayers: [2],
  learningRate: 0.01,
});

// set of 4x4 images in black 1 and white 0
const squaresTrainableData = [
  { input: [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1], output: [1] },
  { input: [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0], output: [1] },
  { input: [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1], output: [1] },
  { input: [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0], output: [1] },
  { input: [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: [1] },
  { input: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], output: [1] },
  { input: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1], output: [1] },
  { input: [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0], output: [1] },
];

const linesTrainableData = [
  { input: [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0], output: [0] },
  { input: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], output: [0] },
  { input: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0], output: [0] },
  { input: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], output: [0] },
  { input: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], output: [0] },
  { input: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], output: [0] },
  { input: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: [0] },
  { input: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: [0] },
];

/* 
1 0 0 0
1 0 0 0
1 0 0 0
1 0 0 0
*/
const preparedLine = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

/* 
0 0 0 0
0 0 0 0
0 1 1 0
0 1 1 0
*/
const preparedSquare = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0];

network.train(
  [...squaresTrainableData, ...linesTrainableData],
  trainingOptions
);

let outputForSquare = network.run(preparedSquare);

console.log('Square is closer to 1 and the result is: ', outputForSquare[0]);

let outputForLine = network.run(preparedLine);

console.log('Line is closer to 0 and the result is: ', outputForLine[0]);
