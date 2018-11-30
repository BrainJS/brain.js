import assert from 'assert';
import NeuralNetwork from '../../src/neural-network';

describe('test()', () => {
  describe('using binary data', () => {
    const trainingData = [
      {input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [0]}
    ];
    const net = new NeuralNetwork();
    net.train(trainingData);
    it('can test XOR data', () => {
      const test1 = net.test(trainingData[0]);
      assert.equal(Object.keys(test1).length, 10);
      assert.ok(test1.error < 0.05);
      assert.equal(test1.misclasses.length, 0);
      assert.equal(test1.trueNeg, 1);
      assert.equal(test1.truePos, 0);
      assert.equal(test1.falseNeg, 0);
      assert.equal(test1.falsePos, 0);
      assert.equal(test1.total, 1);
      assert.equal(test1.precision, 0);
      assert.equal(test1.recall, 0);
      assert.equal(test1.accuracy, 1);

      const test2 = net.test(trainingData[1]);
      assert.equal(Object.keys(test2).length, 10);
      assert.ok(test2.error < 0.05);
      assert.equal(test2.misclasses.length, 0);
      assert.equal(test2.trueNeg, 0);
      assert.equal(test2.truePos, 1);
      assert.equal(test2.falseNeg, 0);
      assert.equal(test2.falsePos, 0);
      assert.equal(test2.total, 1);
      assert.equal(test2.precision, 1);
      assert.equal(test2.recall, 1);
      assert.equal(test2.accuracy, 1);

      const test3 = net.test(trainingData[2]);
      assert.equal(Object.keys(test3).length, 10);
      assert.ok(test3.error < 0.05);
      assert.equal(test3.misclasses.length, 0);
      assert.equal(test3.trueNeg, 0);
      assert.equal(test3.truePos, 1);
      assert.equal(test3.falseNeg, 0);
      assert.equal(test3.falsePos, 0);
      assert.equal(test3.total, 1);
      assert.equal(test3.precision, 1);
      assert.equal(test3.recall, 1);
      assert.equal(test3.accuracy, 1);

      const test4 = net.test(trainingData[3]);
      assert.equal(Object.keys(test4).length, 10);
      assert.ok(test4.error < 0.05);
      assert.equal(test4.misclasses.length, 0);
      assert.equal(test4.trueNeg, 1);
      assert.equal(test4.truePos, 0);
      assert.equal(test4.falseNeg, 0);
      assert.equal(test4.falsePos, 0);
      assert.equal(test4.total, 1);
      assert.equal(test4.precision, 0);
      assert.equal(test4.recall, 0);
      assert.equal(test4.accuracy, 1);
    });
  });
  describe('using simple math float data', () => {
    const trainingData = [
      {input: { one: 1, two: 1 }, output: { three: 1 } },
      {input: { one: 1, three: 1 }, output: { four: 1 } },
      {input: { two: 1, three: 1 }, output: { five: 1 } },
      {input: { two: 1, four: 1 }, output: { six: 1 } }
    ];
    const net = new NeuralNetwork();
    net.train(trainingData);
    it('can test simple math data', () => {
      const test1 = net.test(trainingData[0]);
      assert.equal(Object.keys(test1).length, 3);
      assert.equal(test1.total, 1);
      assert.ok(test1.error < 0.05);
      assert.equal(test1.misclasses.length, 0);

      const test2 = net.test(trainingData[1]);
      assert.equal(Object.keys(test2).length, 3);
      assert.equal(test2.total, 1);
      assert.ok(test2.error < 0.05);
      assert.equal(test2.misclasses.length, 0);

      const test3 = net.test(trainingData[2]);
      assert.equal(Object.keys(test3).length, 3);
      assert.equal(test3.total, 1);
      assert.ok(test3.error < 0.05);
      assert.equal(test3.misclasses.length, 0);

      const test4 = net.test(trainingData[3]);
      assert.equal(Object.keys(test4).length, 3);
      assert.equal(test4.total, 1);
      assert.ok(test4.error < 0.05);
      assert.equal(test4.misclasses.length, 0);
    });
  });
});
