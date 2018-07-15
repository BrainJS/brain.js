import { Model } from './types'
import Zeros2D from '../utilities/zeros-2d'
import { kernelInput } from '../utilities/kernel'

export default class Input extends Model {
  constructor(settings) {
    super(settings)
    if (this.width === 1) {
      this.predict = this.predict1D
    }
    this.validate()
    this.weights = null
    this.deltas = zeros2D(this.width, this.height)
  }

  predict(inputs) {
    if (inputs.length === this.height * this.width) {
      this.weights = kernelInput(inputs, [this.width, this.height])
    } else if (
      inputs.length === this.height &&
      inputs[0].length === this.width
    ) {
      this.weights = inputs
    } else {
      throw new Error('Inputs are not of sized correctly')
    }
  }

  predict1D(inputs) {
    const weights = []
    for (let x = 0; x < inputs.length; x++) {
      weights.push([inputs[x]])
    }
    this.weights = weights
  }

  compare() {
    throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn() {
    this.deltas = zeros2D(this.width, this.height)
  }

  toJSON() {
    const jsonLayer = {}
    const { defaults, name } = this.constructor
    const keys = Object.keys(defaults)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (key === 'deltas' || key === 'weights') continue
      jsonLayer[key] = this[key]
    }
    jsonLayer.type = name
    return jsonLayer
  }
}
