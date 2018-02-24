import assert from 'assert';
import brain from '../../src';

describe('hash input and output', () => {
  it('runs correctly with array input and output', () => {
    let net = new brain.NeuralNetwork();

    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);

    let output = net.run([1, 0]);
    assert.ok(output[0] > 0.9, 'output: ' + output[0]);
  });

  it('runs correctly with hash input', () => {
    let net = new brain.NeuralNetwork();
    net.train([
      { input: { x: 0, y: 0 }, output: [0] },
      { input: { x: 0, y: 1 }, output: [1] },
      { input: { x: 1, y: 0 }, output: [1] },
      { input: { x: 1, y: 1 }, output: [0] }
    ]);

    let output = net.run({x: 1, y: 0});
    assert.ok(output[0] > 0.9, 'output: ' + output[0]);
  });

  it('runs correctly with hash output', () => {
    let net = new brain.NeuralNetwork();
    net.train([
      { input: [0, 0], output: { answer: 0 } },
      { input: [0, 1], output: { answer: 1 } },
      { input: [1, 0], output: { answer: 1 } },
      { input: [1, 1], output: { answer: 0 } }
    ]);

    let output = net.run([1, 0]);
    assert.ok(output.answer > 0.9, 'output: ' + output.answer);
  });

  it('runs correctly with hash input and output', () => {
    let net = new brain.NeuralNetwork();
    net.train([
      { input: { x: 0, y: 0 }, output: { answer: 0 } },
      { input: { x: 0, y: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 0 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: { answer: 0 } }
    ]);

    let output = net.run({x: 1, y: 0});
    assert.ok(output.answer > 0.9, 'output: ' + output.answer);
  });

  it('runs correctly with sparse hashes', () => {
    let net = new brain.NeuralNetwork();
    net.train([
      { input: {}, output: {} },
      { input: { y: 1 }, output: { answer: 1 } },
      { input: { x: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: {} }
    ]);

    let output = net.run({x: 1});
    assert.ok(output.answer > 0.9);
  });

  it('runs correctly with unseen input', () => {
    let net = new brain.NeuralNetwork();
    net.train([
      { input: {}, output: {} },
      { input: { y: 1 }, output: { answer: 1 } },
      { input: { x: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: {} }
    ]);

    let output = net.run({x: 1, z: 1});
    assert.ok(output.answer > 0.9);
  });
});