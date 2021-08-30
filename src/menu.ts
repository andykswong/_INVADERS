import { NFT_SOTRAGE_KEY, NFT_STORAGE_ENDPOINT } from './const';
import { beginnerBtn, canvas, screenshotBtn, startBtn } from './dom';
import { control } from './init';
import { startGame, toggleBeginner } from './game';

let screenshotReady = true;

startBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  control.touch = true;
  startGame();
});
startBtn.addEventListener('click', startGame);

beginnerBtn.addEventListener('click', () => toggleBeginner());

screenshotBtn.addEventListener('click', () => {
  if (screenshotReady) {
    screenshotReady = false;
    canvas.toBlob((blob) => {
      fetch(NFT_STORAGE_ENDPOINT, { 
        method: 'POST', 
        headers: new Headers({
          'Authorization': `Bearer ${NFT_SOTRAGE_KEY}`,
        }), 
        body: blob
      })
        .then(response => response.json())
        .then(data => {
          open(`https://${data['value']['cid']}.ipfs.dweb.link`, '_blank');
          screenshotReady = true;
        });
    });
  }
});
