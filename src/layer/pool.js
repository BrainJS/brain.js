import { Filter } from './types'
import { makeKernel } from '../utilities/kernel'
import { setPadding, setStride } from '../utilities/layer-setup'
import zeros2D from '../utilities/zeros-2d'
import zeros3D from '../utilities/zeros-3d'
import randos2D from '../utilities/randos-2d'

function setSwitchY(value) {
  return value
}

function setSwitchX(value) {
  return value
}

export function predict(inputs) {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.inputWidth -
      this.constants.paddingX
  )
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.inputHeight -
      this.constants.paddingY
  )
  let largestValue = -Infinity
  let largestX = -1
  let largestY = -1

  // convolve centered at this particular location
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
        const input = inputs[this.thread.z][inputY][inputX]
        if (input > largestValue) {
          largestValue = input
          largestY = inputY
          largestX = inputX
        }
      }
    }
  }
  setSwitchY(largestY)
  setSwitchX(largestX)
  return largestValue
}

export function compare(deltas, switchY, switchX) {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.outputWidth -
      this.constants.paddingX
  )
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.outputHeight -
      this.constants.paddingY
  )
  const deltaXIndex = switchX[y][x]
  const deltaYIndex = switchY[y][x]

  if (deltaXIndex !== this.thread.y) return 0
  if (deltaYIndex !== this.thread.x) return 0

  return deltas[y][x]
}

export default class Pool extends Filter {
  static get defaults() {
    return {
      padding: 0,
      bias: 0,
      filterWidth: 0,
      filterHeight: 0,
      filterCount: 0,
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

    this.weights = zeros3D(this.width, this.height, this.depth)
    this.deltas = zeros3D(this.width, this.height, this.depth)

    this.filters = []
    this.filterDeltas = []

    for (let i = 0; i < this.filterCount; i++) {
      this.filters.push(randos2D(this.filterWidth, this.filterHeight))
      this.filterDeltas.push(zeros2D(this.filterWidth, this.filterHeight))
    }

    this.learnFilters = null
    this.learnInputs = null
    this.inputLayer = inputLayer
    this.validate()
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      map: {
        switchX: setSwitchX,
        switchY: setSwitchY,
      },
      constants: {
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterHeight: this.filterHeight,
        filterWidth: this.filterWidth,
      },
    })

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height, this.depth],
      constants: {
        outputWidth: this.width,
        outputHeight: this.height,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
      },
    })
  }

  predict() {
    const weights = this.predictKernel(this.inputLayer.weights)
    this.switchX = weights.switchX
    this.switchY = weights.switchY
    this.weights = weights.result
    return this.weights
  }

  compare() {
    this.inputLayer.deltas = this.compareKernel(
      this.deltas,
      this.switchX,
      this.switchY
    )
  }
}
