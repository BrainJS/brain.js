import Matrix from './matrix';
import GRU from './gru';
import RNNTimeStep from './rnn-time-step';

export default class GRUTimeStep extends RNNTimeStep {
  getModel(hiddenSize, prevSize) {
    return GRU.prototype.getModel(hiddenSize, prevSize);
  }

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Matrix} previousResult
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
    return GRU.prototype.getEquation(equation, inputMatrix, previousResult, hiddenLayer);
  }
}
