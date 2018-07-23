import { Filter } from './types'
import { makeKernel } from '../utilities/kernel'
import randos2D from '../utilities/randos-2d'
import zeros2D from '../utilities/zeros-2d'

export function predict(inputs, filters, biases) {
  let output = 0
  let i = 0
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[this.thread.x][i]
      i++
    }
  }
  return output + biases[this.thread.x]
}

export function compareInputs(filters, weights) {
  let filterDelta = 0
  for (let y = 0; y < this.constants.inputWidth; y++) {
    filterDelta += filters[this.thread.x][y] * weights[this.thread.x]
  }
  return filterDelta
}

export function compareFilters(inputDeltas, deltas, filters) {
  let sum = 0
  const filterIndex = this.thread.x + (this.thread.y * this.output.x);
  for (let x = 0; x < this.constants.connectionCount; x++) {
    sum += filters[x][filterIndex] * deltas[0][x]
  }
  return sum
}

export function compareBiases(biases, deltas) {
  return biases[this.output.x] * deltas[this.output.x]
}

export default class FullyConnected extends Filter {
  static get defaults() {
    return {
      bias: 0.1,
    }
  }
  constructor(settings, inputLayer) {
    super(settings)
    this.inputLayer = inputLayer
    this.compareInputsKernel = null
    this.compareFiltersKernel = null
    this.compareBiasesKernel = null

    if (inputLayer.depth > 1) throw new Error('depth not yet supported')

    const connections = inputLayer.width * inputLayer.height

    this.biases = new Array(this.depth)
    this.biases.fill(this.bias)
    this.biasDeltas = randos(this.depth)

    this.filters = randos2D(connections, this.height)
    this.filterDeltas = zeros2D(connections, this.height)

    this.validate()
  }

  setupKernels() {
    const { inputLayer } = this;
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        inputHeight: inputLayer.height,
        inputWidth: inputLayer.width,
      },
    })

    this.compareInputsKernel = makeKernel(compareInputs, {
      output: [this.width, this.height],
      constants: {
        inputHeight: inputLayer.height,
        inputWidth: inputLayer.width,
      },
    })

    this.compareFiltersKernel = makeKernel(compareFilters, {
      output: [inputLayer.width, inputLayer.height],
      constants: {
        connectionCount: inputLayer.width * inputLayer.height
      },
    })

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [this.width, this.height],
      constants: {
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width,
      },
    })
  }

  predict() {
    this.weights = this.predictKernel(
      this.inputLayer.weights,
      this.filters,
      this.biases
    )
  }

  compare() {
    this.filterDeltas = this.compareFiltersKernel(
      this.inputLayer.deltas,
      this.deltas,
      this.filters
    )
    this.biasDeltas = this.compareBiasesKernel(this.bias, this.deltas)
    this.deltas = this.compareInputsKernel(this.filters)
  }
}
