class Base {
  static get defaults() {
    return {};
  }

  constructor(layerTemplate, settings = {}) {
    this.layerTemplate = layerTemplate;
    this.width = layerTemplate.width || null;
    this.height = layerTemplate.height || null;
    this.depth = layerTemplate.depth || null;
    Object.assign(this, this.constructor.defaults, settings);
  }

  setupKernels() {}

  reuseKernels(praxis) {
    if (praxis.width !== this.width) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${praxis.width} is not ${this.width}`
      );
    }
    if (praxis.height !== this.height) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${praxis.height} is not ${this.height}`
      );
    }
    if (praxis.hasOwnProperty('kernel')) {
      this.kernel = praxis.kernel;
    }
  }

  run() {}
}

module.exports = {
  Base,
};
