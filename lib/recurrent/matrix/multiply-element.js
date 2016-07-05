var Matrix = require('./index');

/**
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @param backPropagateArray
 */
module.exports = function elementMultiply(m1, m2, backPropagateArray) {
  if (m1.weights.length !== m2.weights.length) throw new Error('matrix element multiplication dimensions misaligned');

  var out = new Matrix(m1.n, m1.d);
  for(var i=0,n=m1.weights.length;i<n;i++) {
    out.weights[i] = m1.weights[i] * m2.weights[i];

  }
  if(typeof backPropagateArray !== 'undefined') {
    backPropagateArray.push(function backward() {
      for(var i=0,n=m1.weights.length;i<n;i++) {
        m1.dw[i] += m2.weights[i] * out.dw[i];
        m2.dw[i] += m1.weights[i] * out.dw[i];
      }
    });
  }
  return out;
};
