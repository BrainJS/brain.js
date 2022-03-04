import { LSTMTimeStep } from './lstm-time-step';

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

    console.log(net.run([[0.001], [0.001]])[0]);
    console.log(net.run([[0.001], [1]])[0]);
    console.log(net.run([[1], [0.001]])[0]);
    console.log(net.run([[1], [1]])[0]);

    expect(net.run([[0.001], [0.001]])[0]).toBeLessThan(0.1);
    expect(net.run([[0.001], [1]])[0]).toBeGreaterThan(0.9);
    expect(net.run([[1], [0.001]])[0]).toBeGreaterThan(0.9);
    expect(net.run([[1], [1]])[0]).toBeLessThan(0.1);
  });
});
