/**
 *
 * @param {*} input
 * @param {NeuralNetwork} net
 * @returns {*}
 */
export default function likely(input, net) {
  let output = net.run(input);
  let maxProp = null;
  let maxValue = -1;
  for (let prop in output) {
    let value = output[prop];
    if (value > maxValue) {
      maxProp = prop;
      maxValue = value
    }
  }
  return maxProp;
}
