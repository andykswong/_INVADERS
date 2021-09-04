import { SILVER_COLOR, BLOOD_COLOR } from './const';
import { addParticles } from './core/graphics';
import { Node } from './core/node';

/**
 * Create particles for entity destruction.
 */
export function createDestructionParticles(entity: Node): void {
  addParticles(32, 0.2, 0.4, .3,
    [entity.body!.pos[0] + entity.body!.shape.min[0], entity.body!.pos[1] + entity.body!.shape.min[1], entity.body!.pos[2] + entity.body!.shape.min[2]],
    [entity.body!.pos[0] + entity.body!.shape.max[0], entity.body!.pos[1] + entity.body!.shape.max[1], entity.body!.pos[2] + entity.body!.shape.max[2]],
    [-10, -10, -10], [10, 10, 10],
    SILVER_COLOR
  );
  addParticles(32, 0.2, 0.4, .3,
    [entity.body!.pos[0] + entity.body!.shape.min[0], entity.body!.pos[1] + entity.body!.shape.min[1], entity.body!.pos[2] + entity.body!.shape.min[2]],
    [entity.body!.pos[0] + entity.body!.shape.max[0], entity.body!.pos[1] + entity.body!.shape.max[1], entity.body!.pos[2] + entity.body!.shape.max[2]],
    [-10, -10, -10], [10, 10, 10],
    BLOOD_COLOR
  );
}
