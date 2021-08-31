import { MOON_COLOR, SILVER_COLOR } from './const';
import { Camera } from './core/camera';
import { FpsControl } from './core/control';
import { addParticles } from './core/graphics';
import { Node } from './core/node';
import { Meshes } from './models/meshes';
import { attackBtn, canvas } from './dom';
import { Player } from './player';

// Init nodes

export const root = new Node();
export const enemies = new Node(root);
export const projectiles = new Node(root);

export const camera = new Camera();
export const control = new FpsControl(canvas, attackBtn);
export const player = new Player(root, camera, control);

// Setup sky and ground

addParticles(384, Infinity, 1, 4, [-32, 50, -52], [-30, 52, -50], [-.1, -.1, -.1], [.1, .1, .1], MOON_COLOR);
addParticles(384, Infinity, 7, .4, [-100, 10, -100], [100, 100, 100], [0, 0, 0], [0, 0, 0], SILVER_COLOR);

const ground = new Node(root);
ground.mesh = { id: Meshes.ground };
