'use strict';

let predict = null;
let learn = null;

export default class OutputLayer {
  setup(gpu, settings) {
    learn = gpu.createKernelMap({
      error: calcError,
      deltas: calcDeltas
    }, function(outputs, target){
      let output = outputs[this.thread.x];
      return calcDeltas(calcError(output, target), output);
    })
      .setDimensions({ dimensions })
      .setOutputToTexture(true);
  }
}

function calcDeltas(error, output) {
  return error * output * (1 - output);
}

function calcError(weights, deltas) {
  let error = 0;
  for(let k = 0; k < this.runDimensions.x; k++){
    error += deltas[k] * weights[k][this.thread.x];
  }
  return error;
}