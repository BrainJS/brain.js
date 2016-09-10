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
var returnV = false;
var vVal = 0.0;
function gaussRandom() {
  if (returnV) {
    returnV = false;
    return vVal;
  }
  var u = 2 * Math.random() - 1;
  var v = 2 * Math.random() - 1;
  var r = u * u + v * v;
  if (r == 0 || r > 1) {
    return gaussRandom();
  }
  var c = Math.sqrt(-2 * Math.log(r) / r);
  vVal = v * c; // cache this
  returnV = true;
  return u * c;
}
//# sourceMappingURL=random.js.map