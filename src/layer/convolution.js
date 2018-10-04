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

export function compareFilters(filterDeltas, inputs, deltas) {
  const startingInputY = this.thread.y - this.constants.paddingY
  const startingInputX = this.thread.x - this.constants.paddingX

  let deltaSlideY = 0

  let sum = filterDeltas[this.thread.z][this.thread.y][this.thread.x]
  for (let y = 0; y < this.constants.slideHeight; y++) {
    deltaSlideY++
    let deltaSlideX = 0

    const inputY = startingInputY + (y * this.constants.strideY)
    if (inputY < 0 || inputY >= this.constants.inputHeight) continue

    for (let x = 0; x < this.constants.slideWidth; x++) {
      deltaSlideX++

      const inputX = startingInputX + (x * this.constants.strideX)
      if (inputX < 0 || inputX >= this.constants.inputWidth) continue

      const input = inputs[this.thread.z][inputY][inputX]
      const deltaY = deltaSlideY - 1;
      const deltaX = deltaSlideX - 1;
      sum += input * deltas[this.constants.deltaZ][deltaY][deltaX]
    }
  }

  return sum
}

export function compareInputs(filters, deltas) {
  let sum = 0
  for (let filterY = 0; filterY <= this.thread.y; filterY++) {
    let offsetY = this.thread.y - filterY
    for (let filterX = 0; filterX <= this.thread.x; filterX++) {
      let offsetX = this.thread.x - filterX
      for (
        let filterIndex = 0;
        filterIndex < this.constants.filterCount;
        filterIndex++
      ) {
        sum +=
          filters[filterIndex][offsetY][offsetX] *
          deltas[filterIndex][filterY][filterX]
      }
      offsetX--
    }
    offsetY--
  }
  return sum
}

export function compareBiases(biasDeltas, deltas) {
  let sum = 0
  for (let y = 0; y < this.constants.y; y++) {
    for (let x = 0; x < this.constants.x; x++) {
      sum += deltas[this.thread.z][y][x]
    }
  }
  return biasDeltas[this.thread.z] + sum
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

    this.compareFiltersKernel = makeKernel(compareFilters, {
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
        filterCount: this.filterCount,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight,
      },
      output: [this.width, this.height, this.depth],
    })

    this.compareInputsKernel = makeKernel(compareInputs, {
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
      output: [1, 1, this.inputLayer.depth],
      constants: {
        x: 1,
        y: 1,
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
      this.filterDeltas,
      this.inputLayer.weights,
      this.deltas
    )
    this.biasDeltas = this.compareBiasesKernel(this.biasDeltas, this.deltas)
    this.deltas = this.compareInputsKernel(this.filters, this.inputLayer.deltas)
    this.inputLayer.deltas = this.deltas
  }

  learn(previousLayer, nextLayer, learningRate) {
    // TODO: handle filters
    this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate)
    this.deltas = zeros3D(this.width, this.height, this.depth)
  }
}
