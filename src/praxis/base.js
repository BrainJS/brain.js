class Base {
  static get defaults() {
    return {};
  }

  constructor(layer, settings = {}) {
    this.layer = layer;
    this.width = layer.width || null;
    this.height = layer.height || null;
    this.depth = layer.depth || null;
    Object.assign(this, this.constructor.defaults, settings);
  }

  setupKernels() {}

  run() {}
}

module.exports = {
  Base
};
