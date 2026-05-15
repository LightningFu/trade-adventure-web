import { Character } from './Character';
import { BUFF_TYPE, SKILL_TYPE } from '../../constants/BattleConfig';
import { randomInt, chance } from '../../utils/MathUtils';

/** AI行动结果 */
export interface AIAction {
  skillId: string;
  skillType: SKILL_TYPE;
  target: 'player' | 'self';
  message: string;
}

/**
 * 敌人AI
 * 根据性格和当前状态选择行动
 */
export class EnemyAI {
  private enemy: any;
  private personality: string;

  constructor(enemy: any, personality: string = 'balanced') {
    this.enemy = enemy;
    this.personality = personality;
  }

  /**
   * 选择行动
   */
  chooseAction(player: Character): AIAction {
    // 被眩晕则无法行动
    if (this.enemy.buffSystem.isStunned()) {
      return {
        skillId: 'none',
        skillType: SKILL_TYPE.ATTACK,
        target: 'player',
        message: `${this.enemy.name} 被眩晕了，无法行动！`,
      };
    }

    switch (this.personality) {
      case 'aggressive':
        return this.aggressiveAction(player);
      case 'cunning':
        return this.cunningAction(player);
      case 'balanced':
      default:
        return this.balancedAction(player);
    }
  }

  /**
   * 激进型AI - 优先攻击
   */
  private aggressiveAction(player: Character): AIAction {
    const hpPercent = this.enemy.getHpPercent();

    // HP低时有小概率防御
    if (hpPercent < 0.3 && chance(0.2)) {
      return {
        skillId: 'defend',
        skillType: SKILL_TYPE.DEFEND,
        target: 'self',
        message: `${this.enemy.name} 进入了防御姿态！`,
      };
    }

    // 30%概率使用重击
    if (chance(0.3)) {
      return {
        skillId: 'heavy_strike',
        skillType: SKILL_TYPE.HEAVY_STRIKE,
        target: 'player',
        message: `${this.enemy.name} 使用了重击！`,
      };
    }

    return {
      skillId: 'attack',
      skillType: SKILL_TYPE.ATTACK,
      target: 'player',
      message: `${this.enemy.name} 发动了攻击！`,
    };
  }

  /**
   * 狡猾型AI - 根据情况灵活应对
   */
  private cunningAction(player: Character): AIAction {
    const hpPercent = this.enemy.getHpPercent();
    const playerHpPercent = player.getHpPercent();

    // 玩家HP低时全力攻击
    if (playerHpPercent < 0.3 && chance(0.6)) {
      return {
        skillId: 'heavy_strike',
        skillType: SKILL_TYPE.HEAVY_STRIKE,
        target: 'player',
        message: `${this.enemy.name} 看准时机发动了重击！`,
      };
    }

    // 自身HP低时防御
    if (hpPercent < 0.4 && chance(0.5)) {
      return {
        skillId: 'defend',
        skillType: SKILL_TYPE.DEFEND,
        target: 'self',
        message: `${this.enemy.name} 谨慎地进入了防御姿态！`,
      };
    }

    // 随机选择攻击或重击
    if (chance(0.4)) {
      return {
        skillId: 'heavy_strike',
        skillType: SKILL_TYPE.HEAVY_STRIKE,
        target: 'player',
        message: `${this.enemy.name} 使用了重击！`,
      };
    }

    return {
      skillId: 'attack',
      skillType: SKILL_TYPE.ATTACK,
      target: 'player',
      message: `${this.enemy.name} 发动了攻击！`,
    };
  }

  /**
   * 均衡型AI - 攻防兼备
   */
  private balancedAction(player: Character): AIAction {
    const hpPercent = this.enemy.getHpPercent();
    const roll = randomInt(1, 100);

    // HP低时优先防御
    if (hpPercent < 0.25 && roll <= 40) {
      return {
        skillId: 'defend',
        skillType: SKILL_TYPE.DEFEND,
        target: 'self',
        message: `${this.enemy.name} 进入了防御姿态！`,
      };
    }

    // 20%概率重击
    if (roll <= 20) {
      return {
        skillId: 'heavy_strike',
        skillType: SKILL_TYPE.HEAVY_STRIKE,
        target: 'player',
        message: `${this.enemy.name} 使用了重击！`,
      };
    }

    // 有火球术技能时15%概率使用
    if (this.enemy.skills.includes('fireball') && roll <= 15) {
      return {
        skillId: 'fireball',
        skillType: SKILL_TYPE.FIREBALL,
        target: 'player',
        message: `${this.enemy.name} 释放了火球术！`,
      };
    }

    return {
      skillId: 'attack',
      skillType: SKILL_TYPE.ATTACK,
      target: 'player',
      message: `${this.enemy.name} 发动了攻击！`,
    };
  }
}
