module.exports = function maxI(w) {
  // argmax of array w
  var maxv = w[0];
  var maxix = 0;
  for(var i = 1, n = w.length; i < n; i++) {
    var v = w[i];
    if(v > maxv) {
      maxix = i;
      maxv = v;
    }
  }
  return maxix;
};
