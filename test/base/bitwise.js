import assert from 'assert';
import brain from '../../src';

let wiggle = 0.1;

function testBitwise(data, op) {
  let net = new brain.NeuralNetwork();
  let res = net.train (data, { errorThresh: 0.003 });

  data.forEach(d => {
    var actual = net.run(d.input)
    var expected = d.output;
    assert.ok(actual < (expected + wiggle) && actual < (expected + wiggle), `failed to train "${op}" - expected: ${expected}, actual: ${actual}`);
  });
}

function testBitwiseAsync (data, op) {
  let net = new brain.NeuralNetwork();
  net.trainAsync (data, { errorThresh: 0.003 }, res => {
    data.forEach(d => {
      var actual = net.run(d.input)
      var expected = d.output;
      assert.ok(actual < (expected + wiggle) && actual < (expected + wiggle), `failed to train "${op}" - expected: ${expected}, actual: ${actual}`);
    });
  });
}

describe('bitwise functions sync training', function () {
  it('NOT function', function () {
    let not = [{input: [0], output: [1]},
               {input: [1], output: [0]}];
    testBitwise (not, 'not');
  });

  it('XOR function', function () {
    let xor = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [1]},
               {input: [1, 0], output: [1]},
               {input: [1, 1], output: [0]}];
    testBitwise (xor, 'xor');
  });

  it('OR function', function () {
    let or = [{input: [0, 0], output: [0]},
              {input: [0, 1], output: [1]},
              {input: [1, 0], output: [1]},
              {input: [1, 1], output: [1]}];
    testBitwise (or, 'or');
  });

  it('AND function', function () {
    let and = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [0]},
               {input: [1, 0], output: [0]},
               {input: [1, 1], output: [1]}];
    testBitwise (and, 'and');
  });
});

describe('bitwise functions async training', function () {

  it('NOT function', function () {
    let not = [{input: [0], output: [1]},
               {input: [1], output: [0]}];
    testBitwiseAsync (not, 'not');
  });

  it('XOR function', function () {
    let xor = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [1]},
               {input: [1, 0], output: [1]},
               {input: [1, 1], output: [0]}];
    testBitwiseAsync (xor, 'xor');
  });

  it('OR function', function () {
    let or = [{input: [0, 0], output: [0]},
              {input: [0, 1], output: [1]},
              {input: [1, 0], output: [1]},
              {input: [1, 1], output: [1]}];
    testBitwiseAsync (or, 'or');
  });

  it('AND function', function () {
    let and = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [0]},
               {input: [1, 0], output: [0]},
               {input: [1, 1], output: [1]}];
    testBitwiseAsync (and, 'and');
  });
});

