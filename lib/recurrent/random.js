function randf(a, b) { return Math.random()*(b-a)+a; }
function randi(a, b) { return Math.floor(Math.random()*(b-a)+a); }
function randn(mu, std){ return mu+gaussRandom()*std; }

// Random numbers utils
var return_v = false;
var v_val = 0.0;
function gaussRandom() {
  if(return_v) {
    return_v = false;
    return v_val;
  }
  var u = 2*Math.random()-1;
  var v = 2*Math.random()-1;
  var r = u*u + v*v;
  if(r == 0 || r > 1) return gaussRandom();
  var c = Math.sqrt(-2*Math.log(r)/r);
  v_val = v*c; // cache this
  return_v = true;
  return u*c;
}

module.exports = {
  f: randf,
  i: randi,
  n: randn
};