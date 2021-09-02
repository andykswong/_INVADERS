import { aabb, ReadonlyAABB, ReadonlyVec3, ReadonlyVec4 } from 'munum';

// Game configs
// ============

export const GAME_NAME = '_INVADERS';

// WebRTC configs
// ==============

export const ICE_SERVER_URLS = 'stun:stun.l.google.com:19302';
export const ICE_GATHERING_TIME_MS = 3000;
export const CONNECTION_TIMEOUT_MS = 15000;

// Control configs
// ===============

export const GAMEPAD_MOVE_THRESHOLD = 0.3 as const;
export const TOCUH_MOVE_THRESHOLD = 0.02 as const;

// Graphics configs
// ================

export const COMPONENTS_PER_MESH_INSTANCE = 16 as const;
export const COMPONENTS_PER_PARTICLE = 12 as const;

// Game physics configs
// ====================

export const MIN_BOUND: ReadonlyVec3 = [-20, 0, -50];
export const MAX_BOUND: ReadonlyVec3 = [20, 50, 50];
export const GRAVITY: ReadonlyVec3 = [0, -15, 0];

// Player configs
// ==============

export const PLAYER_HP = 3 as const;
export const PLAYER_MAX_HP = 5 as const;
export const MULTIPLAYER_POS_X = 10 as const;
export const PLAYER_POS_Z = 45 as const;
export const PLAYER_ATTACK_TIME = .5 as const;
export const PLAYER_SHAPE: ReadonlyAABB = aabb.create([-.5, 0, -.5], [.5, 2, .5]);
export const PLAYER_BOUND: ReadonlyAABB = aabb.create([-16, 0, 30], [16, 0, 50]);

// Enemy configs
// =============
export const WALKER_SHAPE: ReadonlyAABB = aabb.create([-.5, 0, -.5], [.5, 1.5, .5]);
export const FLIER_SHAPE: ReadonlyAABB = aabb.create([-.6, 2.4, -.6], [.6, 3.6, .6]);
export const WATCHER_SHAPE: ReadonlyAABB = aabb.create([-.6, .4, -.6], [.6, 1.6, .6]);

// Projectile configs
// ==================
export const PROJECTILE_TTL = 10 as const;

// Game wave generation configs
// ============================

export const ENEMY_WAVE_COUNTDOWN = 1 as const;
export const WAVE_GENERATOR_MAX_ITER = 256 as const;
export const WAVE_CYCLE = 4 as const;
export const BEGINNER_BOSS_COUNT = 2 as const;

// Colors used in game
// ===================

export const NO_COLOR: ReadonlyVec4 = [0, 0, 0, 0];

// export const SKY_COLOR: ReadonlyVec4 = [.15, .22, .27, 1];
// export const SKY_COLOR: ReadonlyVec4 = [.09, .18, .25, 1];
// export const SKY_COLOR: ReadonlyVec4 = [.05, .07, .11, 1];
// export const MOON_COLOR: ReadonlyVec4 = [1, .85, .64, .5];
export const SKY_COLOR: ReadonlyVec4 = [.13, .16, .18, 1];
export const MOON_COLOR: ReadonlyVec4 = [1, .95, .65, .5];
export const SILVER_COLOR: ReadonlyVec4 = [.92, .92, .92, .5];
export const BLOOD_COLOR: ReadonlyVec4 = [.3, .15, .15, .5];
export const FIRE_COLOR: ReadonlyVec4 = [.89, .38, .17, .5];
export const ICE_COLOR: ReadonlyVec4 = [.53, .84, .96, .7];
export const ENERGY_COLOR: ReadonlyVec4 = [.95, .85, .45, .7];

// export const GROUND_COLOR: ReadonlyVec4 = [.36, .51, .33, 10];
// export const GROUND_COLOR: ReadonlyVec4 = [.65, .76, .33, -.1];
export const SAND_COLOR: ReadonlyVec4 = [.94, .87, .71, 1];
export const ALIEN_SKIN_COLOR: ReadonlyVec4 = [.18, .13, .18, 1];
export const DARK_COLOR: ReadonlyVec4 = [.18, .13, .18, 3];
export const WOOD_COLOR: ReadonlyVec4 = [.18, .15, .15, 3];
export const RED_COLOR: ReadonlyVec4 = [.84, .23, .18, 1];
export const BLUE_COLOR: ReadonlyVec4 = [.29, .69, .78, 1];
export const WAND_COLOR: ReadonlyVec4 = [.89, .38, .17, -.95];
export const COIL_HEAD_COLOR: ReadonlyVec4 = [.95, .85, .45, -.9];
export const COIL_COLOR: ReadonlyVec4 = [.78, .74, .68, -.5];

// IPFS configs
// ============

export const IPFS_GATEWAY_ENDPOINT = 'https://cloudflare-ipfs.com';
export const NFT_STORAGE_ENDPOINT = 'https://api.nft.storage/upload';
export const NFT_SOTRAGE_KEY = process.env.NFT_SOTRAGE_KEY;
