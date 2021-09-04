import type { io as SocketIO } from 'socket.io-client';
import { ReadonlyVec3 } from 'munum';
import { host, join, send } from './core/webrtc';
import { player } from './init';
import { Wave } from './models/waves';
import { state, updateState } from './state';
import { answerInput, joinCodeInput, multiplayerStatus, offerInput } from './dom';

export * from './core/webrtc';

declare global {
  interface Window {
    io: typeof SocketIO;
  }
}

/** The active socket connection. */
const socket = window['io'] && window['io']();

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

/**
 * Send update to peer.
 */
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

/**
 * Send new wave to peer.
 */
export function sendWave(wave: number, data: Wave): void {
  send<SyncEvent>({
    't': Date.now(),
    'w': wave,
    'e': data,
  });
}

/**
 * Start as host using socket.io.
 * @see https://webrtc.org/getting-started/peer-connections
 * Workflow:
 * 1. Wait for (J id)
 * 2. Create WebRTC offer
 * 3. Emit (P O offer id)
 * 4. Wait for (P A answer id)
 * 5. Ready
 */
export function socketHost(): boolean {
  multiplayerStatus.innerText = 'CANNOT REACH SERVER';
  if (socket && socket['connected']) {
    multiplayerStatus.innerText = 'CONNECTING';
    socket['off']('P');
    socket.once(joinCodeInput.value, (id: string) => host().then((offer) => {
      socket['emit']('P', 'O', (offerInput.value = offer), id);
      socket['once']('P', (_: string, answer: string) => {
        answerInput.value = answer;
        multiplayerStatus.innerText = 'READY';
      });
      updateState({ 'host': true });
    }));
  }
  return socket && socket['connected'];
}

/**
 * Join a host using socket.io.
 * @see https://webrtc.org/getting-started/peer-connections
 * Workflow:
 * 1. Emit (J code)
 * 2. Wait for (P O offer id)
 * 3. Create WebRTC answer
 * 4. Emit (P A answer id)
 * 5. Ready
 */
export function socketJoin(): boolean {
  multiplayerStatus.innerText = 'CANNOT REACH SERVER';
  if (socket && socket['connected']) {
    multiplayerStatus.innerText = 'CONNECTING';
    socket['off']('P');
    socket['emit']('J', joinCodeInput.value);
    socket['once']('P', (_: string, offer: string, id: string) => (
      join(offerInput.value = offer).then((answer) => {
        socket['emit']('P', 'A', (answerInput.value = answer), id);
        multiplayerStatus.innerText = 'READY';
        updateState({ 'host': false });
      })
    ));
  }
  return socket && socket['connected'];
}
