import { quat, vec3 } from 'munum';
import { Node } from './core/node';
import { root } from './init';
import { Flier, Walker } from './enemies';

// Setup the intro scene

export const introNode = new Node(root);

const n = new Flier(introNode, 0, 1);
const n2 = new Flier(introNode, 0, 0,);
const n3 = new Walker(introNode, 0, 0);
const n4 = new Walker(introNode, 0, 1);
vec3.set(n.body.pos, 5, 5, 32);
vec3.set(n2.body.pos, -7, 4, 30);
vec3.set(n3.body.pos, 3, 0, 20);
vec3.set(n4.body.pos, -2.5, 0, 28);
quat.fromAxisAngle([0, 1, 0], -Math.PI / 8, n.r);
quat.fromAxisAngle([0, 1, 0], Math.PI / 8, n2.r);
quat.fromAxisAngle([0, 1, 0], -Math.PI / 12, n3.r);
quat.fromAxisAngle([0, 1, 0], Math.PI / 12, n4.r);
