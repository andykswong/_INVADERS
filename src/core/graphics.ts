import { Buffer, Pipeline, RenderPassContext } from 'mugl';
import { array, lerp, mat4, Mat4, ReadonlyMat4, ReadonlyVec3, ReadonlyVec4, Vec3, vec3 } from 'munum';
import { Camera } from './camera';
import { COMPONENTS_PER_MESH_INSTANCE, Mesh, MeshInstance } from './mesh';
import meshVertSrc from './shaders/mesh.vert';
import meshFragSrc from './shaders/mesh.frag';
import particleVertSrc from './shaders/particle.vert';
import particleFragSrc from './shaders/particle.frag';
import { SKY_COLOR } from '../const';
import { device } from '../device';
import { canvas } from '../dom';

export const COMPONENTS_PER_PARTICLE = 12;

const I: ReadonlyMat4 = mat4.create();
const vp: Mat4 = mat4.create();
const tmpV3: Vec3 = vec3.create();

const pipeline: Pipeline = device.pipeline({
  vert: device.shader({ type: 35633, source: meshVertSrc }),
  frag: device.shader({ type: 35632, source: meshFragSrc }),
  buffers: [{
    attrs: [
      { name: 'pos', format: 768 /* Vec3 */ },
      { name: 'c', format: 1024 /* Vec4 */ },
    ]
  }, {
    attrs: [
      { name: 'm1', format: 1024 /* Vec4 */ },
      { name: 'm2', format: 1024 /* Vec4 */ },
      { name: 'm3', format: 1024 /* Vec4 */ },
      { name: 'm4', format: 1024 /* Vec4 */ },
    ],
    instanced: true
  },],
  uniforms: [
    { name: 'vp', valueFormat: 35676 /* Mat4 */ },
    { name: 'p', valueFormat: 35665 /* Vec3 */ },
    { name: 'f', valueFormat: 35666 /* Vec4 */ },
  ],
  depth: { compare: 515 /* Lequal */, write: true }
});

const particlePipeline: Pipeline = device.pipeline({
  vert: device.shader({ type: 35633, source: particleVertSrc }),
  frag: device.shader({ type: 35632, source: particleFragSrc }),
  buffers: [{
    attrs: [
      { name: 'p', format: 768 /* Vec3 */ },
      { name: 'v', format: 768 /* Vec3 */ },
      { name: 't', format: 256 /* Float */ },
      { name: 's', format: 256 /* Float */ },
      { name: 'c', format: 1024 /* Vec4 */ },
    ]
  }],
  uniforms: [
    { name: 'vp', valueFormat: 35676 /* Mat4 */ },
    { name: 'vw' },
    { name: 'ct' }
  ],
  depth: { compare: 515 /* Lequal */, write: false },
  blend: {
    srcFactorRGB: 770, // BlendFactor.SrcAlpha
    srcFactorAlpha: 1, // BlendFactor.One
    dstFactorRGB: 771, // BlendFactor.OneMinusSrcAlpha
    dstFactorAlpha: 771, // BlendFactor.OneMinusSrcAlpha
  },
  mode: 0
});

const meshes: Mesh[] = [];
const particleGroups: { start: number, time: number, data: Float32Array }[] = [];
const particleData = new Float32Array(COMPONENTS_PER_PARTICLE * 6144);
const particleBuffer: Buffer = device.buffer({ usage: 35040 /* Stream */, size: particleData.byteLength });

/**
 * Registers a mesh.
 */
export function addMesh(mesh: Mesh): number {
  meshes.push(mesh);
  return meshes.length - 1;
}

/**
 * Render meshes using the given camera.
 */
export function renderMesh(ctx: RenderPassContext, camera: Camera, instances: MeshInstance[]): void {
  mat4.mul(camera.proj, camera.view, vp);

  for (const mesh of meshes) {
    mesh.iCount = 0;
  }

  instances.sort((a, b) => a.id - b.id);
  for (const instance of instances) {
    const mesh = meshes[instance.id];
    array.copy(instance.m || I, mesh.iData, 0, (mesh.iCount++) * COMPONENTS_PER_MESH_INSTANCE);
  }

  ctx.pipeline(pipeline)
    .uniforms([
      { name: 'vp', values: vp },
      { name: 'p', values: camera.pos },
      { name: 'f', values: SKY_COLOR },
    ]);

  for (const mesh of meshes) {
    if (!mesh.iCount) { continue; }
    mesh.iattr.data(mesh.iData);
    ctx
      .vertex(0, mesh.attr)
      .vertex(1, mesh.iattr)
      .index(mesh.idx)
      .drawIndexed(mesh.count, mesh.iCount);
  }
}

/**
 * Add particles to render.
 */
export function addParticles(count: number, time: number, maxLife: number, size: number, minPos: ReadonlyVec3, maxPos: ReadonlyVec3, minVec: ReadonlyVec3, maxVec: ReadonlyVec3, color: ReadonlyVec4): void {
  const data = new Float32Array(COMPONENTS_PER_PARTICLE * count);
  for (let i = 0, c = 0; c < count; ++c) {
    for (let j = 0; j < 3; ++j) {
      tmpV3[j] = lerp(minPos[j], maxPos[j], Math.random());
    }
    array.copy(tmpV3, data, 0, i, 3); i += 3;
    for (let j = 0; j < 3; ++j) {
      tmpV3[j] = lerp(minVec[j], maxVec[j], Math.random());
    }
    array.copy(tmpV3, data, 0, i, 3); i += 3;
    data[i++] = Math.max(0.01, Math.random()) * maxLife;
    data[i++] = size;
    array.copy(color, data, 0, i, 4); i += 4;
  }
  particleGroups.push({
    start: 0,
    time,
    data
  });
}

/**
 * Render particles using the given camera.
 */
export function renderParticles(ctx: RenderPassContext, camera: Camera, time: number): void {
  if (!particleGroups.length) return;

  mat4.mul(camera.proj, camera.view, vp);
  ctx.pipeline(particlePipeline)
    .vertex(0, particleBuffer)
    .uniforms([
      { name: 'vp', values: vp },
      { name: 'vw', value: canvas.width },
      { name: 'ct', value: time }
    ]);

  let count = 0;
  for (let i = 0; i < particleGroups.length;) {
    const inst = particleGroups[i];
    if (!inst.start) {
      inst.start = time;
    }
    if (time > inst.start + inst.time) {
      particleGroups[i] = particleGroups[particleGroups.length - 1];
      particleGroups.pop();
      continue;
    }
    if (count + inst.data.length <= particleData.length) {
      array.copy(inst.data, particleData, 0, count, inst.data.length);
      count += inst.data.length;
    }

    ++i;
  }

  particleBuffer.data(particleData);
  ctx.draw(count / COMPONENTS_PER_PARTICLE);
}
