import { LSTMTimeStep } from './lstm-time-step';
jest.retryTimes(5);
describe('LSTMTimeStep', () => {
  it('can learn xor', () => {
    const net = new LSTMTimeStep({
      inputSize: 1,
      hiddenLayers: [10],
      outputSize: 1,
    });
    const xorNetValues = [
      [[0.001], [0.001], [0.001]],
      [[0.001], [1], [1]],
      [[1], [0.001], [1]],
      [[1], [1], [0.001]],
    ];
    const errorThresh = 0.03;
    const iterations = 5000;
    const status = net.train(xorNetValues, { iterations, errorThresh });
    expect(
      status.error <= errorThresh || status.iterations <= iterations
    ).toBeTruthy();
    expect(net.run([[0.001], [0.001]])[0]).toBeLessThan(0.1);
    expect(net.run([[0.001], [1]])[0]).toBeGreaterThan(0.9);
    expect(net.run([[1], [0.001]])[0]).toBeGreaterThan(0.9);
    expect(net.run([[1], [1]])[0]).toBeLessThan(0.1);
  });

  it('can learn a simple pattern', () => {
    const net = new LSTMTimeStep({
      inputSize: 2,
      hiddenLayers: [4, 2],
      outputSize: 1,
    });
    const trainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ];
    const errorThresh = 0.005;
    const iterations = 100;
    const status = net.train(trainingData, { iterations, errorThresh });
    expect(
      status.error <= errorThresh || status.iterations <= iterations
    ).toBeTruthy();
    expect(net.run([0, 0])[0]).toBeCloseTo(0, 1);
    expect(net.run([0, 1])[0]).toBeCloseTo(1, 1);
    expect(net.run([1, 0])[0]).toBeCloseTo(1, 1);
    expect(net.run([1, 1])[0]).toBeCloseTo(0, 1);
  });
});
