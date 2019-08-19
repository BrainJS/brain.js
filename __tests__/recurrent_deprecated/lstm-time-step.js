const RNNTimeStep = require('../../src/recurrent/rnn-time-step');
const LSTMTimeStep = require('../../src/recurrent/lstm-time-step');

describe('LSTMTimeStep', () => {
  describe('getModel', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof LSTMTimeStep.getModel).toEqual('function');
      expect(LSTMTimeStep.getModel).not.toEqual(RNNTimeStep.getModel);
    });
  });
  describe('getEquation', () => {
    test('overrides RNNTimeStep', () => {
      expect(typeof LSTMTimeStep.getEquation).toEqual('function');
      expect(LSTMTimeStep.getEquation).not.toEqual(RNNTimeStep.getEquation);
    });
  });
});
