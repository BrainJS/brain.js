import Base from './base';

class Regression extends Base {
  predict() {
    this.outputs = this.inputs;
  }

  learn() {

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