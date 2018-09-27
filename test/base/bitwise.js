import assert from 'assert';
import brain from '../../src';

let wiggle = 0.1;

function isAround(actual, expected) {
  if (actual > (expected + wiggle)) return false;
  if (actual < (expected - wiggle)) return false;
  return true;
}

function testBitwise(data, op) {
  let net = new brain.NeuralNetwork();
  let res = net.train(data, { errorThresh: 0.003 });

  data.forEach(d => {
    var actual = net.run(d.input);
    var expected = d.output;
    assert.ok(isAround(actual[0], expected[0]), `failed to train "${op}" - expected: ${expected}, actual: ${actual}`);
  });
}

function testBitwiseAdam(data, op) {
  let net = new brain.NeuralNetwork();
  let res = net.train(data, { errorThresh: 0.003, learningRate: 0.05, praxis: 'adam' });

  data.forEach(d => {
    var actual = net.run(d.input);
    var expected = d.output;
    assert.ok(isAround(actual[0], expected[0]), `failed to train "${op}" - expected: ${expected}, actual: ${actual}`);
  });
}

function testBitwiseAsync(data, op, done) {
  let net = new brain.NeuralNetwork();
  net
    .trainAsync(data, { errorThresh: 0.003 })
    .then(res => {
      data.forEach(d => {
        var actual = net.run(d.input)
        var expected = d.output;
        assert.ok(isAround(actual, expected), `failed to train "${op}" - expected: ${expected}, actual: ${actual}`);
      });
      done();
    })
    .catch(err => {
      assert.ok(false, err.toString())
    });
}

describe('bitwise functions sync training', () => {
  it('NOT function', () => {
    let not = [{input: [0], output: [1]},
               {input: [1], output: [0]}];
    testBitwise(not, 'not');
  });

  it('XOR function', () => {
    let xor = [{input: [0.001, 0.001], output: [0.001]},
               {input: [0.001, 1], output: [1]},
               {input: [1, 0.001], output: [1]},
               {input: [1, 1], output: [0.001]}];
    testBitwise(xor, 'xor');
  });

  it('OR function', () => {
    let or = [{input: [0, 0], output: [0]},
              {input: [0, 1], output: [1]},
              {input: [1, 0], output: [1]},
              {input: [1, 1], output: [1]}];
    testBitwise(or, 'or');
  });

  it('AND function', () => {
    let and = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [0]},
               {input: [1, 0], output: [0]},
               {input: [1, 1], output: [1]}];
    testBitwise(and, 'and');
  });
});

describe('bitwise using adam praxis functions sync training', () => {
  it('NOT function', () => {
    let not = [{input: [0], output: [1]},
      {input: [1], output: [0]}];
    testBitwiseAdam(not, 'not');
  });

  it('XOR function', () => {
    let xor = [{input: [0.001, 0.001], output: [0.001]},
      {input: [0.001, 1], output: [1]},
      {input: [1, 0.001], output: [1]},
      {input: [1, 1], output: [0.001]}];
    testBitwiseAdam(xor, 'xor');
  });

  it('OR function', () => {
    let or = [{input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [1]}];
    testBitwiseAdam(or, 'or');
  });

  it('AND function', () => {
    let and = [{input: [0, 0], output: [0]},
      {input: [0, 1], output: [0]},
      {input: [1, 0], output: [0]},
      {input: [1, 1], output: [1]}];
    testBitwiseAdam(and, 'and');
  });
});