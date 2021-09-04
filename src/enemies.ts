import { clamp, quat, ReadonlyAABB, vec3 } from 'munum';
import { FLIER_SHAPE, WALKER_SHAPE, WATCHER_SHAPE } from './const';
import { Node } from './core/node';
import { body, Body } from './core/physics';
import { createProjectile } from './entities';
import { player } from './init';
import { Meshes } from './models/meshes';
import { createDestructionParticles } from './particles';

/**
 * An enemy entity.
 */
export class Enemy extends Node {
  protected animTimer: number = 0;
  protected atkTimer: number = 0;
  public body: Body;

  public constructor(
    parent: Node,
    public id: number,
    public type: number,
    shape: ReadonlyAABB,
    gravity: boolean,
    protected atk: number
  ) {
    super(parent);
    this.body = body(this, shape, gravity);
  }

  public update(dt: number): void {
    super.update(dt);

    this.animTimer = (this.animTimer + dt) % (Math.PI * 2);
    this.atkTimer = Math.max(0, this.atkTimer - dt);
    if (this.id && !this.atkTimer && Math.random() < dt / 10 * this.type) {
      this.atkTimer = this.atk;
      this.shoot();
    }
  }

  /**
   * Shoot projectile.
   */
  public shoot(): void {}

  public detach(): void {
    super.detach();
    createDestructionParticles(this);
  }
}

/**
 * Walker class enemy.
 */
export class Walker extends Enemy {
  public constructor(
    parent: Node,
    id: number,
    private eyeType: number = 0,
  ) {
    super(parent, id, 1 + eyeType, WALKER_SHAPE, true, 5);

    const eye = new Node(this);
    eye.mesh = { id: eyeType ? Meshes.eye2 : Meshes.eye };
    const foot1 = new Node(this);
    foot1.mesh = { id: Meshes.foot };
    const foot2 = new Node(this);
    foot2.mesh = { id: Meshes.foot };
  }

  public update(dt: number): void {
    const theta = -3 * this.animTimer;
    vec3.set(this.child[0].t, 0, -.1 * Math.cos(2 * theta), 0);
    vec3.set(this.child[1].t, -.35, Math.max(.1, .1 * (1 + Math.sin(theta))), .25 + .1 * Math.cos(theta));
    vec3.set(this.child[2].t, .35, Math.max(.1, .1 * (1 + Math.sin(theta + Math.PI))), .25 + .1 * Math.cos(theta + Math.PI));

    super.update(dt);
  }

  public shoot(): void {
    if (this.eyeType) {
      createProjectile(3, [this.m[12], this.m[13] + 1, this.m[14]], [0, 0, 10]);
    }
  }
}

/**
 * Flier class enemy.
 */
export class Flier extends Enemy {
  public root: Node;

  public constructor(
    parent: Node,
    id: number,
    private eyeType: number = 0,
  ) {
    super(parent, id, 3 + eyeType, FLIER_SHAPE, false, 3);
    const mesh = this.root = new Node(this);
    mesh.mesh = { id: eyeType ? Meshes.eye2 : Meshes.eye };
    const wing1 = new Node(mesh);
    wing1.mesh = { id: Meshes.wing };
    const wing2 = new Node(mesh);
    wing2.mesh = { id: Meshes.wing };
  }

  public update(dt: number): void {
    const theta = Math.abs(Math.sin(-3 * this.animTimer));
    vec3.set(this.root.t, 0, 3 - Math.cos(theta), 0);
    quat.rotateAxis([1, 0, 0], clamp(Math.atan2(this.m[13] + 2 - player.m[13], player.m[14] - this.m[14] + .5), 0, Math.PI / 3), this.root.r);
    quat.rotateAxis([0, 1, 0], -Math.PI * theta / 3, this.root.child[0].r);
    quat.rotateAxis([0, 1, 0], Math.PI * (1 + theta / 3), this.root.child[1].r);

    super.update(dt);
  }

  public shoot(): void {
    if (this.eyeType) {
      const v = vec3.create(0, 0, 10);
      quat.rotateVec3(this.root.r, v, v);
      createProjectile(3, [this.m[12], this.m[13] + 3, this.m[14]], v);
    }
  }
}

/**
 * Watcher class enemy.
 */
export class Watcher extends Enemy {
  public constructor(
    parent: Node,
    id: number,
  ) {
    super(parent, id, 5, WATCHER_SHAPE, true, 0);
    this.mesh = { id: Meshes.watcher };
  }
  
  public shoot(): void {
    createProjectile(4, [this.m[12], this.m[13] + 1, this.m[14]], [0, 0, 50]);
  }
}
