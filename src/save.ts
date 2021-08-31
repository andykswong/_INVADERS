import { SAVE_KEY } from './const';

export let highscore = 0;
export let maxWave = 0;

try {
  const save = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
  highscore = +(save?.['s'] || 0);
  maxWave = +(save?.['w'] || 0);
} catch(e) {
}

export function save(score: number, wave: number): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      's': (highscore = Math.max(highscore, score)),
      'w': (maxWave = Math.max(maxWave, wave)),
    }));
  } catch(e) {
  }
}
