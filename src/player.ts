import { quat, vec3 } from 'munum';
import { Meshes } from './models/meshes';
import { PLAYER_ATTACK_TIME, PLAYER_BOUND, PLAYER_HP, PLAYER_SHAPE } from './const';
import { Camera } from './core/camera';
import { FpsControl } from './core/control';
import { Node } from './core/node';
import { body, Body } from './core/physics';
import { createProjectile } from './entities';

/**
 * A player entity.
 */
export class Player extends Node {
  public timer: number = 0;
  public body: Body;
  public arm: Node;

  private cn: Node;

  public constructor(
    parent: Node,
    camera: Camera,
    public control: FpsControl,
    public hp: number = PLAYER_HP
  ) {
    super(parent);
    this.body = body(this, PLAYER_SHAPE);
    this.body.bound = PLAYER_BOUND;

    this.arm = new Node(this);
    this.arm.mesh = { id: Meshes.wand };

    const camNode = this.cn = new Node(this);
    const cam = new Node(camNode);
    cam.cam = camera;
    vec3.set(cam.t, 0, 1.7, 0);
    quat.fromAxisAngle([0, 1, 0], Math.PI, cam.r);
  }

  public update(dt: number): void {
    this.control.update();

    let attack = false;
    this.timer = Math.max(0, this.timer - dt);
    if (!this.timer && this.control.atk) {
      this.timer = PLAYER_ATTACK_TIME;
      attack = true;
    }

    quat.rotateX(this.control.rotX, this.cn.r);
    quat.rotateY(this.control.rotY, this.r);

    const dir = this.control.dir;
    const v = this.body.v;

    v[0] = dir[0] * 10;
    v[1] = this.body.pos[1] && dir[1] ? 20 : v[1];
    v[2] = dir[2] * 10;

    super.update(dt);

    if (attack) {
      const v = vec3.create(0, 0, 25);
      quat.rotateVec3(quat.rotateVec3(v, this.cn.r, v), this.r, v);
      createProjectile(
        (this.arm.mesh!.id === Meshes.wand) ? 1 : 2,
        [this.m[12], this.m[13] + 1.7, this.m[14]],
        v
      );
    }

    const theta = this.timer ? (Math.sin(6 * (PLAYER_ATTACK_TIME - this.timer)) + 1) / 2 : 0;
    quat.fromAxisAngle([1, 0, 0], Math.max(Math.PI / 6, Math.PI / 3 * theta), this.arm.r);
    vec3.set(this.arm.t, -0.7, 1, 1 - .5 * theta);
  }
}
