import { vec3 } from 'munum';
import { traverse } from './core/node';
import { renderMesh, renderParticles } from './core/graphics';
import { MeshInstance } from './core/mesh';
import { Body, simulate } from './core/physics';
import { zrand } from './core/utils';
import { device, pass } from './device';
import { beginnerBtn, coilIcon, crosshair, health, hitOverlay, nav, scoreText } from './dom';
import { camera, control, enemies, player, projectiles, root, update } from './init';
import { Player } from './player';
import { playHit, playMusic } from './audio';
import { introNode } from './intro';
import { Projectile } from './projectiles';
import { Enemy, Flier, Walker, Watcher } from './enemies';
import { BEGINNER_BOSS_COUNT, ENEMY_WAVE_COUNTDOWN, PLAYER_HP, PLAYER_MAX_HP, PLAYER_POS_Z, WAVE_CYCLE, WAVE_GENERATOR_MAX_ITER } from './const';
import { Meshes } from './models/meshes';
import { highscore, maxWave, save } from './save';
import { BeginnerWaves, BossWaves, Wave, WaveRow } from './waves';

const bodies: Body[] = [];
const meshes: MeshInstance[] = [];

let ingame = false, hasCoil = false, beginner = true;
let score = 0, wave = 0, nextWaveCountdown = 0;
let flyDir = -1.5, flyForward = 0;

((document as any).monetization as HTMLElement)?.addEventListener('monetizationstart', () => {
  hasCoil = true;
  player.arm.mesh!.id = Meshes.coil;
  coilIcon.style.opacity = '1';
});

export function toggleBeginner(value: boolean = !beginner): void {
  beginnerBtn.innerText = `${(beginner = value) ? '☑' : '☐'} BEGINNER`;
}

export function startGame(): void {
  ingame = true;
  score = 0;
  wave = -1;
  player.hp = PLAYER_HP + (hasCoil ? 1 : 0);
  introNode.hide = true;
  crosshair.style.display = 'flex';
  nav.style.display = 'none';
  !control.touch && addEventListener('mouseup', resumeControl);
  resumeControl();
  checkWaveEnd();
  playMusic();
}

function resumeControl(): void {
  control.start();
}

export function endGame(): void {
  ingame = false;
  vec3.set(player.body!.pos, 0, 0, PLAYER_POS_Z);
  vec3.set(player.body!.v, 0, 0, 0);
  control.reset();
  projectiles.child.length = enemies.child.length = 0;
  introNode.hide = false;
  crosshair.style.display = 'none';
  nav.style.display = 'flex';
  health.innerText = '';
  save(score, wave);
  scoreText.innerText = `HISCORE ${highscore}`;
  toggleBeginner(maxWave < BeginnerWaves.length);
  !control.touch && removeEventListener('mouseup', resumeControl);
}
endGame();

update((t: number, dt: number): void => {
  if (ingame) {
    updateEnemy(dt);
    
    health.innerText = (player.hp > 0 ? `HP ${Array(player.hp|0).fill('⬤').join(' ')}` : '');
    scoreText.innerText = `SCORE ${score}`;
    if (player.hp <= 0) {
      endGame();
    }
  }

  bodies.length = meshes.length = 0;
  traverse(root, (node) => {
    node.body && bodies.push(node.body);
    node.mesh && meshes.push(node.mesh);
  });

  simulate(dt, bodies, hit);
  root.update(t, dt);

  const ctx = device.render(pass);
  renderMesh(ctx, camera, meshes);
  renderParticles(ctx, camera, t);
  ctx.end();
});

function playerHit(): void {
  hitOverlay.classList.add('hit');
  setTimeout(() => hitOverlay.classList.remove('hit'), 100);
}

