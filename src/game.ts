import { array, vec3 } from 'munum';
import { CONNECTION_TIMEOUT_MS, MULTIPLAYER_POS_X, PLAYER_ATTACK_TIME, PLAYER_HP, PLAYER_MAX_HP, PLAYER_POS_Z, WAVE_CYCLE, WAVE_GENERATOR_MAX_ITER } from './const';
import { device, pass } from './core/device';
import { renderMesh, renderParticles } from './core/graphics';
import { MeshInstance } from './core/mesh';
import { traverse } from './core/node';
import { Body, simulate } from './core/physics';
import { zrand } from './core/utils';
import { BeginnerWaves, BossWaves, Wave, WaveRow } from './models/waves';
import { Screen, state, stateChangeListeners, updateState } from './state';
import { disconnect, enemiesDestroyed, enemyDelta, messages, sendUpdate, sendWave, SyncEvent } from './multiplayer';
import { camera, enemies, player, player2, projectiles, root } from './init';
import { playHit } from './audio';
import { Player } from './player';
import { Projectile } from './projectile';
import { Enemy } from './enemies';
import { createEnemy, createProjectile } from './entities';
import { Meshes } from './models/meshes';
import { createDestructionParticles } from './particles';

let flyDir = -1.5;
let flyForward = 0;
let lastRemoteUpdate = 0;

// React to state changes
stateChangeListeners.push((newState, prevState, init) => {
  if (init || newState.scr !== prevState.scr) {
    if (newState.scr === Screen.Game) {
      player.hp = newState.hp;
      lastRemoteUpdate = 0;
      vec3.set(player.body.pos, (state.p2p ? (state.host ? 1 : -1) * MULTIPLAYER_POS_X : 0), 0, PLAYER_POS_Z);
    } else {
      vec3.set(player.body.pos, 0, 0, PLAYER_POS_Z);
      vec3.set(player.body.v, 0, 0, 0);
      projectiles.child.length = 0;
      enemies.child.length = 0;

      player2.hide = true;
    }
  }

  if (newState.wave !== prevState.wave) {
    if (newState.beg && prevState.wave <= BeginnerWaves.length) {
      // Beginner gets extra health and heal during the beginner waves
      player.hp = PLAYER_HP + (state.coil ? 1 : 0) + 1;
    } else if (prevState.wave && !(prevState.wave % WAVE_CYCLE)) {
      // +2 HP after every miniboss
      player.hp = Math.min(PLAYER_MAX_HP, player.hp + 2);
    }
  }
});

// The game loop
// =============

const bodies: Body[] = [];
const meshes: MeshInstance[] = [];

let lastTime = 0;
let frame = 0;
loop(0);
function loop(t: number) {
  requestAnimationFrame(loop);
  t = t / 1000;
  const dt = t - lastTime;
  lastTime = t;
  lastRemoteUpdate = lastRemoteUpdate || t;

  // Update game
  if (state.scr === Screen.Game) {
    if (!state.p2p || state.host) {
      updateWave();
    }

    if (state.p2p) {
      // Disconnect and revert to single player experience after timeout, so that you can keep playing
      if (t - lastRemoteUpdate > CONNECTION_TIMEOUT_MS / 1000) {
        disconnect();
        updateState({ 'p2p': false, 'host': true });
        player2.hide = true;
      } else {
        (!(frame = (frame + 1) % 4) || !player.hp) && sendUpdate();
        remoteUpdate(t);
      }
    }

    if (state.hp !== player.hp) {
      updateState({
        'scr': Math.max(player.hp, 0) ? Screen.Game : Screen.End,
        'hp': Math.max(player.hp, 0),
      });
    }

    updateEnemies(dt);
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
    if (!byNode.p && targetNode instanceof Player) { // Enemy projectile hits player
      if (!targetNode.remote) {
        playHit();
        byNode.detach();
        player.hp--;
      }
    } else if (byNode.p && targetNode instanceof Enemy) { // Player projectile hits enemy
      playHit();
      byNode.detach();
      if (!byNode.remote) {
        targetNode.detach();
        enemiesDestroyed.push(targetNode.id);
        player.timer = 0;
        updateState({
          score: state.score + 1,
        });
      }
    } else if (byNode.p && targetNode instanceof Projectile && !targetNode.p) { // Player projectile hits enemy projectile
      playHit();
      byNode.detach();
      targetNode.detach();
      if (!byNode.remote) {
        player.timer = 0;
      }
    }
  } else if (byNode instanceof Enemy && targetNode instanceof Player) { // Enemy hits player
    if (!targetNode.remote) {
      playHit();
      byNode.detach();
      player.hp--;
      enemiesDestroyed.push(byNode.id);
    }
  }
}

