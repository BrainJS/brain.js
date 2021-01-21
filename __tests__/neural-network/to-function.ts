import { NeuralNetwork } from '../../src/neural-network';

const xorTrainingData = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
];

describe('.toFunction()', () => {
  describe('sigmoid activation', () => {
    it('runs same as original network', () => {
      const originalNet = new NeuralNetwork();
      originalNet.train(xorTrainingData);
      const xor = originalNet.toFunction();
      expect(xor([0, 0])[0]).toBeCloseTo(originalNet.run([0, 0])[0]);
      expect(xor([0, 1])[0]).toBeCloseTo(originalNet.run([0, 1])[0]);
      expect(xor([1, 0])[0]).toBeCloseTo(originalNet.run([1, 0])[0]);
      expect(xor([1, 1])[0]).toBeCloseTo(originalNet.run([1, 1])[0]);
    });
  });
  describe('relu activation', () => {
    it('runs same as original network', () => {
      const originalNet = new NeuralNetwork({ activation: 'relu' });
      originalNet.train(xorTrainingData);
      const xor = originalNet.toFunction();
      expect(xor([0, 0])[0]).toBeCloseTo(originalNet.run([0, 0])[0]);
      expect(xor([0, 1])[0]).toBeCloseTo(originalNet.run([0, 1])[0]);
      expect(xor([1, 0])[0]).toBeCloseTo(originalNet.run([1, 0])[0]);
      expect(xor([1, 1])[0]).toBeCloseTo(originalNet.run([1, 1])[0]);
    });
  });
  describe('leaky-relu activation', () => {
    it('runs same as original network', () => {
      const originalNet = new NeuralNetwork({ activation: 'leaky-relu' });
      originalNet.train(xorTrainingData);
      const xor = originalNet.toFunction();
      expect(xor([0, 0])[0]).toBeCloseTo(originalNet.run([0, 0])[0]);
      expect(xor([0, 1])[0]).toBeCloseTo(originalNet.run([0, 1])[0]);
      expect(xor([1, 0])[0]).toBeCloseTo(originalNet.run([1, 0])[0]);
      expect(xor([1, 1])[0]).toBeCloseTo(originalNet.run([1, 1])[0]);
    });
  });
  describe('tanh activation', () => {
    it('runs same as original network', () => {
      const originalNet = new NeuralNetwork({ activation: 'tanh' });
      originalNet.train(xorTrainingData);
      const xor = originalNet.toFunction();
      expect(xor([0, 0])[0]).toBeCloseTo(originalNet.run([0, 0])[0]);
      expect(xor([0, 1])[0]).toBeCloseTo(originalNet.run([0, 1])[0]);
      expect(xor([1, 0])[0]).toBeCloseTo(originalNet.run([1, 0])[0]);
      expect(xor([1, 1])[0]).toBeCloseTo(originalNet.run([1, 1])[0]);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    net.train(trainingData, {
      iterations: 1000,
      errorThresh: 0.01,
    });

    const happyOutput = net.run({ 'I am super happy!': 1 }) as {
      [value: string]: number;
    };
    expect(happyOutput.happy).toBeGreaterThan(0.5);
    expect(happyOutput.sarcastic).toBeLessThan(0.5);
    expect(happyOutput.sad).toBeLessThan(0.5);
    expect(happyOutput.excited).toBeLessThan(0.5);

    const sarcasticOutput = net.run({ 'What a pill!': 1 }) as {
      [value: string]: number;
    };
    expect(sarcasticOutput.happy).toBeLessThan(0.5);
    expect(sarcasticOutput.sarcastic).toBeGreaterThan(0.5);
    expect(sarcasticOutput.sad).toBeLessThan(0.5);
    expect(sarcasticOutput.excited).toBeLessThan(0.5);

    const sadOutput = net.run({ 'I am super unhappy!': 1 }) as {
      [value: string]: number;
    };
    expect(sadOutput.happy).toBeLessThan(0.5);
    expect(sadOutput.sarcastic).toBeLessThan(0.5);
    expect(sadOutput.sad).toBeGreaterThan(0.5);
    expect(sadOutput.excited).toBeLessThan(0.5);

    const excitedOutput = net.run({ 'Are we there yet?': 1 }) as {
      [value: string]: number;
    };
    expect(excitedOutput.happy).toBeLessThan(0.5);
    expect(excitedOutput.sarcastic).toBeLessThan(0.5);
    expect(excitedOutput.sad).toBeLessThan(0.5);
    expect(excitedOutput.excited).toBeGreaterThan(0.5);

    const run = net.toFunction();

    const runHappyOutput = run({ 'I am super happy!': 1 }) as {
      [value: string]: number;
    };
    expect(runHappyOutput.happy).toBeCloseTo(happyOutput.happy);
    expect(runHappyOutput.sarcastic).toBeCloseTo(happyOutput.sarcastic);
    expect(runHappyOutput.sad).toBeCloseTo(happyOutput.sad);
    expect(runHappyOutput.excited).toBeCloseTo(happyOutput.excited);

    const runSarcasticOutput = run({ 'What a pill!': 1 }) as {
      [value: string]: number;
    };
    expect(runSarcasticOutput.happy).toBeCloseTo(sarcasticOutput.happy);
    expect(runSarcasticOutput.sarcastic).toBeCloseTo(sarcasticOutput.sarcastic);
    expect(runSarcasticOutput.sad).toBeCloseTo(sarcasticOutput.sad);
    expect(runSarcasticOutput.excited).toBeCloseTo(sarcasticOutput.excited);

    const runSadOutput = run({ 'I am super unhappy!': 1 }) as {
      [value: string]: number;
    };
    expect(runSadOutput.happy).toBeCloseTo(sadOutput.happy);
    expect(runSadOutput.sarcastic).toBeCloseTo(sadOutput.sarcastic);
    expect(runSadOutput.sad).toBeCloseTo(sadOutput.sad);
    expect(runSadOutput.excited).toBeCloseTo(sadOutput.excited);

    const runExcitedOutput = run({ 'Are we there yet?': 1 }) as {
      [value: string]: number;
    };
    expect(runExcitedOutput.happy).toBeCloseTo(excitedOutput.happy);
    expect(runExcitedOutput.sarcastic).toBeCloseTo(excitedOutput.sarcastic);
    expect(runExcitedOutput.sad).toBeCloseTo(excitedOutput.sad);
    expect(runExcitedOutput.excited).toBeCloseTo(excitedOutput.excited);
  });
});
