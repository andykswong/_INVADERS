import { getNGLDevice } from 'mugl';
import { SKY_COLOR } from './const';
import { canvas } from './dom';

export const device = getNGLDevice(canvas, {
  'preserveDrawingBuffer': true
})!;
device.feature('OES_standard_derivatives');

export const pass = device.pass({
  clearColor: SKY_COLOR,
  clearDepth: 1
});
