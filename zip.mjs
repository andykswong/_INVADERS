import sevenBin from '7zip-bin';
import Seven from 'node-7z';

const pathTo7zip = sevenBin.path7za;
const stream = Seven.add('./dist/game.zip', './dist/index.html', {
  $bin: pathTo7zip,
  method: ['m=LZMA', 'x=9']
});
stream.on('end', () => {
  console.log(stream.info);
});
