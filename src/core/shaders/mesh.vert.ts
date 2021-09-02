/**
 * Instanced Mesh vertex shader.
 * vp = view-projection matrix
 * m1/m2/m3/m4 = model matrix
 * pos = vertex position
 * c = color
 */
export const raw = `
uniform mat4 vp;
attribute vec4 pos, c, m1, m2, m3, m4;
varying vec3 vPos;
varying vec4 vC;

void main() {
  vec4 p = mat4(m1, m2, m3, m4) * pos;
  vPos = p.xyz;
  vC = c;
  gl_Position = vp * p;
}`;

/**
 * Minified mesh vertex shader.
 * @see http://ctrl-alt-test.fr/minifier/index
 */
export default 'uniform mat4 vp;attribute vec4 pos,c,m1,m2,m3,m4;varying vec3 vPos;varying vec4 vC;void main(){vec4 v=mat4(m1,m2,m3,m4)*pos;vPos=v.xyz;vC=c;gl_Position=vp*v;}';