function hit(target: Body, by: Body): void {
  const targetNode = target.node;
  const byNode = by.node;
  if (byNode instanceof Projectile) {
    if (!byNode.p && targetNode instanceof Player) {
      targetNode.hp -= byNode.hp;
      playHit();
      playerHit();
      byNode.detach();
    } else if (byNode.p && targetNode instanceof Enemy) {
      if ((targetNode.hp -= byNode.hp) <= 0) {
        targetNode.detach();
      }
      playHit();
      byNode.detach();
      checkWaveEnd();
      player.timer = 0;
      score++;
    } else if (targetNode instanceof Projectile && targetNode.p !== byNode.p) {
      targetNode.detach();
      byNode.detach();
      playHit();
      player.timer = 0;
    }
  } else if (byNode instanceof Enemy && targetNode instanceof Player) {
    targetNode.hp--;
    playHit();
    playerHit();
    byNode.detach();
    checkWaveEnd();
  }
}

function createEnemy(id: number): Enemy {
  return (
    id < 3 ? new Walker(enemies, id & 1) :
    id < 5 ? new Flier(enemies, id & 1) :
    new Watcher(enemies)
  );
}

function checkWaveEnd(): void {
  if (!enemies.child.length) {
    nextWaveCountdown = ENEMY_WAVE_COUNTDOWN;
    ++wave;
    if (beginner && wave === BeginnerWaves.length) {
      player.hp = 5;
    } else if (wave && !(wave % WAVE_CYCLE)) {
      player.hp = Math.min(PLAYER_MAX_HP, player.hp + 2);
    }
  }
}

function generateWave(): Wave {
  const data: WaveRow[][] = [];
  for (let z = 0; z < 5; ++z) {
    const slice: WaveRow[] = [];
    for (let y = 0; y < 4; ++y) {
      slice.push([]);
    }
    data.push(slice);
  }

  const count = 22 + Math.min(33, ((wave + 5) * Math.random()) | 0);
  for (let i = 0, iter = 0; i < count && iter < WAVE_GENERATOR_MAX_ITER; ++iter) {
    const z = (5 * zrand(2)) | 0;
    const y = (4 * zrand()) | 0;
    const x = (11 * (Math.random() < .4 ? Math.random() : zrand())) | 0;
    if (data[z][y][x]) { continue; }

    const rand = Math.random();
    data[z][y][x] =
      (rand < .05) ? 5 :
      (rand < .15) ? 1 :
      (rand < .3) ? 2 :
      (rand < .65) ? 3 : 4;

    ++i;
  }

  return data;
}

function populateWave(): void {
  const data =
    (beginner && wave < BeginnerWaves.length) ? BeginnerWaves[wave] :
    (wave % WAVE_CYCLE === WAVE_CYCLE - 1) ?
      BossWaves[((wave < WAVE_CYCLE ? BEGINNER_BOSS_COUNT : BossWaves.length) * Math.random()) | 0] :
    generateWave();
  for (let z = 0; z < data.length; ++z) {
    for (let y = 0; y < data[z].length; ++y) {
      for (let x = 0; x < 11; ++x) {
        const id = data[z][data[z].length - y - 1][x];
        if (!id) { continue; }

        const enemy = createEnemy(id);
        vec3.set(enemy.body.pos, (x - 5) * 3, y * 3 + (id < 3 || id === 5 ? 20 : 0), Math.min(9, (wave / 2) | 0) - z * 6 - y);

        id < 3 && vec3.set(enemy.body.v, 0, 0, 1);
      }
    }
  }
}

function updateEnemy(dt: number): void {
  flyForward = Math.max(0, flyForward - dt);
  if (nextWaveCountdown && !(nextWaveCountdown = Math.max(0, nextWaveCountdown - dt))) {
    populateWave();
  }

  let min = 20, max = -20;
  for (const enemy of (enemies.child as Enemy[])) {
    if (enemy.id === 3 || enemy.id === 4) {
      min = Math.min(min, enemy.m[12]);
      max = Math.max(max, enemy.m[12]);
    }

    if (enemy.m[14] > PLAYER_POS_Z) {
      player.hp = 0;
      playHit();
      playerHit();
    }
  }

  if ((flyDir < 0 && min <= -20) || (flyDir > 0 && max >= 20)) {
    flyDir *= -1;
    flyForward = 3;
  }

  for (const enemy of (enemies.child as Enemy[])) {
    if (enemy.id === 3 || enemy.id === 4) {
      vec3.set(enemy.body.v, flyDir, 0, flyForward ? 1 : 0);
    }
  }
}
