import { makeKernel } from '../utilities/kernel'
import { Filter } from './types'

function getMaxValue(inputs) {
  let maxInput = -Infinity
  for (let z = 0; z < this.output.z; z++) {
    for (let y = 0; y < this.output.y; y++) {
      for (let x = 0; x < this.output.x; x++) {
        const input = inputs[z][y][x]
        if (input > maxInput) {
          maxInput = input
        }
      }
    }
  }
  return maxInput
}

function getSum(inputs) {
  let sum = 0
  for (let z = 0; z < this.output.z; z++) {
    for (let y = 0; y < this.output.y; y++) {
      for (let x = 0; x < this.output.x; x++) {
        sum += inputs[z][y][x]
      }
    }
  }
  return sum
}

function getExponentials(inputs, maxInput) {
  return Math.exp(
    inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]
  )
}

function predict(exponentials, exponentialsSum) {
  return (
    exponentials[this.thread.z][this.thread.y][this.thread.x] /
    exponentialsSum[0]
  )
}

function compare(target, exponentials) {
  let indicator = 0
  if (this.thread.x === target) {
    indicator = 1
  }
  return -(indicator - exponentials[target])
}

export default class SoftMax extends Filter {
  constructor(settings, inputLayer) {
    super(settings)
    this.getExponentialsKernel = null
    this.getMaxValueKernel = null
    this.getSumKernel = null
    this.inputLayer = inputLayer
    this.validate()
  }

  setupKernels() {
    this.getExponentialsKernel = makeKernel(getExponentials, {
      output: [
        this.inputLayer.width,
        this.inputLayer.height,
        this.inputLayer.depth,
      ],
    })
    this.getMaxValueKernel = makeKernel(getMaxValue, {
      output: [1, 1, 1],
    })
    this.getSumKernel = makeKernel(getSum, {
      output: [1, 1, this.depth],
    })
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
    })
    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height, this.depth],
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

// TODO: handle: `return -Math.log(this.es[y]);` in learn
