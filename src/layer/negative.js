import { makeKernel } from '../utilities/kernel'
import { Modifier } from './types'

function predict(weights) {
  return -weights[this.thread.y][this.thread.x]
}

export default class Negative extends Modifier {
  constructor(settings, inputLayer) {
    super(settings)
    this.inputLayer = inputLayer
    this.validate()
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    })
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights)
  }
}
