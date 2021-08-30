import { ReadonlyVec4 } from 'munum';
import { Geometry } from './geometry';

/**
 * Create an empty geometry.
 */
 export function empty(): Geometry {
  return {
    pos: [],
    i: [],
    c: []
  };
}

/**
 * Create a box geometry.
 */
export function box(x: number, y: number, z: number, c: ReadonlyVec4): Geometry {
  return {
    pos: [
      [-x, +y, +z], [+x, +y, +z], [+x, -y, +z], [-x, -y, +z], // positive z face
      [+x, +y, -z], [-x, +y, -z], [-x, -y, -z], [+x, -y, -z], // negative z face
    ],
    i: [
      [2, 1, 0], [2, 0, 3], // positive z face
      [6, 5, 4], [6, 4, 7], // negative z face
      [7, 4, 1], [7, 1, 2], // positive x face
      [3, 0, 5], [3, 5, 6], // negative x face
      [1, 4, 5], [1, 5, 0], // positive y face
      [6, 7, 2], [3, 6, 2]  // negative y face
    ],
    c: Array(8).fill(c),
  };
}
