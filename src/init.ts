import { Camera } from './core/camera';
import { Node } from './core/node';
import { FpsControl } from './core/control';
import { canvas } from './dom';
import { Player } from './player';

let updateFn: (t: number, dt: number) => void = () => {};
export function update(fn: (t: number, dt: number) => void): void {
  updateFn = fn;
}

let lastTime = 0;
requestAnimationFrame(loop);
function loop(t: number) {
  requestAnimationFrame(loop);
  const dt = lastTime ? t - lastTime : 0;
  lastTime = t;
  updateFn(t / 1000, dt / 1000);
}

// Init nodes
export const root = new Node();

export const camera = new Camera();
function resizeCanvas() {
  camera.aspect = (canvas.width = innerWidth) / (canvas.height = innerHeight);
}
addEventListener('resize', resizeCanvas);
resizeCanvas();

export const control = new FpsControl(canvas);
export const player = new Player(root, camera, control);
export const enemies = new Node(root);
export const projectiles = new Node(root);
