import { array, Mat4, mat4, perspective, vec3, Vec3 } from 'munum';

/**
 * A perspective camera.
 */
export class Camera {
  public readonly pos: Vec3 = vec3.create();
  public readonly view: Mat4 = mat4.create();
  public readonly proj: Mat4 = mat4.create();

  public aspect: number = 1;
  public yfov: number = Math.PI / 4;
  public znear: number = 0.1;
  public zfar: number = 200;

  /**
   * Update the view and proj matrices.
   */
  public update(model: Mat4): void {
    perspective(this.aspect, this.yfov, this.znear, this.zfar, this.proj);

    // Normally we need to invert the model matrix using: mat4.invert(model, this.view);
    // But mat4.invert() is 800+ bytes in size.
    // We can exploit the fact that the model matrix A is affine with rotation + translation only:
    // A = [R  t]
    //     [0  1]
    // Then the inverse is simply:
    // inv(A) = [inv(R)  -inv(R) * t] = [tr(R)  tr(R) * -t]
    //          [  0           1    ]   [  0         1    ]
    // This saves 200 bytes after zip and is faster.
    mat4.tr(model, this.view);
    this.view[3] = this.view[7] = this.view[11] = 0;
    array.copy(
      vec3.mmul4(this.view, vec3.scale(array.copy(model, this.pos, 12, 0, 3) as Vec3, -1)),
      this.view, 0, 12, 3);
  }
}
