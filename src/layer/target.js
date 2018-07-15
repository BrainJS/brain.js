import { makeKernel } from '../utilities/kernel'
import Zeros2D from '../utilities/zeros-2d'
import { Filter } from './types'

function compare1D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x]
}

function compare2D(weights, targetValues) {
  return (
    weights[this.thread.y][this.thread.x] -
    targetValues[this.thread.y][this.thread.x]
  )
}

export default class Target extends Filter {
  constructor(settings, inputLayer) {
    super(settings)
    this.inputLayer = inputLayer

    // TODO: properly handle dimensions
    this.width = inputLayer.width
    this.height = inputLayer.height
    this.validate()
    this.weights = zeros2D(this.width, this.height)
    this.deltas = zeros2D(this.width, this.height)
    this.errors = zeros2D(this.width, this.height)
  }

  setupKernels() {
    const compareFn = this.width === 1 ? compare1D : compare2D
    this.compareKernel = makeKernel(compareFn, {
      output: [this.width, this.height],
    })
  }

  predict() {
    // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
    this.weights = this.inputLayer.weights
  }

  compare(targetValues) {
    // this is where weights attach to deltas
    // deltas will be zero on learn, so save it in error for comparing to mse later
    this.errors = this.compareKernel(this.weights, targetValues)
    this.deltas = this.errors
    this.inputLayer.deltas = this.deltas
  }
}
