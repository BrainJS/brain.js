import { makeKernel } from '../utilities/kernel'
import { setStride, setPadding } from '../utilities/layer-setup'
import { Filter } from './types'
import randos from '../utilities/randos'
import randos3D from '../utilities/randos-3d'
import zeros3D from '../utilities/zeros-3d'
import values from '../utilities/values'

export function predict(inputs, filters, biases) {
  const x =
    (this.thread.x / this.output.x) *
      this.constants.inputWidth *
      this.constants.strideX -
    this.constants.paddingX
  const y =
    (this.thread.y / this.output.y) *
      this.constants.inputHeight *
      this.constants.strideY -
    this.constants.paddingY

  // convolve centered at this particular location
  let sum = 0
  for (let filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    const inputY = filterY + y
    for (let filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      const inputX = filterX + x
      if (
        inputY >= 0 &&
        inputY < this.constants.inputHeight &&
        inputX >= 0 &&
        inputX < this.constants.inputWidth
      ) {
        for (
          let inputIndex = 0;
          inputIndex < this.constants.inputDepth;
          inputIndex++
        ) {
          for (
            let filterIndex = 0;
            filterIndex < this.constants.filterCount;
            filterIndex++
          ) {
            sum +=
              filters[filterIndex][filterY][filterX] *
              inputs[inputIndex][inputY][inputX]
          }
        }
      }
    }
  }
  return sum + biases[this.thread.z]
}

export function compareFilterDeltas(filterDeltas, inputs, deltas) {
  const startingDeltaX = Math.max(0, Math.ceil((this.constants.paddingX - this.thread.x) / this.constants.strideX))
  const startingInputX = startingDeltaX * this.constants.strideX + this.thread.x - this.constants.paddingX
  const endingDeltaX = Math.min(this.constants.deltaWidth, Math.floor(((this.constants.inputWidth - 1) - this.thread.x + this.constants.paddingX) / this.constants.strideX) + 1)

  const startingDeltaY = Math.max(0, Math.ceil((this.constants.paddingY - this.thread.y) / this.constants.strideY))
  const startingInputY = startingDeltaY * this.constants.strideY + this.thread.y - this.constants.paddingY
  const endingDeltaY = Math.min(this.constants.deltaHeight, Math.floor(((this.constants.inputHeight - 1) - this.thread.y + this.constants.paddingY) / this.constants.strideY) + 1)

  let sum = filterDeltas[this.thread.z][this.thread.y][this.thread.x]
  for (let deltaY = startingDeltaY, inputY = startingInputY; deltaY < endingDeltaY; deltaY++, inputY += this.constants.strideY) {
    for (let deltaX = startingDeltaX, inputX = startingInputX; deltaX < endingDeltaX; deltaX++, inputX += this.constants.strideX) {
      sum += inputs[this.thread.z][inputY][inputX] * deltas[this.constants.deltaZ][deltaY][deltaX]
    }
  }

  return sum
}

export function compareInputDeltas(inputDeltas, filters, deltas) {
  const x = this.thread.x + this.constants.paddingX
  const startingDeltaX = x < this.constants.filterWidth ? 0 : Math.floor((x - this.constants.filterWidth + this.constants.strideX) / this.constants.strideX)
  const startingFilterX = x - startingDeltaX * this.constants.strideX
  const endDeltaX = Math.min(startingDeltaX + Math.floor(startingFilterX / this.constants.strideX) + 1, this.constants.deltaWidth)

  const y = this.thread.y + this.constants.paddingY
  const startingDeltaY = y < this.constants.filterHeight ? 0 : Math.floor((y - this.constants.filterHeight + this.constants.strideY) / this.constants.strideY)
  const startingFilterY = y - startingDeltaY * this.constants.strideY
  const endDeltaY = Math.min(startingDeltaY + Math.floor(startingFilterY / this.constants.strideY) + 1, this.constants.deltaHeight)

  let sum = inputDeltas[this.thread.z][this.thread.y][this.thread.x]
  let deltaY = startingDeltaY

  for (let filterY = startingFilterY; deltaY < endDeltaY; filterY -= this.constants.strideY, deltaY++) {
    let deltaX = startingDeltaX
    for (let filterX = startingFilterX; deltaX < endDeltaX; filterX -= this.constants.strideX, deltaX++) {
      sum += filters[this.thread.z][filterY][filterX] * deltas[this.constants.deltaZ][deltaX][deltaY]
    }
  }
  return sum
}

