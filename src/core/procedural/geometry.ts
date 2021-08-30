import { Mat4, Vec2, vec3, Vec3, Vec4 } from 'munum';

/**
 * A mesh geometry.
 */
export interface Geometry {
  /** vec3 positions */
  pos: Vec3[];

  /** vec4 rgba color */
  c: Vec4[];

  /** uint16 indices for each tri */
  i: Vec3[];

  [attr: string]: (number | Vec2 | Vec3 | Vec4)[] | undefined;
}

/**
 * Apply transformation to a raw geometry.
 */
 export function trans(out: Geometry, model: Mat4): Geometry {
  for (const pos of out.pos) {
    vec3.mmul4(model, pos, pos);
  }
  return out;
}

/**
 * Merge 2 geometries into out.
 */
export function merge(out: Geometry, geo: Geometry): Geometry {
  const g1len = out.pos.length;
  for (const pos of geo.pos) {
    out.pos.push([...pos]);
  }
  for (const color of geo.c) {
    out.c.push([...color]);
  }
  for (const f of geo.i) {
    out.i.push([f[0] + g1len, f[1] + g1len, f[2] + g1len]);
  }
  return out;
}
