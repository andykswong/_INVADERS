import { array, Mat4, mat4, perspective, vec3, Vec3 } from 'munum';

/**
 * A perspective camera.
 */
export class Camera {
  public readonly pos: Vec3 = vec3.create();
  public readonly view: Mat4 = mat4.create();
  public readonly proj: Mat4 = mat4.create();

  public constructor(
    public aspect: number = 1,
    public yfov: number = Math.PI / 4,
    public znear: number = 0.1,
    public zfar: number = 200
  ) {
  }

  /**
   * Update the view and proj matrices.
   */
  public update(model: Mat4): void {
    perspective(this.aspect, this.yfov, this.znear, this.zfar, this.proj);
    array.copy(model, this.pos, 12, 0, 3)
    mat4.invert(model, this.view);
  }
}
