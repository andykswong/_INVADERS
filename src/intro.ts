import { quat, vec3 } from 'munum';
import { MOON_COLOR, SILVER_COLOR } from './const';
import { addParticles } from './core/graphics';
import { Node } from './core/node';
import { Flier, Walker } from './enemies';
import { root } from './init';
import { Meshes } from './models/meshes';

// Setup sky and ground
addParticles(384, Infinity, 1, 4, [-32, 50, -52], [-30, 52, -50], [-.1, -.1, -.1], [.1, .1, .1], MOON_COLOR);
addParticles(384, Infinity, 7, 0.3, [-100, 10, -100], [100, 100, 100], [0, 0, 0], [0, 0, 0], SILVER_COLOR);
const ground = new Node(root);
ground.mesh = { id: Meshes.ground };

export const introNode = new Node(root);

const n = new Flier(introNode, 1, 0);
const n2 = new Flier(introNode, 0, 0);
const n3 = new Walker(introNode, 0, 0);
const n4 = new Walker(introNode, 1, 0);
vec3.set(n.body.pos, 4, 5, 32);
vec3.set(n2.body.pos, -7, 4, 30);
vec3.set(n3.body.pos, 3, 0, 20);
vec3.set(n4.body.pos, -2.5, 0, 28);
quat.fromAxisAngle([0, 1, 0], -Math.PI / 8, n.r);
quat.fromAxisAngle([0, 1, 0], Math.PI / 8, n2.r);
quat.fromAxisAngle([0, 1, 0], -Math.PI / 12, n3.r);
quat.fromAxisAngle([0, 1, 0], Math.PI / 12, n4.r);
