export default class Group {
  constructor(settings) {
    this.settings = settings;
  }
  static setupKernel(settings) {
    throw new Error('not implemented on Group');
  }
}