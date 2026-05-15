/** 基础伤害值 */
export const BASE_DAMAGE = 10;

/** 暴击概率 */
export const CRITICAL_RATE = 0.15;

/** 暴击伤害倍率 */
export const CRITICAL_MULTIPLIER = 1.5;

/** 逃跑基础概率 */
export const FLEE_BASE_CHANCE = 0.4;

/** Buff持续回合数 */
export const BUFF_DURATION = 3;

/** 伤害浮动范围 */
export const DAMAGE_VARIANCE = 0.2;

/** 防御减伤比例 */
export const DEFENSE_REDUCTION = 0.5;

/** 治疗基础系数 */
export const HEAL_BASE_COEFFICIENT = 1.0;

/** 火球术伤害系数 */
export const FIREBALL_COEFFICIENT = 1.8;

/** 重击伤害倍率 */
export const HEAVY_STRIKE_MULTIPLIER = 1.5;

/** 最大战斗回合数（超过则判负） */
export const MAX_BATTLE_ROUNDS = 20;

/** 战斗动画延迟（毫秒） */
export const BATTLE_ANIMATION_DELAY = 500;

/** 战斗状态枚举 */
export enum BATTLE_STATE {
  IDLE = 'IDLE',
  PLAYER_TURN = 'PLAYER_TURN',
  ENEMY_TURN = 'ENEMY_TURN',
  ANIMATING = 'ANIMATING',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
  FLED = 'FLED',
}

/** 技能类型枚举 */
export enum SKILL_TYPE {
  ATTACK = 'ATTACK',
  HEAVY_STRIKE = 'HEAVY_STRIKE',
  DEFEND = 'DEFEND',
  FIREBALL = 'FIREBALL',
  HEAL = 'HEAL',
  FLEE = 'FLEE',
}

/** Buff类型枚举 */
export enum BUFF_TYPE {
  DEFEND_UP = 'DEFEND_UP',
  ATTACK_UP = 'ATTACK_UP',
  POISON = 'POISON',
  BURN = 'BURN',
  STUN = 'STUN',
}
