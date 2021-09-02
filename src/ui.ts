import { IPFS_GATEWAY_ENDPOINT, NFT_SOTRAGE_KEY, NFT_STORAGE_ENDPOINT } from './const';
import { Meshes } from './models/meshes';
import { BeginnerWaves } from './models/waves';
import { answerInput, backBtn, beginnerBtn, canvas, coilBtn, coilIcon, crosshair, health, hitOverlay, hostBtn, joinBtn, mainMenu, multiplayerBtn, multiplayerMenu, multiplayerStatus, offerInput, scoreText, screenshotBtn, startBtn, startMultiplayerBtn } from './dom';
import { Screen, startGame, state, stateChangeListeners, updateState } from './state';
import { playMusic } from './audio';
import { camera, control, player } from './init';
import { introNode } from './intro';
import { highscore, maxWave, save } from './save';
import { connect, disconnect, host, join, messages } from './multiplayer';

let screenshotReady = true;

function resizeCanvas() {
  camera.aspect = (canvas.width = innerWidth) / (canvas.height = innerHeight);
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

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

// Start buttons
// =============

startBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  playMusic();
  startGame(true);
});
startBtn.addEventListener('click', () => {
  playMusic();
  startGame(false);
});

startMultiplayerBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  playMusic();
  connect(state.host, answerInput.value).then(() => {
    startGame(true, true);
  }, () => (multiplayerStatus.innerText = 'CANNOT START'));
});
startMultiplayerBtn.addEventListener('click', () => {
  playMusic();
  connect(state.host, answerInput.value).then(() => {
    startGame(false, true);
  }, () => (multiplayerStatus.innerText = 'CANNOT START'));
});

// Main Menu
// =========

beginnerBtn.addEventListener('click', () => {
  updateState({ 'beg': !state.beg });
});

coilBtn.addEventListener('click', () => {
  updateState({ 'coil': !state.coil });
});

multiplayerBtn.addEventListener('click', () => {
  updateState({ 'scr': Screen.Multiplayer });
});

// Multiplayer Menu
// ================

backBtn.addEventListener('click', () => {
  updateState({ 'scr': Screen.Menu });
});

hostBtn.addEventListener('click', () => {
  host().then(
    (offer) => {
      offerInput.value = offer;
      updateState({ 'host': true });
    },
    () => (multiplayerStatus.innerText = 'CANNOT HOST')
  );
});

joinBtn.addEventListener('click', () => {
  join(offerInput.value).then(
    (answer) => {
      answerInput.value = answer;
      updateState({ 'host': false });
    },
    () => (multiplayerStatus.innerText = 'CANNOT JOIN')
  );
});

// React to state changes
stateChangeListeners.push((newState, prevState, init) => {
  if (init || newState.scr !== prevState.scr) {
    mainMenu.hidden = (newState.scr !== Screen.Menu);
    multiplayerMenu.hidden = (newState.scr !== Screen.Multiplayer);
    crosshair.hidden = (newState.scr !== Screen.Game);
    health.hidden = (newState.scr !== Screen.Game);
    introNode.hide = (newState.scr === Screen.Game);
    offerInput.value = '';
    answerInput.value = '';

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
      // Reset networking
      disconnect();
      messages.length = 0;

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

  if (newState.scr === Screen.Game && (prevState.scr !== Screen.Game || newState.score !== prevState.score)) {
    scoreText.innerText = `SCORE ${newState.score}`;
  }
  if (newState.hp !== prevState.hp) {
    health.innerText = `LIVES ${Array(newState.hp | 0).fill('⬤').join(' ')}`;
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
