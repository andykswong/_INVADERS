import { vec3 } from 'munum';
import { traverse } from './core/node';
import { renderMesh, renderParticles } from './core/graphics';
import { MeshInstance } from './core/mesh';
import { Body, simulate } from './core/physics';
import { zrand } from './core/utils';
import { device, pass } from './device';
import { camera, enemies, player, projectiles, root } from './init';
import { Player } from './player';
import { playHit } from './audio';
import { Projectile } from './projectile';
import { Enemy, Flier, Walker, Watcher } from './enemies';
import { BEGINNER_BOSS_COUNT, ENEMY_WAVE_COUNTDOWN, PLAYER_HP, PLAYER_MAX_HP, PLAYER_POS_Z, WAVE_CYCLE, WAVE_GENERATOR_MAX_ITER } from './const';
import { BeginnerWaves, BossWaves, Wave, WaveRow } from './models/waves';
import { Screen, state, stateChangeListeners, updateState } from './state';

let nextWaveCountdown = 0;
let flyDir = -1.5, flyForward = 0;

// React to state changes
stateChangeListeners.push((newState, prevState, init) => {
  if (init || newState.scr !== prevState.scr) {
    if (newState.scr === Screen.Game) {
      player.hp = newState.hp;
    } else {
      vec3.set(player.body!.pos, 0, 0, PLAYER_POS_Z);
      vec3.set(player.body!.v, 0, 0, 0);
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
    checkWaveEnd();
    updateEnemy(dt);
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

// Enemy Updates
// =============

function checkWaveEnd(): void {
  if (!nextWaveCountdown && !enemies.child.length) {
    nextWaveCountdown = ENEMY_WAVE_COUNTDOWN;
    const wave = state.wave + 1;
    if (state.beg && wave === BeginnerWaves.length) {
      player.hp = 5;
    } else if (wave && !(wave % WAVE_CYCLE)) {
      player.hp = Math.min(PLAYER_MAX_HP, player.hp + 2);
    }
    updateState({
      'wave': wave,
    });
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

function populateWave(): void {
  const data =
    (state.beg && state.wave < BeginnerWaves.length) ? BeginnerWaves[state.wave] :
    (state.wave % WAVE_CYCLE === WAVE_CYCLE - 1) ?
      BossWaves[((state.wave < WAVE_CYCLE ? BEGINNER_BOSS_COUNT : BossWaves.length) * Math.random()) | 0] :
    generateWave();
  for (let z = 0; z < data.length; ++z) {
    for (let y = 0; y < data[z].length; ++y) {
      for (let x = 0; x < 11; ++x) {
        const id = data[z][data[z].length - y - 1][x];
        if (!id) { continue; }

        const enemy = createEnemy(id);
        vec3.set(enemy.body.pos, (x - 5) * 3, y * 3 + (id < 3 || id === 5 ? 20 : 0), Math.min(9, (state.wave / 2) | 0) - z * 6 - y);

        (id < 3) && vec3.set(enemy.body.v, 0, 0, 1);
      }
    }
  }
}

function createEnemy(id: number): Enemy {
  return (
    id < 3 ? new Walker(enemies, id & 1) :
    id < 5 ? new Flier(enemies, id & 1) :
    new Watcher(enemies)
  );
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
      playHit();
      player.hp = 0;
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
