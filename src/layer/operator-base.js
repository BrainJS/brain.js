export default class OperatorBase {
  constructor(inputLayers) {}
  validate() {}
  setupKernels() {}
  compare() {
    throw new Error('compare not defined on OperatorBase');
  }
}