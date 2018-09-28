import * as assert from 'assert';
import * as brain from '../index';

const trainingData = [
  // xor data, repeating to simulate that we have a lot of data
  { input: [0, 1], output: [1] },
  { input: [0, 0], output: [0] },
  { input: [1, 1], output: [0] },
  { input: [1, 0], output: [1] },

  // repeat xor data to have enough to train with
  { input: [0, 1], output: [1] },
  { input: [0, 0], output: [0] },
  { input: [1, 1], output: [0] },
  { input: [1, 0], output: [1] }
];

const netOptions = {
  hiddenSizes: [3]
} as brain.INeuralNetworkOptions;

const trainingOptions = {
  iterations: 20000,
  log: details => console.log(details)
} as brain.INeuralNetworkTrainingOptions;

const crossValidate = new brain.CrossValidate(brain.NeuralNetwork, netOptions);
const stats = crossValidate.train(trainingData, trainingOptions);
console.log(stats);
const net = crossValidate.toNeuralNetwork();
const result01 = net.run([0, 1]);
const result00 = net.run([0, 0]);
const result11 = net.run([1, 1]);
const result10 = net.run([1, 0]);

assert(result01[0] > 0.9);
assert(result00[0] < 0.1);
assert(result11[0] < 0.1);
assert(result10[0] > 0.9);

console.log('0 XOR 1: ', result01);  // 0.987
console.log('0 XOR 0: ', result00);  // 0.058
console.log('1 XOR 1: ', result11);  // 0.087
console.log('1 XOR 0: ', result10);  // 0.934