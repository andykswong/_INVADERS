/**
 * Instanced Blinn-Phong fragment shader.
 * t = texture
 * p = camera pos
 * f = fog color
 * vPos = vertex position
 * vUv = UV coord
 * vC = tint color
 */
export const raw = `#extension GL_OES_standard_derivatives : require
precision mediump float;
uniform vec3 p;
uniform vec4 f;
varying vec3 vPos;
varying vec4 vC;

void main () {
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 l = normalize(vec3(-1., -2., -1.));
  vec3 v = normalize(p - vPos);
  vec3 h = normalize(l + v);
  float lc = mix(min(max(dot(n, l), 0.) + pow(max(dot(n, h), 0.), abs(vC.a)), 1.), 1., abs(vC.a) * step(0., -vC.a));

  float fa = max(smoothstep(10., 70., length(p - vPos)), max(smoothstep(15., 22., abs(vPos.x)), smoothstep(45., 60., abs(vPos.z))));
  gl_FragColor = vec4(mix(vC.rgb * max(lc, .25), f.xyz, fa), 1.);
}
`;

/**
 * Minified Blinn-Phong fragment shader.
 * @see http://ctrl-alt-test.fr/minifier/index
 */
export default `#extension GL_OES_standard_derivatives:require
precision mediump float;uniform vec3 p;uniform vec4 f;varying vec3 vPos;varying vec4 vC;void main(){vec3 v=normalize(cross(dFdx(vPos),dFdy(vPos))),s=normalize(vec3(-1.,-2.,-1.)),a=normalize(p-vPos),w=normalize(s+a);float m=mix(min(max(dot(v,s),0.)+pow(max(dot(v,w),0.),abs(vC.w)),1.),1.,abs(vC.w)*step(0.,-vC.w)),r=max(smoothstep(10.,70.,length(p-vPos)),max(smoothstep(15.,22.,abs(vPos.x)),smoothstep(45.,60.,abs(vPos.z))));gl_FragColor=vec4(mix(vC.xyz*max(m,.25),f.xyz,r),1.);}`;
