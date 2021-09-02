/**
 * Particle vertex shader.
 * vp = view-projection matrix
 * vw = viewport width
 * ct = current time
 * p = position
 * v = velocity
 * t = lifetime
 * s = size
 * c = color
 */
export const raw = `
uniform mat4 vp;
uniform float vw, ct;

attribute vec4 p, v, c;
attribute float t, s;
varying vec4 vC;

void main () {
  vC = vec4(c.rgb, c.a * (1. - mod(ct, t) / t / 2.));
  gl_Position = vp * vec4((p + mod(ct, t) * v).xyz, 1.);
  gl_PointSize = vw / gl_Position.w * (1. - mod(ct, t) / t) * s;
}
`;

/**
 * Minified particle vertex shader.
 * @see http://ctrl-alt-test.fr/minifier/index
 */
export default 'uniform mat4 vp;uniform float vw,ct;attribute vec4 p,v,c;attribute float t,s;varying vec4 vC;void main(){vC=vec4(c.xyz,c.w*(1.-mod(ct,t)/t/2.)),gl_Position=vp*vec4((p+mod(ct,t)*v).xyz,1.),gl_PointSize=vw/gl_Position.w*(1.-mod(ct,t)/t)*s;}';
