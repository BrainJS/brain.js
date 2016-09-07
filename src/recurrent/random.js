export function randomF(a, b) {
  return Math.random() * (b - a) + a;
}

export function randomI(a, b) {
  return Math.floor(Math.random() * (b - a) + a);
}

export function randomN(mu, std) {
  return mu + gaussRandom() * std;
}

// Random numbers utils
let returnV = false;
let vVal = 0.0;
function gaussRandom() {
  if(returnV) {
    returnV = false;
    return vVal;
  }
  let u = 2 * Math.random()-1;
  let v = 2 * Math.random()-1;
  let r = u * u + v * v;
  if(r == 0 || r > 1) {
    return gaussRandom();
  }
  let c = Math.sqrt(-2 * Math.log(r) / r);
  vVal = v * c; // cache this
  returnV = true;
  return u * c;
}
