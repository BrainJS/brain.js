import { RNNTimeStep } from '../../src/recurrent/rnn-time-step';
import { GRUTimeStep } from '../../src/recurrent/gru-time-step';

describe('GRUTimeStep', () => {
  describe('getModel', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof GRUTimeStep.getModel).toEqual('function');
      expect(GRUTimeStep.getModel).not.toEqual(RNNTimeStep.getModel);
    });
  });
  describe('getEquation', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof GRUTimeStep.getEquation).toEqual('function');
      expect(GRUTimeStep.getEquation).not.toEqual(RNNTimeStep.getEquation);
    });
  });
});
