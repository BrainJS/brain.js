import { NeuralNetwork } from './neural-network';
import { INumberHash } from './lookup';

const xorTrainingData = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
];

describe('.toFunction()', () => {
  it.each(['sigmoid', 'relu', 'relu', 'leaky-relu'])(
    'having %p activation, runs same as original network',
    (activation) => {
      const originalNet = new NeuralNetwork<number[], number[]>({
        activation,
      });
      originalNet.train(xorTrainingData);
      const xor = originalNet.toFunction();
      expect(xor([0, 0])[0]).toBeCloseTo(originalNet.run([0, 0])[0]);
      expect(xor([0, 1])[0]).toBeCloseTo(originalNet.run([0, 1])[0]);
      expect(xor([1, 0])[0]).toBeCloseTo(originalNet.run([1, 0])[0]);
      expect(xor([1, 1])[0]).toBeCloseTo(originalNet.run([1, 1])[0]);
    }
  );

  it('can work with partial input objects', () => {
    const trainingData = [
      { input: { 'I am super happy!': 1 }, output: { happy: 1 } },
      { input: { 'What a pill!': 1 }, output: { sarcastic: 1 } },
      { input: { 'I am super unhappy!': 1 }, output: { sad: 1 } },
      { input: { 'Are we there yet?': 1 }, output: { excited: 1 } },
    ];
    interface IInput extends INumberHash {
      'I am super happy!': number;
      'What a pill!': number;
      'I am super unhappy!': number;
      'Are we there yet?': number;
    }
    interface IOutput extends INumberHash {
      happy: number;
      sarcastic: number;
      sad: number;
      excited: number;
    }
    const net = new NeuralNetwork<IInput, IOutput>({
      hiddenLayers: [3],
    });
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

    const run = net.toFunction();

    const runHappyOutput = run({ 'I am super happy!': 1 });
    expect(runHappyOutput.happy).toBeCloseTo(happyOutput.happy);
    expect(runHappyOutput.sarcastic).toBeCloseTo(happyOutput.sarcastic);
    expect(runHappyOutput.sad).toBeCloseTo(happyOutput.sad);
    expect(runHappyOutput.excited).toBeCloseTo(happyOutput.excited);

    const runSarcasticOutput = run({ 'What a pill!': 1 });
    expect(runSarcasticOutput.happy).toBeCloseTo(sarcasticOutput.happy);
    expect(runSarcasticOutput.sarcastic).toBeCloseTo(sarcasticOutput.sarcastic);
    expect(runSarcasticOutput.sad).toBeCloseTo(sarcasticOutput.sad);
    expect(runSarcasticOutput.excited).toBeCloseTo(sarcasticOutput.excited);

    const runSadOutput = run({ 'I am super unhappy!': 1 });
    expect(runSadOutput.happy).toBeCloseTo(sadOutput.happy);
    expect(runSadOutput.sarcastic).toBeCloseTo(sadOutput.sarcastic);
    expect(runSadOutput.sad).toBeCloseTo(sadOutput.sad);
    expect(runSadOutput.excited).toBeCloseTo(sadOutput.excited);

    const runExcitedOutput = run({ 'Are we there yet?': 1 });
    expect(runExcitedOutput.happy).toBeCloseTo(excitedOutput.happy);
    expect(runExcitedOutput.sarcastic).toBeCloseTo(excitedOutput.sarcastic);
    expect(runExcitedOutput.sad).toBeCloseTo(excitedOutput.sad);
    expect(runExcitedOutput.excited).toBeCloseTo(excitedOutput.excited);
  });
});
