import { NeuralNetwork } from '../../src/neural-network';
import { INeuralNetworkBinaryTestResult } from '../../src/neural-network-types';

describe('NeuralNetwork.test()', () => {
  describe('using binary data', () => {
    const trainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ];
    const net = new NeuralNetwork();
    net.train(trainingData);
    it('can test XOR data', () => {
      const test1 = net.test([trainingData[0]]) as INeuralNetworkBinaryTestResult;
      expect(test1.error < 0.05).toBeTruthy();
      expect(test1.misclasses.length).toBe(0);
      expect(test1.trueNeg).toBe(1);
      expect(test1.truePos).toBe(0);
      expect(test1.falseNeg).toBe(0);
      expect(test1.falsePos).toBe(0);
      expect(test1.total).toBe(1);
      expect(test1.precision).toBe(0);
      expect(test1.recall).toBe(0);
      expect(test1.accuracy).toBe(1);

      const test2 = net.test([trainingData[1]]) as INeuralNetworkBinaryTestResult;
      expect(Object.keys(test2).length).toBe(10);
      expect(test2.error < 0.05).toBeTruthy();
      expect(test2.misclasses.length).toBe(0);
      expect(test2.trueNeg).toBe(0);
      expect(test2.truePos).toBe(1);
      expect(test2.falseNeg).toBe(0);
      expect(test2.falsePos).toBe(0);
      expect(test2.total).toBe(1);
      expect(test2.precision).toBe(1);
      expect(test2.recall).toBe(1);
      expect(test2.accuracy).toBe(1);

      const test3 = net.test([trainingData[2]]) as INeuralNetworkBinaryTestResult;
      expect(Object.keys(test3).length).toBe(10);
      expect(test3.error < 0.05).toBeTruthy();
      expect(test3.misclasses.length).toBe(0);
      expect(test3.trueNeg).toBe(0);
      expect(test3.truePos).toBe(1);
      expect(test3.falseNeg).toBe(0);
      expect(test3.falsePos).toBe(0);
      expect(test3.total).toBe(1);
      expect(test3.precision).toBe(1);
      expect(test3.recall).toBe(1);
      expect(test3.accuracy).toBe(1);

      const test4 = net.test([trainingData[3]]) as INeuralNetworkBinaryTestResult;
      expect(Object.keys(test4).length).toBe(10);
      expect(test4.error < 0.05).toBeTruthy();
      expect(test4.misclasses.length).toBe(0);
      expect(test4.trueNeg).toBe(1);
      expect(test4.truePos).toBe(0);
      expect(test4.falseNeg).toBe(0);
      expect(test4.falsePos).toBe(0);
      expect(test4.total).toBe(1);
      expect(test4.precision).toBe(0);
      expect(test4.recall).toBe(0);
      expect(test4.accuracy).toBe(1);
    });
  });
  describe('using simple math float data', () => {
    const trainingData = [
      { input: { one: 1, two: 1, three: 0, four: 0 }, output: { three: 1, four: 0, five: 0, six: 0 } },
      { input: { one: 1, two: 0, three: 1, four: 0, }, output: { three: 0, four: 1, five: 0, six: 0 } },
      { input: { one: 0, two: 1, three: 1, four: 0, }, output: { three: 0, four: 0, five: 1, six: 0 } },
      { input: { one: 0, two: 1, three: 0, four: 1 }, output: { three: 0, four: 0, five: 0, six: 1 } },
    ];
    const net = new NeuralNetwork();
    net.train(trainingData);
    it('can test simple math data', () => {
      const test1 = net.test([trainingData[0]]);
      expect(Object.keys(test1).length).toBe(3);
      expect(test1.total).toBe(1);
      expect(test1.error < 0.05).toBeTruthy();
      expect(test1.misclasses.length).toBe(0);

      const test2 = net.test([trainingData[1]]);
      expect(Object.keys(test2).length).toBe(3);
      expect(test2.total).toBe(1);
      expect(test2.error < 0.05).toBeTruthy();
      expect(test2.misclasses.length).toBe(0);

      const test3 = net.test([trainingData[2]]);
      expect(Object.keys(test3).length).toBe(3);
      expect(test3.total).toBe(1);
      expect(test3.error < 0.05).toBeTruthy();
      expect(test3.misclasses.length).toBe(0);

      const test4 = net.test([trainingData[3]]);
      expect(Object.keys(test4).length).toBe(3);
      expect(test4.total).toBe(1);
      expect(test4.error < 0.05).toBeTruthy();
      expect(test4.misclasses.length).toBe(0);
    });
  });
});
