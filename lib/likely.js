module.exports = function likely(input, net) {
  var output = net.run(input);
  var maxProp = null;
  var maxValue = -1;
  for (var prop in output) {
    if (output.hasOwnProperty(prop)) {
      var value = output[prop];
      if (value > maxValue) {
        maxProp = prop;
        maxValue = value
      }
    }
  }
  return maxProp;
};
