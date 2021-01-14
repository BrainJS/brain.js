/**
 * mish activation
 */
export function activate(weight: number): number {
  return (
    (weight *
      (Math.exp(Math.log(1 + Math.exp(weight))) -
        Math.exp(-Math.log(1 + Math.exp(weight))))) /
    (Math.exp(Math.log(1 + Math.exp(weight))) +
      Math.exp(-Math.log(1 + Math.exp(weight))))
  );
}

/**
 * mish derivative
 */
export function measure(weight: number): number {
  const omega =
    Math.exp(3 * weight) +
    4 * Math.exp(2 * weight) +
    (6 + 4 * weight) * Math.exp(weight) +
    4 * (1 + weight);
  const delta = 1 + Math.pow(Math.exp(weight) + 1, 2);

  return (Math.exp(weight) * omega) / Math.pow(delta, 2);
}
