import { PLAYER_HP } from './const';

/**
 * Screen type.
 */
export enum Screen {
  Menu = 1 << 0,
  Game = 1 << 1,
  End = 1 << 2,
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

  /** Current score */
  score: number;

  /** Current wave */
  wave: number;

  /** Player hp */
  hp: number;
}

/**
 * Global game state.
 */
export let state: Readonly<State> = {
  'scr': Screen.Menu,
  'touch': false,
  'sub': false,
  'coil': false,
  'beg': true,
  'hp': 0,
  'score': 0,
  'wave': -1,
};

/** State change listeners */
export const stateChangeListeners: ((newState: Readonly<State>, prevState: Readonly<State>, init: boolean) => void)[] = [];

/**
 * Update state.
 */
export function updateState(delta: Partial<State>, init: boolean = false): void {
  const prevState = state;
  state = { ...state, ...delta };

  if (process.env.DEBUG) {
    console.log(`state ${init ? 'init' : 'update'}`, delta, state);
  }

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
export function startGame(touch: boolean): void {
  updateState({
    'scr': Screen.Game,
    'hp': PLAYER_HP + (state.coil ? 1 : 0),
    'score': 0,
    'wave': -1,
    'touch': touch,
  });
}

// Expose updateState for debug only
if (process.env.DEBUG) {
  (window as any).updateState = updateState;
}
