import { IPFS_GATEWAY_ENDPOINT, NFT_SOTRAGE_KEY, NFT_STORAGE_ENDPOINT } from './const';
import { Meshes } from './models/meshes';
import { BeginnerWaves } from './models/waves';
import { answerInput, p2pBackBtn, beginnerBtn, canvas, coilBtn, coilIcon, crosshair, health, hitOverlay, offerBtn, answerBtn, mainMenu, multiplayerBtn, multiplayerMenu, offerInput, scoreText, screenshotBtn, startBtn, startP2PBtn, multiplayerStatus, joinCodeInput, endMenu, endBackBtn, serverlessBtn } from './dom';
import { Screen, startGame, state, stateChangeListeners, updateState } from './state';
import { playMusic } from './audio';
import { camera, control, player } from './init';
import { introNode } from './intro';
import { highscore, maxWave, save } from './save';
import { connect, disconnect, host, join, socketHost, socketJoin } from './multiplayer';

let screenshotReady = true;

function resizeCanvas() {
  camera.aspect = (canvas.width = innerWidth) / (canvas.height = innerHeight);
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

function screenshot() {
  if (screenshotReady) {
    screenshotReady = false;
    canvas.toBlob((blob) =>
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
        })
    );
  }
};

screenshotBtn.addEventListener('click', screenshot);
addEventListener('keypress', (e) => {
  if (e.key === 'p') {
    screenshot();
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

startP2PBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  connect(state.host, answerInput.value).then(() => {
    playMusic();
    startGame(true, true);
  }, (e) => multiplayerStatus.innerText = e || '');
});
startP2PBtn.addEventListener('click', () => {
  connect(state.host, answerInput.value).then(() => {
    playMusic();
    startGame(false, true);
  }, (e) => multiplayerStatus.innerText = e || '');
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

// End Menu
// ========
endBackBtn.addEventListener('click', () => {
  updateState({
    'scr': Screen.Menu,
    'beg': maxWave < BeginnerWaves.length ? state.beg : false,
  });
});

// Multiplayer Menu
// ================

p2pBackBtn.addEventListener('click', () => {
  updateState({ 'scr': Screen.Menu });
});

serverlessBtn.addEventListener('click', () => {
  updateState({ 'sl': !state.sl });
});

offerBtn.addEventListener('click', () => !state.sl ? socketHost() : host().then(
  (offer) => {
    offerInput.value = offer;
    updateState({ 'host': true });
  },
  () => multiplayerStatus.innerText = 'NETWORK ERROR'
));
answerBtn.addEventListener('click', () => !state.sl ? socketJoin() : join(offerInput.value).then(
  (answer) => {
    answerInput.value = answer;
    updateState({ 'host': false });
  },
  () => multiplayerStatus.innerText = 'NETWORK ERROR'
));

// React to state changes
stateChangeListeners.push((newState, prevState, init) => {
  if (init || newState.scr !== prevState.scr) {
    mainMenu.hidden = (newState.scr !== Screen.Menu);
    multiplayerMenu.hidden = (newState.scr !== Screen.Multiplayer);
    endMenu.hidden = (newState.scr !== Screen.End);
    crosshair.hidden = (newState.scr !== Screen.Game);
    health.hidden = (newState.scr !== Screen.Game);
    introNode.hide = (newState.scr === Screen.Game);
    offerInput.value = '';
    answerInput.value = '';
    multiplayerStatus.innerText = '';

    if (newState.scr === Screen.Menu) {
      // Reset networking
      disconnect();
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
    }
  }

  if (newState.sub) {
    coilIcon.hidden = false;
    coilBtn.hidden = false;
  }

  if (newState.scr === Screen.Menu) {
    scoreText.innerText = `HISCORE ${highscore}`;
    beginnerBtn.innerText = `${newState.beg ? '☑' : '☐'} BEGINNER`;
    coilBtn.innerText = `${newState.coil ? '☑' : '☐'} COIL WEAPON`;
    player.arm.mesh!.id = newState.coil ? Meshes.coil : Meshes.wand;
  }

  if (newState.scr === Screen.Multiplayer) {
    serverlessBtn.innerText = `${newState.sl ? '☑' : '☐'} SERVERLESS`;
    joinCodeInput.hidden = newState.sl;
    offerInput.hidden = !newState.sl;
    answerInput.hidden = !newState.sl;
  }

  if (newState.scr === Screen.Game) {
    scoreText.innerText = `SCORE ${newState.score} ${newState.p2p ? `: ${newState.score2}` : ''}`;
    health.innerText = `LIVE ${Array(newState.hp | 0).fill('⬤').join(' ')}`;
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
  setTimeout(() => hitOverlay.classList.remove('hit'), 50);
}
