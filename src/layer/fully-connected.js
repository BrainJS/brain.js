import { Filter } from './types'
import { makeKernel } from '../utilities/kernel'
import zeros2D from "../utilities/zeros-2d";
import randos2D from "../utilities/randos-2d";
import randos3D from "../utilities/randos-3d";
import randos from "../utilities/randos";

export function predict(inputs, filters, biases) {
  let output = 0
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[y][x]
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

export function compareFilters(inputs, weights) {
  // 0 here should probably be depth
  return inputs[0][this.thread.y] * weights[this.thread.x]
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
    this.compareBiasKernel = null

    const connections = inputLayer.width * inputLayer.height * inputLayer.depth

    this.biases = new Array(this.depth)
    this.biases.fill(this.bias)
    this.biasDeltas = randos(this.depth)

    this.filters = []
    this.filterDeltas = []

    for (let i = 0; i < this.depth; i++) {
      this.filters.push(randos3D(1, 1, connections))
      this.filterDeltas.push(randos3D(1, 1, connections))
    }

    this.validate()
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width,
      },
    })

    this.compareInputsKernel = makeKernel(compareInputs, {
      output: [this.width, this.height, this.depth],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width,
      },
    })

    this.compareFiltersKernel = makeKernel(compareFilters, {
      output: [this.width, this.height, this.depth],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width,
      },
    })

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [this.width, this.height, this.depth],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width,
      },
    })

    this.compareKernel = () => {
      this.compareInputsKernel(this.filters, this.deltas)
      this.compareFiltersKernel(this.inputLayer.weights, this.deltas)
      this.compareBiasKernel(this.biases, this.deltas)
    }
  }

  predict() {
    this.weights = this.predictKernel(
      this.inputLayer.weights,
      this.filters,
      this.biases
    )
  }

  compare() {
    this.filterDeltas = this.compareFiltersKernel(this.inputLayer.deltas, this.deltas)
    this.biases = this.compareBiasesKernel(this.bias, this.deltas)
    this.deltas = this.compareInputsKernel(this.filters)
  }
}
