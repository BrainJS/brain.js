import { RNNTimeStep } from '../../src/recurrent/rnn-time-step';
import { LSTMTimeStep } from '../../src/recurrent/lstm-time-step';

describe('LSTMTimeStep', () => {
  describe('.getHiddenLayer()', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof LSTMTimeStep.prototype.getHiddenLayer).toEqual('function');
      expect(LSTMTimeStep.prototype.getHiddenLayer).not.toEqual(
        RNNTimeStep.prototype.getHiddenLayer
      );
    });
  });
  describe('.getEquation()', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof LSTMTimeStep.prototype.getEquation).toEqual('function');
      expect(LSTMTimeStep.prototype.getEquation).not.toEqual(
        RNNTimeStep.prototype.getEquation
      );
    });
  });
});
