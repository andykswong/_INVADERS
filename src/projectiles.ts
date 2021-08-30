import { aabb, ReadonlyVec4 } from 'munum';
import { Node } from './core/node';
import { addParticles } from './core/graphics';
import { body } from './core/physics';
import { playShoot } from './audio';

export const PROJECTILE_TTL = 10;

export class Projectile extends Node {
  public dt: number = 0;
  public i: number = 0;

  public constructor(
    parent: Node,
    public c: ReadonlyVec4,
    public p: boolean,
    public s: number = 1,
    public hp: number = 1
  ) {
    super(parent);
    const ns = Math.max(1, s / 2);
    this.body = body(this, aabb.create([-.5 * ns, -.5 * ns, -.5 * ns], [.5 * ns, .5 * ns, .5 * ns]), false);
    p && playShoot();
  }

  public update(t: number, dt: number): void {
    super.update(t, dt);

    if (++this.i % 2) {
      addParticles(16, 0.05 * this.s, 0.1 * this.s, .3 * this.s,
        [this.body!.pos[0] - .2, this.body!.pos[1] - .2, this.body!.pos[2] - .2],
        [this.body!.pos[0] + .2, this.body!.pos[1] + .2, this.body!.pos[2] + .2],
        [Math.min(0, -this.body!.v[0]) - 5 * this.s, Math.min(0, -this.body!.v[1]) - 5 * this.s, Math.min(0, -this.body!.v[1]) - 5 * this.s],
        [Math.max(0, -this.body!.v[0]) + 5 * this.s, Math.max(0, -this.body!.v[1]) + 5 * this.s, Math.max(0, -this.body!.v[1]) + 5 * this.s],
        this.c
      );
    }

    if ((this.dt += dt) >= PROJECTILE_TTL || this.m[13] < 0 || this.m[14] < -50 || this.m[14] > 50) {
      this.detach();
    }
  }

  public detach(): void {
    super.detach();
    addParticles(32, 0.2, 0.4, .2 * this.s,
      [this.body!.pos[0] - .2, this.body!.pos[1] - .2, this.body!.pos[2] - .2],
      [this.body!.pos[0] + .2, this.body!.pos[1] + .2, this.body!.pos[2] + .2],
      [-10 * this.s, -10 * this.s, -10 * this.s], [10 * this.s, 10 * this.s, 10 * this.s],
      this.c
    );
  }
}
