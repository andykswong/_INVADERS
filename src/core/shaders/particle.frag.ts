/**
 * Particle fragment shader.
 * vC = color
 */
export const raw = `
precision mediump float;
varying vec4 vC;

void main () {
  gl_FragColor = vec4(vC.rgb, smoothstep(1., 0., length(2. * gl_PointCoord.xy - vec2(1.))) * vC.a);
}
 `;

/**
 * Minified particle fragment shader.
 * @see http://ctrl-alt-test.fr/minifier/index
 */
export default 'precision mediump float;varying vec4 vC;void main(){gl_FragColor=vec4(vC.xyz,smoothstep(1.,0.,length(2.*gl_PointCoord.xy-vec2(1.)))*vC.w);}';
