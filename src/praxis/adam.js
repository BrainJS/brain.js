// TODO: implement and test
class Adam {}

function adam() {
  // gradient = grad_fun(theta)
  //
  //           # Update moment estimates
  // moment1 = beta1 * moment1 + (1 - beta1) * gradient
  // moment2 = beta2 * moment2 + (1 - beta2) * np.square(gradient)
  //
  //           # Yield adapted gradient
  // theta = ( theta - alpha * (1 - beta2**t)**0.5 / (1 - beta1**t) *
  //   moment1 / (epsilon + np.sqrt(moment2)) )
  // yield theta
  // t += 1
  // adam update
  // gsumi[j] = gsumi[j] * this.beta1 + (1- this.beta1) * gij; // update biased first moment estimate
  // xsumi[j] = xsumi[j] * this.beta2 + (1-this.beta2) * gij * gij; // update biased second moment estimate
  // var biasCorr1 = gsumi[j] * (1 - Math.pow(this.beta1, this.k)); // correct bias first moment estimate
  // var biasCorr2 = xsumi[j] * (1 - Math.pow(this.beta2, this.k)); // correct bias second moment estimate
  // var dx =  - this.learning_rate * biasCorr1 / (Math.sqrt(biasCorr2) + this.eps);
  // p[j] += dx;
}

module.exports = {
  Adam, adam
};
