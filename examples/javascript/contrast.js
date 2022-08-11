const brain = require("brain.js");
const network = new brain.NeuralNetwork();



network.train([

  {input: {r:0.03,g:0.7,b:0.5}, output:{black: 1}},

  {input: {r:0.16,g:0.9,b:0.2}, output:{white: 1}},

  {input: {r:0.5,g:0.5,b:1.0}, output:{white: 1}}

  ]);
  
  const result = network.run({r:1,g:0.4,b:0.0});

console.log(result);

 const result2 = brain.likely({r:1,g:0.4,b:0.0}, network);

console.log(result2);
