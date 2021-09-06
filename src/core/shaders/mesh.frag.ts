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
precision highp float;
uniform vec3 p;
uniform vec4 f;
varying vec3 vPos;
varying vec4 vC;

void main () {
  vec3 l = -vec3(.41, .82, .41);
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 h = normalize(l + normalize(p - vPos));
  float lc = mix(min(max(dot(n, l), 0.) + pow(max(dot(n, h), 0.), abs(vC.a)), 1.), 1., abs(vC.a) * step(0., -vC.a));

  float fa = max(smoothstep(10., 80., length(p - vPos)), max(smoothstep(18., 22., abs(vPos.x)), smoothstep(50., 60., abs(vPos.z))));
  gl_FragColor = vec4(mix(vC.rgb * max(lc, .25), f.xyz, fa), 1.);
}
`;

/**
 * Minified Blinn-Phong fragment shader.
 * @see http://ctrl-alt-test.fr/minifier/index
 */
export default `#extension GL_OES_standard_derivatives:require
precision highp float;uniform vec3 p;uniform vec4 f;varying vec3 vPos;varying vec4 vC;void main(){vec3 v=-vec3(.41,.82,.41),m=normalize(cross(dFdx(vPos),dFdy(vPos))),s=normalize(v+normalize(p-vPos));float d=mix(min(max(dot(m,v),0.)+pow(max(dot(m,s),0.),abs(vC.w)),1.),1.,abs(vC.w)*step(0.,-vC.w)),a=max(smoothstep(10.,80.,length(p-vPos)),max(smoothstep(18.,22.,abs(vPos.x)),smoothstep(50.,60.,abs(vPos.z))));gl_FragColor=vec4(mix(vC.xyz*max(d,.25),f.xyz,a),1.);}`;
