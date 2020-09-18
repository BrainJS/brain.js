export function randomFloat(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

// Random numbers utils
export function gaussRandom(): number {
  if (returnV) {
    returnV = false;
    return vVal;
  }
  const u = 2 * Math.random() - 1;
  const v = 2 * Math.random() - 1;
  const r = u * u + v * v;
  if (r === 0 || r > 1) {
    return gaussRandom();
  }
  const c = Math.sqrt((-2 * Math.log(r)) / r);
  vVal = v * c; // cache this
  returnV = true;
  return u * c;
}

let returnV = false;
let vVal = 0;

export function randomInteger(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a) + a);
}

export function randomN(mu: number, std: number): number {
  return mu + gaussRandom() * std;
}
