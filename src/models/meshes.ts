import { addMesh } from '../core/graphics';
import { mesh } from '../core/mesh';
import { device } from '../device';
import { coil, eyeball, eyeball2, foot, ground, wand, watcher, wing } from './geometries';

export const Meshes = {
  ground: addMesh(mesh(device, ground, 16)),
  watcher: addMesh(mesh(device, watcher, 256)),
  eye: addMesh(mesh(device, eyeball, 256)),
  eye2: addMesh(mesh(device, eyeball2, 256)),
  wing: addMesh(mesh(device, wing, 512)),
  foot: addMesh(mesh(device, foot, 512)),
  wand: addMesh(mesh(device, wand, 16)),
  coil: addMesh(mesh(device, coil, 16)),
};
