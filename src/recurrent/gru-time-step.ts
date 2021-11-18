import { getGRUHiddenLayer, getGRUEquation, IGRUHiddenLayer } from './gru';
import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RNNTimeStep } from './rnn-time-step';
import { IRNNHiddenLayer } from './rnn';

export class GRUTimeStep extends RNNTimeStep {
  getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer {
    return getGRUHiddenLayer(hiddenSize, prevSize);
  }

  getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: IRNNHiddenLayer
  ): Matrix {
    return getGRUEquation(
      equation,
      inputMatrix,
      previousResult,
      hiddenLayer as IGRUHiddenLayer
    );
  }
}
