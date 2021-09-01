import { IPFS_GATEWAY_ENDPOINT, NFT_SOTRAGE_KEY, NFT_STORAGE_ENDPOINT } from './const';
import { beginnerBtn, canvas, coilBtn, coilIcon, crosshair, health, hitOverlay, nav, scoreText, screenshotBtn, startBtn } from './dom';
import { Screen, startGame, state, stateChangeListeners, updateState } from './state';
import { playMusic } from './audio';
import { camera, control, player } from './init';
import { introNode } from './intro';
import { highscore, maxWave, save } from './save';
import { Meshes } from './models/meshes';
import { BeginnerWaves } from './models/waves';

let screenshotReady = true;

function resizeCanvas() {
  camera.aspect = (canvas.width = innerWidth) / (canvas.height = innerHeight);
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

startBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  playMusic();
  startGame(true);
});
startBtn.addEventListener('click', () => {
  playMusic();
  startGame(false);
});

beginnerBtn.addEventListener('click', () => {
  updateState({ 'beg': !state.beg });
});

coilBtn.addEventListener('click', () => {
  updateState({ 'coil': !state.coil });
});

screenshotBtn.addEventListener('click', () => {
  if (screenshotReady) {
    screenshotReady = false;
    canvas.toBlob((blob) => {
      fetch(NFT_STORAGE_ENDPOINT, { 
        'method': 'POST', 
        'headers': new Headers({
          'Authorization': `Bearer ${NFT_SOTRAGE_KEY}`,
        }), 
        'body': blob
      })
        .then(response => response.json())
        .then(data => {
          open(`${IPFS_GATEWAY_ENDPOINT}/ipfs/${data['value']['cid']}`, '_blank');
          screenshotReady = true;
        });
    });
  }
});

// React to state changes
stateChangeListeners.push((newState, prevState, init) => {
  if (init || newState.scr !== prevState.scr) {
    nav.hidden = (newState.scr !== Screen.Menu);
    crosshair.hidden = (newState.scr !== Screen.Game);
    health.hidden = (newState.scr !== Screen.Game);
    introNode.hide = (newState.scr === Screen.Game);

    if (newState.scr === Screen.Menu) {
      scoreText.innerText = `HISCORE ${highscore}`;
    }

    if (newState.scr === Screen.Game) {
      if (!(control.touch = newState.touch)) {
        addEventListener('mouseup', resumeControl);
      }
      resumeControl();
    }

    if (newState.scr === Screen.End) {
      control.reset();
      !newState.touch && removeEventListener('mouseup', resumeControl);

      save(newState.score, newState.wave);
      updateState({
        'scr': Screen.Menu,
        'beg': maxWave < BeginnerWaves.length ? newState.beg : false,
      });
    }

  }

  if (newState.sub) {
    coilIcon.hidden = false;
    coilBtn.hidden = false;
    if (init || !prevState.sub || newState.coil !== prevState.coil) {
      coilBtn.innerText = `${newState.coil ? '☑' : '☐'} COIL WEAPON`;
      player.arm.mesh!.id = newState.coil ? Meshes.coil : Meshes.wand;
    }
  }

  if (init || newState.beg !== prevState.beg) {
    beginnerBtn.innerText = `${newState.beg ? '☑' : '☐'} BEGINNER`;
  }

  if (newState.score !== prevState.score && newState.scr === Screen.Game) {
    scoreText.innerText = `SCORE ${newState.score}`;
  }
  if (newState.hp !== prevState.hp) {
    health.innerText = (newState.hp ? `LIVES ${Array(newState.hp | 0).fill('⬤').join(' ')}` : '');
    if (newState.hp < prevState.hp) {
      playerHit();
    }
  }
});

function resumeControl(): void {
  control.start();
}

function playerHit(): void {
  hitOverlay.classList.add('hit');
  setTimeout(() => hitOverlay.classList.remove('hit'), 100);
}
