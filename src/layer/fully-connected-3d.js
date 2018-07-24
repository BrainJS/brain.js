import { Filter } from './types'
import { makeKernel } from '../utilities/kernel'
import randos2D from '../utilities/randos-2d'
import values from '../utilities/values'
import zeros2D from '../utilities/zeros-2d'
import zeros from '../utilities/zeros'

export function predict(inputs, filters, biases) {
  let output = 0
  let i = 0
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        output += inputs[z][y][x] * filters[this.thread.x][i]
        i++
      }
    }
  }
  return output + biases[this.thread.x]
}

export function compareInputDeltas(inputDeltas, deltas, filters) {
  let sum = 0
  const filterIndex = this.thread.x + (this.thread.y * this.output.x);
  for (let x = 0; x < this.constants.connectionCount; x++) {
    sum += filters[x][filterIndex] * deltas[0][x]
  }
  return sum + inputDeltas[this.thread.z][this.thread.y][this.thread.x]
}

export function compareBiases(biases, deltas) {
  return biases[this.thread.y][this.thread.x] + deltas[this.thread.y][this.thread.x]
}

export function compareFilterDeltas(filterDeltas, inputWeights, deltas) {
  const inputZ = Math.floor(this.thread.x / (this.constants.inputWidth * this.constants.inputHeight))
  const inputY = Math.floor(this.thread.x / this.constants.inputWidth)
  const inputX = this.thread.x % this.constants.inputWidth
  return filterDeltas[this.thread.y][this.thread.x] + (inputWeights[inputZ][inputY][inputX] * deltas[0][this.thread.y])
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
    this.validate()
    this.compareFilterDeltasKernel = null
    this.compareInputDeltasKernel = null
    this.compareBiasesKernel = null

    const connectionCount = inputLayer.width * inputLayer.height * inputLayer.depth

    this.biases = values(this.height, this.bias)
    this.biasDeltas = zeros(this.height)

    this.filters = randos2D(connectionCount, this.height)
    this.filterDeltas = zeros2D(connectionCount, this.height)
  }

  validate() {
    super.validate()
    if (this.depth > 1) throw new Error('depth not yet supported')
  }

  setupKernels() {
    const { inputLayer } = this;
    const connectionCount = inputLayer.width * inputLayer.height * inputLayer.depth;

    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        inputHeight: inputLayer.height,
        inputWidth: inputLayer.width,
      },
    })

    this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas, {
      output: [connectionCount, this.height],
      constants: {
        inputHeight: inputLayer.height,
        inputWidth: inputLayer.width,
      },
    })

    this.compareInputDeltasKernel = makeKernel(compareInputDeltas, {
      output: [inputLayer.width, inputLayer.height, inputLayer.depth],
      constants: {
        connectionCount,
      },
    })

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [this.width, this.height],
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
    this.inputLayer.deltas = this.compareInputDeltasKernel(
      this.inputLayer.deltas,
      this.deltas,
      this.filters
    )
    //TODO: handle biasDeltas learn
    this.biasDeltas = this.compareBiasesKernel(this.biases, this.deltas)

    //TODO: handle filterDeltas learn
    this.filterDeltas = this.compareFilterDeltasKernel(
      this.filterDeltas,
      this.inputLayer.weights,
      this.deltas
    )
  }
}
