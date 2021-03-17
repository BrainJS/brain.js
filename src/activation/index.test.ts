import * as activation from '../activation';
import * as leakyRelu from '../activation/leaky-relu';
import * as relu from '../activation/relu';
import * as sigmoid from '../activation/sigmoid';
import * as tanh from '../activation/tanh';

describe('activation', () => {
  test('it has all expected activations', () => {
    expect(activation.leakyRelu).toBe(leakyRelu);
    expect(activation.relu).toBe(relu);
    expect(activation.sigmoid).toBe(sigmoid);
    expect(activation.tanh).toBe(tanh);
  });
});
