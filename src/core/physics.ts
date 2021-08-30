import { aabb, AABB, clamp, Mat4, mat4, ReadonlyAABB, translate, vec3, Vec3 } from 'munum';
import { Node } from './node';

export interface Body {
  readonly node: Node;
  flag: number;
  readonly pos: Vec3;
  readonly v: Vec3;
  readonly shape: ReadonlyAABB;
  bound?: ReadonlyAABB;
}

export const MIN_BOUND = [-20, 0, -50] as const;
export const MAX_BOUND = [20, 50, 50] as const;
export const GRAVITY = [0, -15, 0] as const;

const tmpV: Vec3 = vec3.create();
const tmpMat: Mat4 = mat4.create();
const tmpAABB1: AABB = aabb.create();
const tmpAABB2: AABB = aabb.create();

/**
 * Physics simulation function.
 */
export function simulate(dt: number, bodies: Body[], hit?: (target: Body, by: Body) => void): void {
  // Integration
  for (const body of bodies) {
    if (body.flag & 1) {
      vec3.scale(GRAVITY, dt, tmpV);
      vec3.add(body.v, tmpV, body.v);
    }
    vec3.scale(body.v, dt, tmpV);
    vec3.add(body.pos, tmpV, body.pos);

    if (body.flag & 1) {
      for (let i = 0; i < 3; ++i) {
        body.pos[i] = clamp(body.pos[i], MIN_BOUND[i], MAX_BOUND[i]);
        body.bound && (body.pos[i] = clamp(body.pos[i], body.bound.min[i], body.bound.max[i]));
      }
      if (body.pos[1] === MIN_BOUND[1]) {
        body.v[1] = 0;
      }
    }
  }

  // Collision
  for (let i = 0; i < bodies.length; ++i) {
    if (!(bodies[i].flag & 0b10)) { continue; }
    aabb.transform(bodies[i].shape, translate(bodies[i].pos, tmpMat), tmpAABB1);

    for (let j = 0; j < bodies.length; ++j) {
      if (i == j) { continue; }
      aabb.transform(bodies[j].shape, translate(bodies[j].pos, tmpMat), tmpAABB2);

      if (intersect(tmpAABB1, tmpAABB2)) {
        hit?.(bodies[i], bodies[j]);
      }
    }
  }
}

export function intersect(a: ReadonlyAABB, b: ReadonlyAABB): boolean {
  for (let i = 0; i < 3; ++i) {
    if (a.max[i] <= b.min[i] || a.min[i] >= b.max[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Creates a physics body.
 */
export function body(node: Node, shape: ReadonlyAABB, gravity: boolean = true): Body {
  return {
    node,
    flag: 0b10 + (gravity ? 1 : 0),
    pos: [0, 0, 0],
    v: [0, 0, 0],
    shape
  };
}
