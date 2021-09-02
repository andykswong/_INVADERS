import { ReadonlyVec3 } from 'munum';
import { send } from './core/webrtc';
import { player } from './init';
import { Wave } from './models/waves';
import { state } from './state';

export * from './core/webrtc';

/**
 * P2P network game sync event.
 */
export type SyncEvent =
/* Wave Sync Event */
{
  /** Timestamp */
  t: number;

  /** Wave number */
  w: number;

  /** Wave enemy data */
  e: Wave;

  p?: never;
} |
/* Regular State Update Event */
{
  /** Timestamp */
  t: number;

  /** Player hp */
  h: number;

  /** Player position. */
  p: ReadonlyVec3;

  /** Player use coil? */
  c: boolean;

  /** Enemy forward movement delta. */
  f: number;

  /** Enemy side movement delta. */
  l: number;

  /** Destroyed enemy IDs */
  d: number[];

  /** New projectiles */
  b: ProjectileData[];

  e?: never;
}

/**
 * Sync event data for new projectiles.
 */
 export type ProjectileData = [
  /** Projectile type */
  type: number,

  /** Projectile position */
  pos: ReadonlyVec3,

  /** Projectile velocity */
  v: ReadonlyVec3,
];

export const projectilesCreated: ProjectileData[] = [];

export const enemiesDestroyed: number[] = [];

export const enemyDelta: [left: number, forward: number] = [0, 0];

export function sendUpdate(): void {
  send<SyncEvent>({
    't': Date.now(),
    'h': player.hp,
    'p': player.body.pos,
    'c': state.coil,
    'l': enemyDelta[0],
    'f': enemyDelta[1],
    'd': enemiesDestroyed,
    'b': projectilesCreated,
  });
  enemiesDestroyed.length = 0;
  projectilesCreated.length = 0;
}

export function sendWave(wave: number, data: Wave): void {
  send<SyncEvent>({
    't': Date.now(),
    'w': wave,
    'e': data,
  });
}