export function compareBiases(biasDeltas, deltas) {
  let sum = 0
  for (let y = 0; y < this.constants.deltaHeight; y++) {
    for (let x = 0; x < this.constants.deltaWidth; x++) {
      sum += deltas[this.thread.z][y][x]
    }
  }
  return biasDeltas[this.thread.z][this.thread.y][this.thread.x] + sum
}

export default class Convolution extends Filter {
  static get defaults() {
    return {
      stride: 0,
      padding: 0,
      bias: 0.1,
      filterCount: 1,
      filterWidth: 0,
      filterHeight: 0,
    }
  }

  constructor(settings, inputLayer) {
    super(settings)

    this.stride = null
    this.strideX = null
    this.strideY = null
    setStride(this, settings)

    this.padding = null
    this.paddingX = null
    this.paddingY = null
    setPadding(this, settings)

    this.filterCount = settings.filterCount
    this.filterWidth = settings.filterWidth
    this.filterHeight = settings.filterHeight

    this.width = Math.floor(
      (inputLayer.width + this.paddingX * 2 - this.filterWidth) / this.strideX +
        1
    )
    this.height = Math.floor(
      (inputLayer.height + this.paddingY * 2 - this.filterHeight) /
        this.strideY +
        1
    )
    this.depth = this.filterCount
    this.weights = randos3D(this.width, this.height, this.depth)
    this.deltas = zeros3D(this.width, this.height, this.depth)

    this.biases = values(this.depth, this.bias)
    this.biasDeltas = randos(this.depth)

    this.filters = randos3D(this.filterWidth, this.filterHeight, this.filterCount)
    this.filterDeltas = zeros3D(this.filterWidth, this.filterHeight, this.filterCount)

    this.learnFilters = null
    this.learnInputs = null
    this.inputLayer = inputLayer
    this.validate()
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      constants: {
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        inputDepth: this.inputLayer.depth,
        strideX: this.strideX,
        strideY: this.strideY,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterCount: this.filterCount,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
      },
      output: [this.width, this.height, this.depth],
    })

    this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas, {
      constants: {
        deltasWidth: this.width,
        deltasHeight: this.height,
        deltasDepth: this.depth,
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        inputDepth: this.inputLayer.depth,
        strideX: this.strideX,
        strideY: this.strideY,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
      },
      output: [this.width, this.height, this.depth],
    })

    this.compareInputDeltasKernel = makeKernel(compareInputDeltas, {
      constants: {
        filterCount: this.filterCount,
      },
      output: [
        this.inputLayer.width,
        this.inputLayer.height,
        this.inputLayer.depth,
      ],
    })

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [1, 1, this.depth],
      constants: {
        deltaWidth: this.width,
        deltaHeight: this.height,
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
    this.filterDeltas = this.compareFilterDeltasKernel(
      this.filterDeltas,
      this.inputLayer.weights,
      this.deltas
    )
    this.biasDeltas = this.compareBiasesKernel(this.biasDeltas, this.deltas)
    this.deltas = this.compareInputDeltasKernel(this.filters, this.inputLayer.deltas)
    this.inputLayer.deltas = this.deltas
  }

  learn(previousLayer, nextLayer, learningRate) {
    // TODO: handle filters
    this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate)
    this.deltas = zeros3D(this.width, this.height, this.depth)
  }
}
