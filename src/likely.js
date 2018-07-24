/**
 *
 * @param {*} input
 * @param {NeuralNetwork} net
 * @returns {*}
 */
export default function likely(input, net) {
  const output = net.run(input)
  let maxProp = null
  let maxValue = -1

  Object.keys(output).forEach(key => {
    const value = output[key]
    if (value > maxValue) {
      maxProp = key
      maxValue = value
    }
  })

  return maxProp
}
