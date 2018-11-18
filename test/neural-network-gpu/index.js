import assert from 'assert';
import NeuralNetworkGPU from '../../src/neural-network-gpu';

describe('NeuralNetworkGPU', () => {
  const xorTrainingData = [
    { input: [0, 1], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] },
    { input: [1, 0], output: [1] }];

  it('can learn xor', () => {
    const net = new NeuralNetworkGPU();
    const status = net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
    assert(status.error < 0.01);
    assert(status.iterations < 5000);
  });

  it('can serialize & deserialize JSON', () => {
    const net = new NeuralNetworkGPU();
    net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
    const target = xorTrainingData.map(datum => net.run(datum.input));
    const json = net.toJSON();
    const net2 = new NeuralNetworkGPU();
    net2.fromJSON(json);
    const output = xorTrainingData.map(datum => net2.run(datum.input));
    assert.deepEqual(output, target);
  });
});