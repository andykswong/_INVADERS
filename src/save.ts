import { GAME_NAME } from './const';

export let highscore = 0;
export let maxWave = 0;

try {
  const save = JSON.parse(localStorage.getItem(GAME_NAME) || '{}') || {};
  highscore = +(save['s'] || 0);
  maxWave = +(save['w'] || 0);
} catch(e) {
  process.env.DEBUG && console.warn('localStorage.getItem error', e);
}

export function save(score: number, wave: number): void {
  try {
    localStorage.setItem(GAME_NAME, JSON.stringify({
      's': (highscore = Math.max(highscore, score)),
      'w': (maxWave = Math.max(maxWave, wave)),
    }));
  } catch(e) {
    process.env.DEBUG && console.warn('localStorage.setItem error', e, score, wave);
  }
}
