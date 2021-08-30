import { addMesh } from '../core/graphics';
import { mesh } from '../core/mesh';
import { device } from '../device';
import { coil, eyeball, eyeball2, foot, ground, wand, watcher, wing } from './geometries';

export const Meshes = {
  ground: addMesh(mesh(device, ground, 8)),
  watcher: addMesh(mesh(device, watcher)),
  eye: addMesh(mesh(device, eyeball, 256)),
  eye2: addMesh(mesh(device, eyeball2, 256)),
  wing: addMesh(mesh(device, wing, 256)),
  foot: addMesh(mesh(device, foot, 256)),
  wand: addMesh(mesh(device, wand, 8)),
  coil: addMesh(mesh(device, coil, 8)),
};
