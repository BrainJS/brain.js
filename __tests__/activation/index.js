const activation = require('../../src/activation');
const leakyRelu = require('../../src/activation/leaky-relu');
const relu = require('../../src/activation/relu');
const sigmoid = require('../../src/activation/sigmoid');
const tanh = require('../../src/activation/tanh');

describe('activation', () => {
  test('it has all expected activations', () => {
    expect(activation.leakyRelu).toBe(leakyRelu);
    expect(activation.relu).toBe(relu);
    expect(activation.sigmoid).toBe(sigmoid);
    expect(activation.tanh).toBe(tanh);
  });
});
