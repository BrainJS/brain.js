import { makeKernel } from '../utilities/kernel'
import { Filter } from './types'

export function getMaxValue(inputs) {
  let maxInput = -Infinity
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      const input = inputs[y][x]
      if (input > maxInput) {
        maxInput = input
      }
    }
  }
  return maxInput
}

export function getMaxValue3D(inputs) {
  let maxInput = -Infinity
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        const input = inputs[z][y][x]
        if (input > maxInput) {
          maxInput = input
        }
      }
    }
  }
  return maxInput
}

export function getSum(inputs) {
  let sum = 0
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      sum += inputs[y][x]
    }
  }
  return sum
}

export function getSum3D(inputs) {
  let sum = 0
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x]
      }
    }
  }
  return sum
}

export function getExponentials(inputs, maxInput) {
  return Math.exp(
    inputs[this.thread.y][this.thread.x] - maxInput[0]
  )
}

export function getExponentials3D(inputs, maxInput) {
  return Math.exp(
    inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]
  )
}

export function predict(exponentials, exponentialsSum) {
  return (
    exponentials[this.thread.y][this.thread.x] /
    exponentialsSum[0]
  )
}

export function predict3D(exponentials, exponentialsSum) {
  return (
    exponentials[this.thread.z][this.thread.y][this.thread.x] /
    exponentialsSum[0]
  )
}

export function compare(target, exponentials) {
  let indicator = 0
  if (this.thread.x === target) {
    indicator = 1
  }
  return -(indicator - exponentials[target])
}

// TODO: handle: `return -Math.log(this.es[y]);` in learn

export default class SoftMax extends Filter {
  constructor(settings, inputLayer) {
    super(settings)
    this.width = inputLayer.width
    this.height = inputLayer.height
    this.depth = inputLayer.depth
    this.getExponentialsKernel = null
    this.getMaxValueKernel = null
    this.getSumKernel = null
    this.inputLayer = inputLayer
    this.validate()
  }

  setupKernels() {
    const { inputLayer } = this
    if (inputLayer.depth > 1) {
      this.getExponentialsKernel = makeKernel(getExponentials3D, {
        output: [
          inputLayer.width,
          inputLayer.height,
          inputLayer.depth,
        ],
      })
      this.getMaxValueKernel = makeKernel(getMaxValue3D, {
        output: [1, 1, 1],
        constants: {
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
          inputDepth: inputLayer.depth,
        },
      })
      this.getSumKernel = makeKernel(getSum3D, {
        output: [1, 1, 1],
        constants: {
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
          inputDepth: inputLayer.depth,
        },
      })
      this.predictKernel = makeKernel(predict3D, {
        output: [this.width, this.height, this.depth],
      })
    } else {
      this.getExponentialsKernel = makeKernel(getExponentials, {
        output: [
          inputLayer.width,
          inputLayer.height,
        ],
      })
      this.getMaxValueKernel = makeKernel(getMaxValue, {
        output: [1, 1],
        constants: {
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
        },
      })
      this.getSumKernel = makeKernel(getSum, {
        output: [1, 1],
        constants: {
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
        },
      })
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height],
      })
    }
    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
    })
  }

  predict() {
    const maxValue = this.getMaxValueKernel(this.inputLayer.weights)
    const exponentials = this.getExponentialsKernel(
      this.inputLayer.weights,
      maxValue
    )
    const exponentialsSum = this.getSumKernel(exponentials)
    this.weights = this.predictKernel(exponentials, exponentialsSum)
  }

  compare(targetValues) {
    this.inputLayer.deltas = this.compareKernel(targetValues[0], this.deltas)
  }
}