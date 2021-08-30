import { Buffer, BufferType, RenderingDevice, Usage } from 'mugl';
import { Mat4 } from 'munum';
import { Geometry } from './procedural';
import { flatMap } from './utils';

export const COMPONENTS_PER_MESH_INSTANCE = 16;

/**
 * A renderable mesh instance.
 */
export interface MeshInstance {
  /** Mesh Id. */
  id: number;

  /** Model matrix. */
  m?: Mat4;
}

/**
 * A renderable mesh.
 */
export interface Mesh {
  /** The mesh pos and uv attributes buffer. */
  attr: Buffer;

  /** The mesh index buffer. */
  idx: Buffer;

  /** The mesh instance attributes data. */
  iData: Float32Array;

  /** The mesh instance attributes buffer. */
  iattr: Buffer;

  /** The number of vertices to draw. */
  count: number;

  /** Instance count for the geometry. */
  iCount: number;
}

/**
 * Convert geometry to mesh.
 */
export function mesh(device: RenderingDevice, geo: Geometry, maxInstances: number = 128): Mesh {
  const attrData = new Float32Array(flatMap(geo.pos, (p, i) => [...p, ...geo.c[i]]));
  const iData = new Float32Array(COMPONENTS_PER_MESH_INSTANCE * maxInstances);
  const idxData = new Uint16Array(flatMap(geo.i, v => v));
  return {
    attr: device.buffer({ size: attrData.byteLength }).data(attrData),
    idx: device.buffer({ type: BufferType.Index, size: idxData.byteLength }).data(idxData),
    count: geo.i.length * 3,
    iData,
    iattr: device.buffer({ usage: Usage.Stream, size: iData.byteLength }),
    iCount: 0
  };
}
