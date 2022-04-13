import { NeuralNetworkGPU } from './neural-network-gpu';
import { xorTrainingData } from './test-utils';

describe('NeuralNetworkGPU Class: End to End', () => {
  it('can learn xor', () => {
    const net = new NeuralNetworkGPU();
    const status = net.train(xorTrainingData, {
      iterations: 5000,
      errorThresh: 0.01,
    });
    expect(status.error).toBeLessThanOrEqual(0.01);
    expect(status.iterations).toBeLessThanOrEqual(5000);
  });
});
