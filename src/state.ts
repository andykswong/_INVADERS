import { PLAYER_HP } from './const';
import { socket } from './core/webrtc';

/**
 * Screen type.
 */
export enum Screen {
  Menu = 1 << 0,
  Multiplayer = 1 << 1,
  Game = 1 << 2,
  End = 1 << 3,
}

/**
 * Global game state type.
 */
export interface State {
  /** Current screen */
  scr: Screen;

  /** Use touch controls? */
  touch: boolean;

  /** Enable beginner waves? */
  beg: boolean;

  /** Is subscriber? */
  sub: boolean;

  /** Use coil weapon? */
  coil: boolean;

  /** Is multiplayer host? */
  host: boolean;

  /** Is playing p2p multiplayer? */
  p2p: boolean;

  /** Is serverless? */
  sl: boolean;

  /** Current wave */
  wave: number;

  /** Current score */
  score: number;

  /** Player hp */
  hp: number;

  /** Player 2 score */
  score2: number;
}

/**
 * Global game state.
 */
export let state: Readonly<State> = {
  'scr': Screen.Menu,
  'touch': false,
  'sub': false,
  'coil': false,
  'p2p': false,
  'host': true,
  'beg': true,
  'sl': !socket,
  'wave': -1,
  'score': 0,
  'score2': 0,
  'hp': 0,
};

/** State change listeners */
export const stateChangeListeners: ((newState: Readonly<State>, prevState: Readonly<State>, init: boolean) => void)[] = [];

/**
 * Update state.
 */
export function updateState(delta: Partial<State>, init: boolean = false): void {
  const prevState = state;
  state = { ...state, ...delta };

  process.env.DEBUG && console.log(`state ${init ? 'init' : 'update'}`, delta, state);

  for (const listener of stateChangeListeners) {
    listener(state, prevState, init);
  }
}

// Actions
// =======

/**
 * Init action.
 */
export function init(): void {
  updateState(state, true);
}

/**
 * Start game action.
 */
export function startGame(touch: boolean, multiplayer: boolean = false): void {
  updateState({
    'scr': Screen.Game,
    'hp': PLAYER_HP + (state.coil ? 1 : 0),
    'score': 0,
    'wave': -1,
    'touch': touch,
    'p2p': multiplayer,
    'host': !multiplayer || state.host,
    'beg': !multiplayer && state.beg,
  });
}

// Expose updateState for debug only
if (process.env.DEBUG) {
  (window as any).updateState = updateState;
}
