import assert from 'assert';
import brain from '../../src';

let wiggle = 0.1;

function testBitwise(data, op) {
  let net = new brain.NeuralNetwork();
  console.log(data);
  net.train(data, { errorThresh: 0.003 });

  for (let i in data) {
    let output = net.run(data[i].input);
    console.log('output', output);
    let target = data[i].output;
    assert.ok(output < (target + wiggle) && output > (target - wiggle), 'failed to train ' + op + ' - output: ' + output + ' target: ' + target);
  }
}

describe('bitwise functions', () => {

  it('NOT function', () => {
    let not = [{input: [0], output: [1]},
               {input: [1], output: [0]}];
    testBitwise(not, 'not');
  });

  it('XOR function', () => {
    let xor = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [1]},
               {input: [1, 0], output: [1]},
               {input: [1, 1], output: [0]}];
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
