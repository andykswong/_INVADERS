import fs from 'fs';
import { execFile } from 'child_process';
import advzip from 'advzip-bin';
import sevenBin from '7zip-bin';
import Seven from 'node-7z';

const OUTPUT = 'dist.zip';

const stream = Seven.add(OUTPUT, ['./public/index.html', './public/server.js'], {
  $bin: sevenBin.path7za,
  method: ['m=Deflate', 'x=9'],
  overwrite: 'a',
});

stream.on('end', () => {
  execFile(advzip, ['-z4', '-i1000', OUTPUT], () => {
    console.log(`Output zip file: ${OUTPUT}, size: ${fs.statSync(OUTPUT).size} bytes`);
  });
});
