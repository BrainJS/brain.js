const NeuralNetwork = require('../../src/neural-network');

const wiggle = 0.1;

function isAround(actual, expected) {
  if (actual > expected + wiggle) {
    return false;
  }
  if (actual < expected - wiggle) {
    return false;
  }
  return true;
}

function testBitwise(data) {
  const net = new NeuralNetwork();
  // const res = net.train(data, { errorThresh: 0.003 });

  data.forEach((d) => {
    const actual = net.run(d.input);
    const expected = d.output;
    expect(isAround(actual[0], expected[0])).toBe(true);
  });
}

function testBitwiseAdam(data) {
  const net = new NeuralNetwork();
  // const res = net.train(data, {
  //   errorThresh: 0.003,
  //   learningRate: 0.05,
  //   praxis: 'adam',
  // });

  data.forEach((d) => {
    const actual = net.run(d.input);
    const expected = d.output;
    expect(isAround(actual[0], expected[0])).toBe(true);
  });
}

// function testBitwiseAsync(data, op, done, fail) {
//   const net = new NeuralNetwork();
//   net
//     .trainAsync(data, { errorThresh: 0.003 })
//     .then((res) => {
//       data.forEach((d) => {
//         const actual = net.run(d.input);
//         const expected = d.output;
//         expect(isAround(actual, expected)).toBe(true);
//       });
//       done();
//     })
//     .catch((err) => {
//       fail(err);
//     });
// }

describe('bitwise functions sync training', () => {
  it('NOT function', () => {
    const not = [
      { input: [0], output: [1] },
      { input: [1], output: [0] },
    ];
    testBitwise(not, 'not');
  });

  it('XOR function', () => {
    const xor = [
      { input: [0.001, 0.001], output: [0.001] },
      { input: [0.001, 1], output: [1] },
      { input: [1, 0.001], output: [1] },
      { input: [1, 1], output: [0.001] },
    ];
    testBitwise(xor, 'xor');
  });

  it('OR function', () => {
    const or = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] },
    ];
    testBitwise(or, 'or');
  });

  it('AND function', () => {
    const and = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [0] },
      { input: [1, 1], output: [1] },
    ];
    testBitwise(and, 'and');
  });
});

describe('bitwise using adam praxis functions sync training', () => {
  it('NOT function', () => {
    const not = [
      { input: [0], output: [1] },
      { input: [1], output: [0] },
    ];
    testBitwiseAdam(not, 'not');
  });

  it('XOR function', () => {
    const xor = [
      { input: [0.001, 0.001], output: [0.001] },
      { input: [0.001, 1], output: [1] },
      { input: [1, 0.001], output: [1] },
      { input: [1, 1], output: [0.001] },
    ];
    testBitwiseAdam(xor, 'xor');
  });

  it('OR function', () => {
    const or = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] },
    ];
    testBitwiseAdam(or, 'or');
  });

  it('AND function', () => {
    const and = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [0] },
      { input: [1, 1], output: [1] },
    ];
    testBitwiseAdam(and, 'and');
  });
});
