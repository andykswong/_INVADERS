import { array, ReadonlyVec3 } from 'munum';
import { BLOOD_COLOR, ENERGY_COLOR, FIRE_COLOR, ICE_COLOR } from './const';
import { enemies, projectiles } from './init';
import { Enemy, Walker, Flier, Watcher } from './enemies';
import { Projectile } from './projectile';
import { projectilesCreated } from './multiplayer';
import { state } from './state';

/**
 * Create an enemy.
 */
export function createEnemy(type: number, id: number): Enemy {
  return (
    type < 3 ? new Walker(enemies, id, type & 1) :
    type < 5 ? new Flier(enemies, id, type & 1) :
    new Watcher(enemies, id)
  );
}

/**
 * Create a projectile.
 */
export function createProjectile(type: number, pos: ReadonlyVec3, v: ReadonlyVec3, remote: boolean = false): Projectile {
  const projectile = (
    type < 2 ? new Projectile(projectiles, FIRE_COLOR, true) :
    type < 3 ? new Projectile(projectiles, ENERGY_COLOR, true, 2.5) :
    type < 4 ? new Projectile(projectiles, BLOOD_COLOR, false) :
    new Projectile(projectiles, ICE_COLOR, false, .75)
  );
  array.copy(pos, projectile.body.pos, 0, 0, 3);
  array.copy(v, projectile.body.v, 0, 0, 3);
  !(projectile.remote = remote) && state.p2p && projectilesCreated.push([type, pos, v]);

  return projectile;
}
