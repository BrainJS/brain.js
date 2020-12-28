import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RandomMatrix } from './matrix/random-matrix';
import { IRNNHiddenLayer, RNN } from './rnn';

export interface IGRUHiddenLayer extends IRNNHiddenLayer {
  updateGateInputMatrix: RandomMatrix;
  updateGateHiddenMatrix: RandomMatrix;
  updateGateBias: Matrix;
  resetGateInputMatrix: RandomMatrix;
  resetGateHiddenMatrix: RandomMatrix;
  resetGateBias: Matrix;
  cellWriteInputMatrix: RandomMatrix;
  cellWriteHiddenMatrix: RandomMatrix;
  cellWriteBias: Matrix;
}

export class GRU extends RNN {
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

export function getGRUHiddenLayer(
  hiddenSize: number,
  prevSize: number
): IGRUHiddenLayer {
  return {
    // update Gate
    // wzxh
    updateGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wzhh
    updateGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bz
    updateGateBias: new Matrix(hiddenSize, 1),
    // reset Gate
    // wrxh
    resetGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wrhh
    resetGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // br
    resetGateBias: new Matrix(hiddenSize, 1),
    // cell write parameters
    // wcxh
    cellWriteInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wchh
    cellWriteHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bc
    cellWriteBias: new Matrix(hiddenSize, 1),
  };
}

export function getGRUEquation(
  equation: Equation,
  inputMatrix: Matrix,
  previousResult: Matrix,
  hiddenLayer: IGRUHiddenLayer
): Matrix {
  if (
    !hiddenLayer.updateGateInputMatrix ||
    !hiddenLayer.updateGateHiddenMatrix ||
    !hiddenLayer.updateGateBias ||
    !hiddenLayer.resetGateInputMatrix ||
    !hiddenLayer.resetGateHiddenMatrix ||
    !hiddenLayer.resetGateBias ||
    !hiddenLayer.cellWriteInputMatrix ||
    !hiddenLayer.cellWriteHiddenMatrix ||
    !hiddenLayer.cellWriteBias
  ) {
    throw new Error('hiddenLayer does not have expected properties');
  }

  const sigmoid = equation.sigmoid.bind(equation);
  const add = equation.add.bind(equation);
  const multiply = equation.multiply.bind(equation);
  const multiplyElement = equation.multiplyElement.bind(equation);
  const tanh = equation.tanh.bind(equation);
  const allOnes = equation.allOnes.bind(equation);
  const cloneNegative = equation.cloneNegative.bind(equation);

  // update gate
  const updateGate = sigmoid(
    add(
      add(
        multiply(hiddenLayer.updateGateInputMatrix, inputMatrix),
        multiply(hiddenLayer.updateGateHiddenMatrix, previousResult)
      ),
      hiddenLayer.updateGateBias
    )
  );

  // reset gate
  const resetGate = sigmoid(
    add(
      add(
        multiply(hiddenLayer.resetGateInputMatrix, inputMatrix),
        multiply(hiddenLayer.resetGateHiddenMatrix, previousResult)
      ),
      hiddenLayer.resetGateBias
    )
  );

  // cell
  const cell = tanh(
    add(
      add(
        multiply(hiddenLayer.cellWriteInputMatrix, inputMatrix),
        multiply(
          hiddenLayer.cellWriteHiddenMatrix,
          multiplyElement(resetGate, previousResult)
        )
      ),
      hiddenLayer.cellWriteBias
    )
  );

  // compute hidden state as gated, saturated cell activations
  // negate updateGate
  return add(
    multiplyElement(
      add(
        allOnes(updateGate.rows, updateGate.columns),
        cloneNegative(updateGate)
      ),
      cell
    ),
    multiplyElement(previousResult, updateGate)
  );
}
