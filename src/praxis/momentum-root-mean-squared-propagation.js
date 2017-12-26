/**
 * @description Root Mean Square Propagation
 * @returns {number}
 */
function momentumRootMeanSquaredPropagation(weights, deltas, previousMomentums, decayRate, regularizationStrength) {
  let delta = deltas[this.thread.y][this.thread.x];
  let weight = weights[this.thread.y][this.thread.x];
  let previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  const momentum = getMomentum(delta, decayRate, previousMomentum);
  return weight + -this.constants.learningRate * delta / Math.sqrt(momentum + this.constants.smoothEps) - regularizationStrength * weight;
}

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

// shortcuts
const mRmsProp = momentumRootMeanSquaredPropagation;
export default mRmsProp;

export {
  getMomentum,
  momentumRootMeanSquaredPropagation
};