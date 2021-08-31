import { zzfx, zzfxP } from './core/audio';
import { hit, shoot, song } from './models/sounds';

let audioCtx: AudioContext;

export function playMusic(): void {
  if (!audioCtx) {
    audioCtx = new AudioContext();

    const gain = audioCtx.createGain();
    gain.gain.value = .4;
    gain.connect(audioCtx.destination);
    const music = zzfxP(audioCtx, ...song);
    music.loop = true;
    music.connect(gain);
    music.start();
  }
}

export function playHit(): void {
  audioCtx && start(zzfx(audioCtx, ...hit));
}

export function playShoot(): void {
  audioCtx && start(zzfx(audioCtx, ...shoot));
}

function start(sound: AudioBufferSourceNode): void {
  sound.connect(audioCtx.destination);
  sound.start();
}
