import { vec3 } from 'munum';
import { BEGINNER_BOSS_COUNT, ENEMY_WAVE_COUNTDOWN, PLAYER_HP, PLAYER_MAX_HP, PLAYER_POS_Z, WAVE_CYCLE, WAVE_GENERATOR_MAX_ITER } from './const';
import { device, pass } from './core/device';
import { renderMesh, renderParticles } from './core/graphics';
import { MeshInstance } from './core/mesh';
import { traverse } from './core/node';
import { Body, simulate } from './core/physics';
import { zrand } from './core/utils';
import { BeginnerWaves, BossWaves, Wave, WaveRow } from './models/waves';
import { Screen, state, stateChangeListeners, updateState } from './state';
import { camera, enemies, player, projectiles, root } from './init';
import { playHit } from './audio';
import { Player } from './player';
import { Projectile } from './projectile';
import { Enemy } from './enemies';
import { createEnemy } from './entities';

let nextWaveCountdown = 0;
let flyDir = -1.5, flyForward = 0;

// React to state changes
stateChangeListeners.push((newState, prevState, init) => {
  if (init || newState.scr !== prevState.scr) {
    if (newState.scr === Screen.Game) {
      player.hp = newState.hp;
    } else {
      vec3.set(player.body.pos, 0, 0, PLAYER_POS_Z);
      vec3.set(player.body.v, 0, 0, 0);
      projectiles.child.length = 0;
      enemies.child.length = 0;
    }
  }
});

// The game loop
// =============

const bodies: Body[] = [];
const meshes: MeshInstance[] = [];

let lastTime = 0;
requestAnimationFrame(loop);
function loop(t: number) {
  requestAnimationFrame(loop);
  t = t / 1000
  const dt = lastTime ? t - lastTime : 0;
  lastTime = t;

  // Update game
  if (state.scr === Screen.Game) {
    updateWave(dt);
    updateEnemies(dt);
    if (state.hp !== player.hp) {
      updateState({
        'scr': player.hp <= 0 ? Screen.End : Screen.Game,
        'hp': Math.max(player.hp, 0),
      });
    }
  }

  // Collect all bodies / meshes
  bodies.length = meshes.length = 0;
  traverse(root, (node) => {
    node.body && bodies.push(node.body);
    node.mesh && meshes.push(node.mesh);
  });

  // Update nodes
  simulate(dt, bodies, hit);
  root.update(dt);

  // Render
  const ctx = device.render(pass);
  renderMesh(ctx, camera, meshes);
  renderParticles(ctx, camera, t);
  ctx.end();
};

function hit(target: Body, by: Body): void {
  const targetNode = target.node;
  const byNode = by.node;
  if (byNode instanceof Projectile) {
    if (!byNode.p && targetNode instanceof Player) {
      playHit();
      player.hp -= byNode.hp;
      byNode.detach();
    } else if (byNode.p && targetNode instanceof Enemy) {
      if ((targetNode.hp -= byNode.hp) <= 0) {
        targetNode.detach();
      }
      playHit();
      byNode.detach();
      player.timer = 0;
      updateState({
        score: state.score + 1,
      });
    } else if (targetNode instanceof Projectile && targetNode.p !== byNode.p) {
      targetNode.detach();
      byNode.detach();
      playHit();
      player.timer = 0;
    }
  } else if (byNode instanceof Enemy && targetNode instanceof Player) {
    playHit();
    player.hp--;
    byNode.detach();
  }
}

// Waves and Enemies Updates
// =========================

function updateWave(dt: number): void {
  // Check if current wave is complete
  if (!nextWaveCountdown && !enemies.child.length) {
    nextWaveCountdown = ENEMY_WAVE_COUNTDOWN;
    const wave = state.wave + 1;

    if (state.beg && wave <= BeginnerWaves.length) {
      // Beginner gets extra health and heal during the beginner waves
      player.hp = PLAYER_HP + (state.coil ? 1 : 0) + 1;
    } else if (wave && !(wave % WAVE_CYCLE)) {
      // +2 HP after every miniboss
      player.hp = Math.min(PLAYER_MAX_HP, player.hp + 2);
    }

    updateState({
      'wave': wave,
    });
  }

  // Populate next wave after countdown
  if (nextWaveCountdown && !(nextWaveCountdown = Math.max(0, nextWaveCountdown - dt))) {
    populateWave(getWave());
  }
}

function getWave(): Wave {
  return (
    (state.beg && state.wave < BeginnerWaves.length) ? BeginnerWaves[state.wave] :
    (state.wave % WAVE_CYCLE === WAVE_CYCLE - 1) ?
      BossWaves[((state.wave < (state.beg ? 2 : 1) * WAVE_CYCLE ? BEGINNER_BOSS_COUNT : BossWaves.length) * Math.random()) | 0] :
    generateWave()
  );
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

  const count = 22 + Math.min(33, ((state.wave + 5) * Math.random()) | 0);
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

function populateWave(data: Wave): number {
  let id = 0;
  for (let z = 0; z < data.length; ++z) {
    for (let y = 0; y < data[z].length; ++y) {
      for (let x = 0; x < 11; ++x) {
        const type = data[z][data[z].length - y - 1][x];
        if (!type) { continue; }

        const enemy = createEnemy(type, id++);
        vec3.set(enemy.body.pos, (x - 5) * 3, y * 3 + (type < 3 || type === 5 ? 20 : 0), Math.min(15, (state.wave / 2) | 0) - z * 6 - y);
        (type < 3) && vec3.set(enemy.body.v, 0, 0, 1);
      }
    }
  }
  return id;
}

function updateEnemies(dt: number): void {
  flyForward = Math.max(0, flyForward - dt);

  let min = 20, max = -20;
  for (const enemy of (enemies.child as Enemy[])) {
    if (enemy.type === 3 || enemy.type === 4) {
      min = Math.min(min, enemy.m[12]);
      max = Math.max(max, enemy.m[12]);
    }

    if (enemy.m[14] > PLAYER_POS_Z) {
      playHit();
      player.hp = 0;
    }
  }

  if ((flyDir < 0 && min <= -20) || (flyDir > 0 && max >= 20)) {
    flyDir *= -1;
    flyForward = 4;
  }

  for (const enemy of (enemies.child as Enemy[])) {
    if (enemy.type === 3 || enemy.type === 4) {
      vec3.set(enemy.body.v, flyDir, 0, flyForward ? 1 : 0);
    }
  }
}
