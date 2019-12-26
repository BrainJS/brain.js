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

  run() {}
}

module.exports = {
  Base
};
