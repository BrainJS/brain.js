import { Activation } from './types'
import { makeKernel } from '../utilities/kernel'
import { activate, measure } from '../activation/relu'
import zeros2D from '../utilities/zeros-2d'
import zeros3D from '../utilities/zeros-3d'

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x])
}

export function compare(weights, deltas) {
  return measure(
    weights[this.thread.y][this.thread.x],
    deltas[this.thread.y][this.thread.x]
  )
}

export function predict3D(inputs) {
  return activate(inputs[this.thread.z][this.thread.y][this.thread.x])
}

export function compare3D(weights, deltas) {
  return measure(
    weights[this.thread.z][this.thread.y][this.thread.x],
    deltas[this.thread.z][this.thread.y][this.thread.x]
  )
}

export default class Relu extends Activation {
  constructor(inputLayer) {
    super()
    this.inputLayer = inputLayer

    const { width, height, depth } = inputLayer
    this.width = width
    this.height = height
    this.validate()
    if (depth > 1) {
      this.depth = depth
      this.weights = zeros3D(width, height, depth)
      this.deltas = zeros3D(width, height, depth)
    } else {
      this.depth = 1
      this.weights = zeros2D(width, height)
      this.deltas = zeros2D(width, height)
    }
  }

  setupKernels() {
    const { width, height, depth } = this.inputLayer
    if (this.depth > 1) {
      this.predictKernel = makeKernel(predict3D, {
        output: [width, height, depth],
        functions: [activate],
      })

      this.compareKernel = makeKernel(compare3D, {
        output: [width, height, depth],
        functions: [measure],
      })
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [width, height],
        functions: [activate],
      })

      this.compareKernel = makeKernel(compare, {
        output: [width, height],
        functions: [measure],
      })
    }
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights)
  }

  compare() {
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas)
  }
}
