import * as activation from '../../src/activation';
import * as leakyRelu from '../../src/activation/leaky-relu';
import * as relu from '../../src/activation/relu';
import * as sigmoid from '../../src/activation/sigmoid';
import * as tanh from '../../src/activation/tanh';

describe('activation', () => {
  test('it has all expected activations', () => {
    expect(activation.leakyRelu).toBe(leakyRelu);
    expect(activation.relu).toBe(relu);
    expect(activation.sigmoid).toBe(sigmoid);
    expect(activation.tanh).toBe(tanh);
  });
});
