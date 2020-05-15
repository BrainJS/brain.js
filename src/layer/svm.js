const { Base } = require('./base');

class SVM extends Base {
  predict() {
    this.weights = this.inputs;
    this.validate();
  }

  learn() {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
  }
}

// function learn(target) {
//   if (y === i) {
//     continue;
//   }
//   const ydiff = -yscore + x.w[i] + margin;
//   if (ydiff > 0) {
//     // violating dimension, apply loss
//     x.dw[i] += 1;
//     x.dw[y] -= 1;
//     loss += ydiff;
//   }
// }

function svm(settings, inputLayer) {
  return new SVM(settings, inputLayer);
}

module.exports = {
  SVM,
  svm,
};
