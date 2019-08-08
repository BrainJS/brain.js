const { Base } = require('./base');

class Regression extends Base {
  constructor(settings) {
    super(settings);
    this.validate();
  }

  predict() {
    this.weights = this.inputs;
  }

  learn() {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
  }
}

function learn(inputs, targets) {
  return inputs[this.thread.x] - targets[this.thread.x];
}

// TODO: handle `loss += 0.5*dy*dy;` total and sum in learn
function regression(settings, inputLayer) {
  return new Regression(settings, inputLayer);
}

module.exports = {
  Regression,
  regression,
  learn
};
