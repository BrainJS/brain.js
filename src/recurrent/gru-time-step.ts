import { GRU, GRUModel } from './gru';
import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import RNNTimeStep from './rnn-time-step';

export class GRUTimeStep extends RNNTimeStep {
  static getModel(hiddenSize: number, prevSize: number): GRUModel {
    return GRU.getModel(hiddenSize, prevSize);
  }

  static getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: GRUModel
  ): Matrix {
    return GRU.getEquation(equation, inputMatrix, previousResult, hiddenLayer);
  }
}
