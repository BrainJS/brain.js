import Base from './base';

class Regression extends Base {
  predict() {
    this.weights = this.inputs;
    this.validate();
  }

  learn() {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
  }
}

function learn(target) {
  // if(y === i) { continue; }
  // var ydiff = -yscore + x.w[i] + margin;
  // if(ydiff > 0) {
  //   // violating dimension, apply loss
  //   x.dw[i] += 1;
  //   x.dw[y] -= 1;
  //   loss += ydiff;
  // }
}
