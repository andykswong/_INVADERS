import { mat4, Mat4, quat, ReadonlyVec3, transform, vec3, Vec3, Vec4 } from 'munum';
import { Camera } from './camera';
import { MeshInstance } from './mesh';
import { Body } from './physics';

const UNIT_SCALE: ReadonlyVec3 = [1, 1, 1];

/**
 * A 3d node hierarchy.
 */
export class Node {
  /** A floating-point 4x4 model (world) transformation matrix. Derived from parent and local TR transformation. */
  public m: Mat4 = mat4.create();

  /** The node's translation along the x, y, and z axes. */
  public t: Vec3 = vec3.create();

  /** The node's unit quaternion rotation. */
  public r: Vec4 = quat.create();

  /** Whether to hide this node. */
  public hide?: boolean;

  /** Camera attached to this node. */
  public cam?: Camera;

  /** Mesh attached to this node. */
  public mesh?: MeshInstance;

  /** Physics body for this node. */
  public body?: Body;

  /**
   * This node's children.
   * To append a child, set child's parent to this node.
   */
  public readonly child: Node[] = [];

  /** This node's parent. */
  public readonly parent: Node | null;

  public constructor(parent: Node | null = null) {
    (this.parent = parent) && parent.child.push(this);
  }

  /**
   * Detach itself from parent.
   */
  public detach(): void {
    if (this.parent) {
      const siblings = this.parent.child;
      const i = siblings.indexOf(this);
      if (i >= 0) {
        siblings[i] = siblings[siblings.length - 1];
        siblings.pop();
      }
    }
  }

  /**
   * Update the transforms of this node hierarchy.
   */
  public update(dt: number): void {
    if (this.hide) { return; }

    this.body && vec3.copy(this.body.pos, this.t);

    transform(this.t, this.r, UNIT_SCALE, this.m);
    this.parent && mat4.mul(this.parent.m, this.m, this.m);

    this.mesh && (this.mesh.m = this.m);
    this.cam && this.cam.update(this.m);

    for (const node of this.child) {
      node.update(dt);
    }
  }
}

/**
 * Traverse a node hierarchy.
 */
export function traverse(node: Node, callback: (node: Node) => void): void {
  if (node.hide) { return; }

  callback(node);
  for (const child of node.child) {
    traverse(child, callback);
  }
}
