'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Input extends Base {
  setupKernels() {}

  predict(inputs) {
    this.outputs = inputs;
  }

  compare() {}

  learn() {}
}