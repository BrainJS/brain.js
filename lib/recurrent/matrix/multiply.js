/**
 * multiply matrices m1 * m2
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @param backPropagateArray
 * @returns {Matrix}
 */
module.exports = function multiply(m1, m2, backPropagateArray) {
  if (m1.d !== m2.n) throw new Error('matrix multiplication dimensions misaligned');

  var n = m1.n;
  var d = m2.d;
  var out = new Matrix(n, d);
  for(var i=0;i<m1.n;i++) { // loop over rows of m1
    for(var j=0;j<m2.d;j++) { // loop over cols of m2
      var dot = 0.0;
      for(var k=0;k<m1.d;k++) { // dot product loop
        dot += m1.weights[m1.d*i+k] * m2.weights[m2.d*k+j];
      }
      out.weights[d*i+j] = dot;
    }
  }

  if(typeof backPropagateArray !== 'undefined') {
    backPropagateArray.push(function backward() {
      for(var i=0;i<m1.n;i++) { // loop over rows of m1
        for(var j=0;j<m2.d;j++) { // loop over cols of m2
          for(var k=0;k<m1.d;k++) { // dot product loop
            var b = out.dw[d*i+j];
            m1.dw[m1.d*i+k] += m2.weights[m2.d*k+j] * b;
            m2.dw[m2.d*k+j] += m1.weights[m1.d*i+k] * b;
          }
        }
      }
    });
  }
  return out;
};
