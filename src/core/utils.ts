/**
 * flat-map an array.
 */
export function flatMap<T, U>(arr: T[], f: (x: T, i: number) => U[]): U[] {
  return arr.reduce((out, x, i) => {
    out.push(...f(x, i));
    return out;
  }, [] as U[]);
}

/**
 * Generate a random in [0, 1) with mean 0.5 and approximately normally distributed
 */
export function zrand(iter: number = 6): number {
  let rand = 0;
  for (let i = 0; i < iter; ++i) {
    rand += Math.random();
  }
  return rand / 6;
}
