import { RNNTimeStep } from '../../src/recurrent/rnn-time-step';
import { GRUTimeStep } from '../../src/recurrent/gru-time-step';

describe('GRUTimeStep', () => {
  describe('.getHiddenLayer()', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof GRUTimeStep.prototype.getHiddenLayer).toEqual('function');
      expect(GRUTimeStep.prototype.getHiddenLayer).not.toEqual(
        RNNTimeStep.prototype.getHiddenLayer
      );
    });
  });
  describe('.getEquation()', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof GRUTimeStep.prototype.getEquation).toEqual('function');
      expect(GRUTimeStep.prototype.getEquation).not.toEqual(
        RNNTimeStep.prototype.getEquation
      );
    });
  });
});
