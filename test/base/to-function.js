import assert from 'assert';
import NeuralNetwork from '../../src/neural-network';

describe('.toFunction()', () => {
  describe('sigmoid activation', () => {
    const originalNet = new NeuralNetwork();
    const xorTrainingData = [
      {input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [0]}];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction();
    it('runs same as original network', () => {
      assert.deepEqual(xor([0, 0])[0].toFixed(6), originalNet.run([0, 0])[0].toFixed(6));
      assert.deepEqual(xor([0, 1])[0].toFixed(6), originalNet.run([0, 1])[0].toFixed(6));
      assert.deepEqual(xor([1, 0])[0].toFixed(6), originalNet.run([1, 0])[0].toFixed(6));
      assert.deepEqual(xor([1, 1])[0].toFixed(6), originalNet.run([1, 1])[0].toFixed(6));
    });
  });
  describe('relu activation', () => {
    const originalNet = new NeuralNetwork({ activation: 'relu' });
    const xorTrainingData = [
      {input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [0]}];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction();
    it('runs same as original network', () => {
      assert.deepEqual(xor([0, 0])[0].toFixed(6), originalNet.run([0, 0])[0].toFixed(6));
      assert.deepEqual(xor([0, 1])[0].toFixed(6), originalNet.run([0, 1])[0].toFixed(6));
      assert.deepEqual(xor([1, 0])[0].toFixed(6), originalNet.run([1, 0])[0].toFixed(6));
      assert.deepEqual(xor([1, 1])[0].toFixed(6), originalNet.run([1, 1])[0].toFixed(6));
    });
  });
  describe('leaky-relu activation', () => {
    const originalNet = new NeuralNetwork({ activation: 'leaky-relu' });
    const xorTrainingData = [
      {input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [0]}];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction();
    it('runs same as original network', () => {
      assert.deepEqual(xor([0, 0])[0].toFixed(6), originalNet.run([0, 0])[0].toFixed(6));
      assert.deepEqual(xor([0, 1])[0].toFixed(6), originalNet.run([0, 1])[0].toFixed(6));
      assert.deepEqual(xor([1, 0])[0].toFixed(6), originalNet.run([1, 0])[0].toFixed(6));
      assert.deepEqual(xor([1, 1])[0].toFixed(6), originalNet.run([1, 1])[0].toFixed(6));
    });
  });
  describe('tanh activation', () => {
    const originalNet = new NeuralNetwork({ activation: 'tanh' });
    const xorTrainingData = [
      {input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [0]}];
    originalNet.train(xorTrainingData);
    const xor = originalNet.toFunction();
    it('runs same as original network', () => {
      assert.deepEqual(xor([0, 0])[0].toFixed(6), originalNet.run([0, 0])[0].toFixed(6));
      assert.deepEqual(xor([0, 1])[0].toFixed(6), originalNet.run([0, 1])[0].toFixed(6));
      assert.deepEqual(xor([1, 0])[0].toFixed(6), originalNet.run([1, 0])[0].toFixed(6));
      assert.deepEqual(xor([1, 1])[0].toFixed(6), originalNet.run([1, 1])[0].toFixed(6));
    });
  });
});