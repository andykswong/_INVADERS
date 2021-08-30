import { mat4, ReadonlyMat4, ReadonlyVec4 } from 'munum';

export const NFT_STORAGE_ENDPOINT = 'https://api.nft.storage/upload';
export const NFT_SOTRAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEZlQTM2YTllQTRCNDVmNGY5MjBlNDA5N2MxZUQ2MEM2Q2UzNEY2MkYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzMDAzNjE1MzY3OCwibmFtZSI6IkpTMTNLMjAyMSJ9.DoVXYaDRFyE8vDSjmCmN2-E13jGl1muuAUyekJB0JXs';

export const WAVE_GENERATOR_MAX_ITER = 256;
export const WAVE_CYCLE = 5;
export const BEGINNER_BOSS_COUNT = 2;

export const PLAYER_HP = 3;
export const PLAYER_MAX_HP = 5;
export const PLAYER_POS_Z = 45;
export const ENEMY_WAVE_COUNTDOWN = 1;

export const I: ReadonlyMat4 = mat4.create();

export const NO_COLOR: ReadonlyVec4 = [0, 0, 0, 0];

export const SKY_COLOR: ReadonlyVec4 = [.13, .16, .18, 1];
// export const SKY_COLOR: ReadonlyVec4 = [.15, .22, .27, 1];
// export const SKY_COLOR: ReadonlyVec4 = [.09, .18, .25, 1];
// export const SKY_COLOR: ReadonlyVec4 = [.05, .07, .11, 1];
export const MOON_COLOR: ReadonlyVec4 = [1, .95, .65, .5];
// export const MOON_COLOR: ReadonlyVec4 = [1, .85, .64, .5];
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
