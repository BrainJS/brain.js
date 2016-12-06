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
function gaussRandom() {
  if (gaussRandom.returnV) {
    gaussRandom.returnV = false;
    return gaussRandom.vVal;
  }
  let u = 2 * Math.random() - 1;
  let v = 2 * Math.random() - 1;
  let r = u * u + v * v;
  if (r == 0 || r > 1) {
    return gaussRandom();
  }
  let c = Math.sqrt(-2 * Math.log(r) / r);
  gaussRandom.vVal = v * c; // cache this
  gaussRandom.returnV = true;
  return u * c;
}
gaussRandom.returnV = false;
gaussRandom.vVal = 0;
