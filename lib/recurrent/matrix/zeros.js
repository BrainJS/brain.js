/**
 * helper function returns array of zeros of length n and uses typed arrays if available
 * @param {Number} n
 * @returns {Float64Array|Array}
 */
module.export = function zeros(n) {
  if(typeof Float64Array === 'undefined') {
    // lacking browser support
    var arr = new Array(n);
    for(var i=0;i<n;i++) { arr[i] = 0; }
    return arr;
  } else {
    return new Float64Array(n);
  }
};
