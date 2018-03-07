/* global describe, it, brain, assert */
describe('Brain.js basic browser test', function () {
  it('has the brain global variable with the things we expect', function () {
    assert(window.brain);
    assert(brain.NeuralNetwork);
    assert(brain.NeuralNetworkGPU);
  });

  it('runs the NeuralNetwork example', function () {
    var net = new brain.NeuralNetwork();

    net.train([
      { input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 } },
      { input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 } },
      { input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 } }
    ]);

    var output = net.run({ r: 1, g: 0.4, b: 0 });

    assert(output.white > output.black);
  });
});
