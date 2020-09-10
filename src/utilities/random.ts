/**
 * Returns a random float between given min and max bounds (inclusive)
 * @param min Minimum value of the ranfom float
 * @param max Maximum value of the random float
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Complicated math. All you need to know is that it returns a random number.
 * More info: https://en.wikipedia.org/wiki/Normal_distribution
 */
export function gaussRandom(): number {
  if (gaussRandom.returnV) {
    gaussRandom.returnV = false;
    return gaussRandom.vVal;
  }
  const u = 2 * Math.random() - 1;
  const v = 2 * Math.random() - 1;
  const r = u * u + v * v;
  if (r === 0 || r > 1) {
    return gaussRandom();
  }
  const c = Math.sqrt((-2 * Math.log(r)) / r);
  gaussRandom.vVal = v * c; // cache this
  gaussRandom.returnV = true;
  return u * c;
}

/**
 * Returns a random integer between given min and max bounds
 * @param min Minimum value of the random integer
 * @param max Maximum value of the random integer
 */
export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * If you know what this is: https://en.wikipedia.org/wiki/Normal_distribution
 * @param mu 
 * @param std 
 */
export function randomN(mu: number, std: number) {
  return mu + gaussRandom() * std;
}

gaussRandom.returnV = false;
gaussRandom.vVal = 0;