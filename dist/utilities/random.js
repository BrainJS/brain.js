"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomF = randomF;
exports.randomI = randomI;
exports.randomN = randomN;
function randomF(a, b) {
  return Math.random() * (b - a) + a;
}

function randomI(a, b) {
  return Math.floor(Math.random() * (b - a) + a);
}

function randomN(mu, std) {
  return mu + gaussRandom() * std;
}

// Random numbers utils
function gaussRandom() {
  if (gaussRandom.returnV) {
    gaussRandom.returnV = false;
    return gaussRandom.vVal;
  }
  var u = 2 * Math.random() - 1;
  var v = 2 * Math.random() - 1;
  var r = u * u + v * v;
  if (r == 0 || r > 1) {
    return gaussRandom();
  }
  var c = Math.sqrt(-2 * Math.log(r) / r);
  gaussRandom.vVal = v * c; // cache this
  gaussRandom.returnV = true;
  return u * c;
}
gaussRandom.returnV = false;
gaussRandom.vVal = 0;
//# sourceMappingURL=random.js.map