const NeuralNetwork = require('../../src/neural-network');
const istanbulLinkerUtil = require('../istanbul-linker-util');

describe('.toFunction()', () => {
  describe('sigmoid activation', () => {
    const originalNet = new NeuralNetwork();
    const xorTrainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction(istanbulLinkerUtil);
    it('runs same as original network', () => {
      expect(xor([0, 0])[0].toFixed(5)).toEqual(
        originalNet.run([0, 0])[0].toFixed(5)
      );
      expect(xor([0, 1])[0].toFixed(5)).toEqual(
        originalNet.run([0, 1])[0].toFixed(5)
      );
      expect(xor([1, 0])[0].toFixed(5)).toEqual(
        originalNet.run([1, 0])[0].toFixed(5)
      );
      expect(xor([1, 1])[0].toFixed(5)).toEqual(
        originalNet.run([1, 1])[0].toFixed(5)
      );
    });
  });
  describe('relu activation', () => {
    const originalNet = new NeuralNetwork({ activation: 'relu' });
    const xorTrainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction(istanbulLinkerUtil);
    it('runs same as original network', () => {
      expect(xor([0, 0])[0].toFixed(5)).toEqual(
        originalNet.run([0, 0])[0].toFixed(5)
      );
      expect(xor([0, 1])[0].toFixed(5)).toEqual(
        originalNet.run([0, 1])[0].toFixed(5)
      );
      expect(xor([1, 0])[0].toFixed(5)).toEqual(
        originalNet.run([1, 0])[0].toFixed(5)
      );
      expect(xor([1, 1])[0].toFixed(5)).toEqual(
        originalNet.run([1, 1])[0].toFixed(5)
      );
    });
  });
  describe('leaky-relu activation', () => {
    const originalNet = new NeuralNetwork({ activation: 'leaky-relu' });
    const xorTrainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction(istanbulLinkerUtil);
    it('runs same as original network', () => {
      expect(xor([0, 0])[0].toFixed(5)).toEqual(
        originalNet.run([0, 0])[0].toFixed(5)
      );
      expect(xor([0, 1])[0].toFixed(5)).toEqual(
        originalNet.run([0, 1])[0].toFixed(5)
      );
      expect(xor([1, 0])[0].toFixed(5)).toEqual(
        originalNet.run([1, 0])[0].toFixed(5)
      );
      expect(xor([1, 1])[0].toFixed(5)).toEqual(
        originalNet.run([1, 1])[0].toFixed(5)
      );
    });
  });
  describe('tanh activation', () => {
    const originalNet = new NeuralNetwork({ activation: 'tanh' });
    const xorTrainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction(istanbulLinkerUtil);
    it('runs same as original network', () => {
      expect(xor([0, 0])[0].toFixed(5)).toEqual(
        originalNet.run([0, 0])[0].toFixed(5)
      );
      expect(xor([0, 1])[0].toFixed(5)).toEqual(
        originalNet.run([0, 1])[0].toFixed(5)
      );
      expect(xor([1, 0])[0].toFixed(5)).toEqual(
        originalNet.run([1, 0])[0].toFixed(5)
      );
      expect(xor([1, 1])[0].toFixed(5)).toEqual(
        originalNet.run([1, 1])[0].toFixed(5)
      );
    });
  });

  it('can work with partial input objects', () => {
    const trainingData = [
      { input: { 'I am super happy!': 1 }, output: { happy: 1 } },
      { input: { 'What a pill!': 1 }, output: { sarcastic: 1 } },
      { input: { 'I am super unhappy!': 1 }, output: { sad: 1 } },
      { input: { 'Are we there yet?': 1 }, output: { excited: 1 } },
    ];

    const net = new NeuralNetwork({ hiddenLayers: [3] });
    net.train(trainingData, {
      iterations: 1000,
      errorThresh: 0.01,
    });

    const happyOutput = net.run({ 'I am super happy!': 1 });
    expect(happyOutput.happy).toBeGreaterThan(0.5);
    expect(happyOutput.sarcastic).toBeLessThan(0.5);
    expect(happyOutput.sad).toBeLessThan(0.5);
    expect(happyOutput.excited).toBeLessThan(0.5);

    const sarcasticOutput = net.run({ 'What a pill!': 1 });
    expect(sarcasticOutput.happy).toBeLessThan(0.5);
    expect(sarcasticOutput.sarcastic).toBeGreaterThan(0.5);
    expect(sarcasticOutput.sad).toBeLessThan(0.5);
    expect(sarcasticOutput.excited).toBeLessThan(0.5);

    const sadOutput = net.run({ 'I am super unhappy!': 1 });
    expect(sadOutput.happy).toBeLessThan(0.5);
    expect(sadOutput.sarcastic).toBeLessThan(0.5);
    expect(sadOutput.sad).toBeGreaterThan(0.5);
    expect(sadOutput.excited).toBeLessThan(0.5);

    const excitedOutput = net.run({ 'Are we there yet?': 1 });
    expect(excitedOutput.happy).toBeLessThan(0.5);
    expect(excitedOutput.sarcastic).toBeLessThan(0.5);
    expect(excitedOutput.sad).toBeLessThan(0.5);
    expect(excitedOutput.excited).toBeGreaterThan(0.5);

    const run = net.toFunction(istanbulLinkerUtil);

    const runHappyOutput = run({ 'I am super happy!': 1 });
    expect(runHappyOutput.happy).toBeGreaterThan(0.5);
    expect(runHappyOutput.sarcastic).toBeLessThan(0.5);
    expect(runHappyOutput.sad).toBeLessThan(0.5);
    expect(runHappyOutput.excited).toBeLessThan(0.5);

    const runSarcasticOutput = run({ 'What a pill!': 1 });
    expect(runSarcasticOutput.happy).toBeLessThan(0.5);
    expect(runSarcasticOutput.sarcastic).toBeGreaterThan(0.5);
    expect(runSarcasticOutput.sad).toBeLessThan(0.5);
    expect(runSarcasticOutput.excited).toBeLessThan(0.5);

    const runSadOutput = run({ 'I am super unhappy!': 1 });
    expect(runSadOutput.happy).toBeLessThan(0.5);
    expect(runSadOutput.sarcastic).toBeLessThan(0.5);
    expect(runSadOutput.sad).toBeGreaterThan(0.5);
    expect(runSadOutput.excited).toBeLessThan(0.5);

    const runExcitedOutput = run({ 'Are we there yet?': 1 });
    expect(runExcitedOutput.happy).toBeLessThan(0.5);
    expect(runExcitedOutput.sarcastic).toBeLessThan(0.5);
    expect(runExcitedOutput.sad).toBeLessThan(0.5);
    expect(runExcitedOutput.excited).toBeGreaterThan(0.5);
  });
});