// Waves and Enemies Updates
// =========================

function updateWave(): void {
  // Populate next wave if current wave is complete
  if (!enemies.child.length) {
    updateState({
      'wave': state.wave + 1,
    });
    const data = getWave();
    populateWave(data);
    flyDir = -1.5;
    flyForward = 0;
    enemyDelta[0] = 0;
    enemyDelta[1] = 0;
    if (state.p2p) {
      sendWave(state.wave, data);
    }
  }
}

function getWave(): Wave {
  return (
    (state.beg && state.wave < BeginnerWaves.length) ? BeginnerWaves[state.wave] :
    ((state.wave + 1) % WAVE_CYCLE) ?
      generateWave() :
      BossWaves[(BossWaves.length * Math.random()) | 0]
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

function populateWave(data: Wave): void {
  for (let id = 0, z = 0; z < data.length; ++z) {
    for (let y = 0; y < data[z].length; ++y) {
      for (let x = 0; x < 11; ++x) {
        const type = data[z][data[z].length - y - 1][x];
        if (!type) { continue; }

        vec3.set(
          createEnemy(type, ++id).body.pos,
          (x - 5) * 3,
          y * 3 + (type < 3 || type === 5 ? 20 : 0),
          Math.min(15, (state.wave / 2) | 0) - z * 6 - y
        );
      }
    }
  }
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

  enemyDelta[0] += flyDir * dt;
  enemyDelta[1] += flyForward ? dt : 0;

  for (const enemy of (enemies.child as Enemy[])) {
    if (enemy.type < 3) {
      vec3.set(enemy.body.v, 0, enemy.body.v[1], 1);
    } else if (enemy.type < 5) {
      vec3.set(enemy.body.v, flyDir, 0, flyForward ? 1 : 0);
    }
  }
}

// P2P remote update
// =================

function remoteUpdate(t: number): void {
  if (messages.length) {
    lastRemoteUpdate = t;
  }

  for (const message of (messages as SyncEvent[])) {
    if (message.e) { // Wave sync event
      updateState({
        'wave': message.w,
      });
      populateWave(message.e);
      flyDir = -1.5;
      flyForward = 0;
      enemyDelta[0] = 0;
      enemyDelta[1] = 0;
    }
    if (message.p) { // State sync event
      const player2WasAlive = !player2.hide;
      if ((player2.hide = message.h <= 0) && player2WasAlive) {
        playHit();
        createDestructionParticles(player2);
      }

      player2.arm.mesh!.id = message.c ? Meshes.coil : Meshes.wand;
      array.copy(message.p, player2.body.pos, 0, 0, 3);

      for (const id of message.d) {
        const enemy = enemies.child.find((enemy) => (enemy as Enemy).id === id);
        enemy && enemy.detach();
      }
      for (const projectile of message.b) {
        createProjectile(...projectile, true);
        if (projectile[0] < 3) {
          player2.timer = PLAYER_ATTACK_TIME;
        }
      }
      if (!state.host) {
        for (const enemy of (enemies.child as Enemy[])) {
          if (enemy.type >= 3 && enemy.type < 5) {
            enemy.body.pos[0] += message.l - enemyDelta[0];
            enemy.body.pos[2] += message.f - enemyDelta[1];
          }
        }
        enemyDelta[0] = message.l;
        enemyDelta[1] = message.f;
      }
    }
  }
  messages.length = 0;
}
