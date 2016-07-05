var randf = require('./random').f;

module.exports = function samplei(w) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = randf(0,1);
  var x = 0.0;
  var i = 0;
  while(true) {
    x += w[i];
    if(x > r) { return i; }
    i++;
  }
};
