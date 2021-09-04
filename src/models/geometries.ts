import { Mat4, quat, ReadonlyVec3, rotate, scale, translate } from 'munum';
import { ALIEN_SKIN_COLOR, BLUE_COLOR, DARK_COLOR, SAND_COLOR, COIL_COLOR, RED_COLOR, SILVER_COLOR, WAND_COLOR, WOOD_COLOR, COIL_HEAD_COLOR } from '../const';
import { box, empty, merge, trans } from '../core/procedural';

function rotateAxis(axis: ReadonlyVec3, angle: number): Mat4 {
  return rotate(quat.rotateAxis(axis, angle));
}

export const ground = trans(box(100, .05, 100, SAND_COLOR), translate([0, -.05, 0]));

export const eyeball = box(.5, .5, .4, SILVER_COLOR);
merge(eyeball, trans(box(.3, .3, .2, BLUE_COLOR), translate([0, 0, .25])));
merge(eyeball, trans(box(.15, .15, .2, DARK_COLOR), translate([0, 0, .28])));
trans(eyeball, translate([0, 1, 0]));

export const eyeball2 = box(.5, .5, .4, SILVER_COLOR);
merge(eyeball2, trans(box(.3, .3, .2, RED_COLOR), translate([0, 0, .25])));
merge(eyeball2, trans(box(.15, .15, .2, DARK_COLOR), translate([0, 0, .28])));
trans(eyeball2, translate([0, 1, 0]));

export const wing = trans(trans(box(.6, .1, .05, ALIEN_SKIN_COLOR), rotateAxis([0, 0, 1], -Math.PI/6)), translate([-1, .7, 0]));
merge(wing, trans(trans(box(.6, .1, .03, ALIEN_SKIN_COLOR), rotateAxis([0, 0, 1], Math.PI/4)), translate([-1.8, .5, 0])));
merge(wing, trans(trans(box(.5, .1, .02, ALIEN_SKIN_COLOR), rotateAxis([0, 0, 1], Math.PI/4)), translate([-1.5, .4, 0])));
merge(wing, trans(trans(box(.4, .1, .01, ALIEN_SKIN_COLOR), rotateAxis([0, 0, 1], Math.PI/4)), translate([-1.2, .3, 0])));
trans(wing, translate([0, 1, 0]));

export const watcher = merge(empty(), eyeball2);
const back = trans(trans(trans(box(.5, .5, .5, ALIEN_SKIN_COLOR), rotateAxis([0, 0, 1], Math.PI/4)), rotateAxis([1, 0, 0], Math.PI/4)), translate([0, 0, -.5]));
merge(back, trans(trans(trans(box(.5, .5, .5, ALIEN_SKIN_COLOR), rotateAxis([0, 0, 1], -Math.PI/4)), rotateAxis([1, 0, 0], -Math.PI/4)), translate([0, 0, -.5])));
trans(back, translate([0, 1, 0]));
merge(watcher, back);

export const foot = box(.2, .1, .3, ALIEN_SKIN_COLOR);

export const playerBody = box(.4, .4, .3, SAND_COLOR);
export const playerBody2 = box(.3, .3, .2, BLUE_COLOR);
trans(playerBody, translate([0, 1.7, 0]));
trans(playerBody2, translate([0, .7, 0]));
merge(playerBody, playerBody2);

export const wand = box(.1, .1, .1, WAND_COLOR);
trans(wand, rotateAxis([0, 0, 1], Math.PI/4));
trans(wand, scale([1, 1.5, .38]));
trans(wand, translate([0, .95, 0]));
merge(wand, box(.04, .8, .04, WOOD_COLOR));

const coil1 = empty();
merge(coil1, trans(box(.1, .012, .012, COIL_COLOR), translate([0, 0, -.105])));
merge(coil1, trans(box(.12, .01, .012, COIL_COLOR), translate([0, 0, .105])));
merge(coil1, trans(box(.01, .01, .12, COIL_COLOR), translate([-.105, 0, 0])));
merge(coil1, trans(box(.01, .01, .12, COIL_COLOR), translate([.105, 0, 0])));
export const coil = merge(empty(), coil1);
trans(coil1, scale([.8, 1, .8]));
trans(coil1, translate([0, .09, 0]));
merge(coil, coil1);
trans(coil1, scale([.8, 1, .8]));
trans(coil1, translate([0, .09, 0]));
merge(coil, coil1);
merge(coil, trans(box(.07, .07, .07, COIL_HEAD_COLOR), translate([0, .35, 0])));
trans(coil, translate([0, .5, 0]));
trans(coil, rotateAxis([0, 1, 0], Math.PI/24));
merge(coil, box(.015, .8, .015, WOOD_COLOR));
