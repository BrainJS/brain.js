import { Activation } from './types'
import { makeKernel } from '../utilities/kernel'
import { activate, measure } from '../activation/leaky-relu'

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x])
}

export function compare(weights, deltas) {
  return measure(
    weights[this.thread.y][this.thread.x],
    deltas[this.thread.y][this.thread.x]
  )
}

export default class LeakyRelu extends Activation {
  constructor(inputLayer) {
    super()
    this.inputLayer = inputLayer
    const { width, height, depth } = inputLayer
    this.width = width
    this.height = height
    this.depth = depth
    this.validate()
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      functions: [activate],
    })

    this.compareKernel = makeKernel(compare, {
      functions: [measure],
    })
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights)
  }

  compare() {
    this.deltas = this.compareKernel(this.weights, this.deltas)
  }
}
