const brain = require("brain.js");

// provide optional config object (or undefined). Defaults shown.
const config = {
  binaryThresh: 0.5,
  hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
};

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork(config);



network.train([

  {input: {r:0.03,g:0.7,b:0.5}, output:{black: 1}},

  {input: {r:0.16,g:0.9,b:0.2}, output:{white: 1}},

  {input: {r:0.5,g:0.5,b:1.0}, output:{white: 1}}

  ]);
  
  const result = network.run({r:0.0,g:1,b:0.65});

console.log(result);

 const result2 = brain.likely({r:0.0,g:1,b:0.65}, network);

console.log(result2);
