import { Character } from './Character';
import { Enemy } from './Enemy';
import { EnemyAI, AIAction } from './EnemyAI';
import {
  BATTLE_STATE,
  SKILL_TYPE,
  BASE_DAMAGE,
  CRITICAL_RATE,
  CRITICAL_MULTIPLIER,
  DAMAGE_VARIANCE,
  FLEE_BASE_CHANCE,
  HEAL_BASE_COEFFICIENT,
  FIREBALL_COEFFICIENT,
  MAX_BATTLE_ROUNDS,
} from '../../constants/BattleConfig';
import { BUFF_TYPE } from '../../constants/BattleConfig';
import { randomFloat, chance } from '../../utils/MathUtils';
import skillsData from '../../data/tables/skills.json';

/** 战斗回合日志 */
export interface BattleLog {
  message: string;
  type: 'player' | 'enemy' | 'system' | 'critical';
}

/** 战斗结果 */
export interface BattleResult {
  victory: boolean;
  fled: boolean;
  expGained: number;
  goldGained: number;
  rounds: number;
  playerHp: number;
  playerMp: number;
}

/** 技能配置 */
interface SkillConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  mpCost: number;
  multiplier: number;
  target: string;
}

/**
 * 战斗系统核心
 * 管理战斗流程、回合制逻辑
 */
export class BattleSystem {
  private player: Character;
  private enemy: Enemy;
  private enemyAI: EnemyAI;
  private state: BATTLE_STATE = BATTLE_STATE.IDLE;
  private round: number = 0;
  private battleLog: BattleLog[] = [];
  private onLogCallback: ((log: BattleLog) => void) | null = null;
  private onStateChangeCallback: ((state: BATTLE_STATE) => void) | null = null;
  private onBattleEndCallback: ((result: BattleResult) => void) | null = null;

  constructor(player: Character, enemy: Enemy) {
    this.player = player;
    this.enemy = enemy;
    this.enemyAI = new EnemyAI(enemy, enemy.personality);
  }

  /**
   * 设置日志回调
   */
  onLog(callback: (log: BattleLog) => void): void {
    this.onLogCallback = callback;
  }

  /**
   * 设置状态变化回调
   */
  onStateChange(callback: (state: BATTLE_STATE) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * 设置战斗结束回调
   */
  onBattleEnd(callback: (result: BattleResult) => void): void {
    this.onBattleEndCallback = callback;
  }

  /**
   * 开始战斗
   */
  startBattle(): void {
    this.state = BATTLE_STATE.PLAYER_TURN;
    this.round = 1;
    this.battleLog = [];
    this.addLog(`战斗开始！遇到 ${this.enemy.name}！`, 'system');
    this.addLog(`第 ${this.round} 回合 - 你的回合`, 'system');
    this.notifyStateChange();
  }

  /**
   * 玩家使用技能
   */
  playerAction(skillId: string): void {
    if (this.state !== BATTLE_STATE.PLAYER_TURN) return;

    const skill = skillsData.find((s) => s.id === skillId) as SkillConfig | undefined;
    if (!skill) return;

    // 普通攻击不消耗MP，只有技能才消耗
    const isNormalAttack = skill.type === SKILL_TYPE.ATTACK;
    if (!isNormalAttack && skill.mpCost > 0 && !this.player.consumeMp(skill.mpCost)) {
      this.addLog('MP不足！', 'system');
      return;
    }

    // 执行玩家行动
    this.executePlayerAction(skill);

    // 检查敌人是否死亡
    if (this.enemy.isDead()) {
      this.endBattle(true, false);
      return;
    }

    // 切换到敌人回合
    this.state = BATTLE_STATE.ENEMY_TURN;
    this.notifyStateChange();
  }

  /**
   * 执行敌人回合
   */
  enemyTurn(): void {
    if (this.state !== BATTLE_STATE.ENEMY_TURN) return;

    this.enemy.onTurnStart();

    // 检查持续伤害是否致死
    if (this.enemy.isDead()) {
      this.addLog(`${this.enemy.name} 因持续伤害倒下了！`, 'system');
      this.endBattle(true, false);
      return;
    }

    const action: AIAction = this.enemyAI.chooseAction(this.player);
    this.addLog(action.message, 'enemy');

    // 执行敌人行动
    this.executeEnemyAction(action);

    // 检查玩家是否死亡
    if (this.player.isDead()) {
      this.endBattle(false, false);
      return;
    }

    // 检查最大回合数
    if (this.round >= MAX_BATTLE_ROUNDS) {
      this.addLog('战斗超时，你勉强逃脱了！', 'system');
      this.endBattle(false, true);
      return;
    }

    // 回合结束处理
    this.player.onTurnEnd().forEach((msg) => this.addLog(msg, 'system'));
    this.enemy.onTurnEnd().forEach((msg) => this.addLog(msg, 'system'));

    // 下一回合
    this.round++;
    this.state = BATTLE_STATE.PLAYER_TURN;
    this.addLog(`第 ${this.round} 回合 - 你的回合`, 'system');
    this.notifyStateChange();
  }

  /**
   * 执行玩家行动
   */
  private executePlayerAction(skill: SkillConfig): void {
    switch (skill.type as SKILL_TYPE) {
      case SKILL_TYPE.ATTACK: {
        const { damage, isCritical } = this.calculateDamage(this.player.getActualAtk(), 1.0);
        const actualDamage = this.enemy.takeDamage(damage);
        this.addLog(
          isCritical
            ? `暴击！对 ${this.enemy.name} 造成了 ${actualDamage} 点伤害！`
            : `对 ${this.enemy.name} 造成了 ${actualDamage} 点伤害`,
          isCritical ? 'critical' : 'player'
        );
        break;
      }

      case SKILL_TYPE.HEAVY_STRIKE: {
        const { damage, isCritical } = this.calculateDamage(this.player.getActualAtk(), 1.5);
        const actualDamage = this.enemy.takeDamage(damage);
        this.addLog(
          isCritical
            ? `暴击！重击对 ${this.enemy.name} 造成了 ${actualDamage} 点伤害！`
            : `重击对 ${this.enemy.name} 造成了 ${actualDamage} 点伤害`,
          isCritical ? 'critical' : 'player'
        );
        break;
      }

      case SKILL_TYPE.DEFEND: {
        this.player.setDefending();
        // 防御时回复少量MP（最大MP的10%）
        const mpRecover = Math.floor(this.player.maxMp * 0.1);
        const actualMpRecover = this.player.restoreMp(mpRecover);
        this.addLog('你进入了防御姿态，减伤提升！', 'player');
        if (actualMpRecover > 0) {
          this.addLog(`防御中恢复了 ${actualMpRecover} 点MP`, 'system');
        }
        break;
      }

      case SKILL_TYPE.FIREBALL: {
        const magicDamage = Math.floor(this.player.getActualAtk() * FIREBALL_COEFFICIENT);
        const { damage, isCritical } = this.calculateDamage(magicDamage, 1.0);
        // 火球术无视防御，直接造成魔法伤害
        const actualDamage = this.enemy.takeDamage(damage);
        this.addLog(
          isCritical
            ? `暴击！火球术对 ${this.enemy.name} 造成了 ${actualDamage} 点伤害！`
            : `火球术对 ${this.enemy.name} 造成了 ${actualDamage} 点伤害`,
          isCritical ? 'critical' : 'player'
        );
        // 30%概率附加灼烧
        if (chance(0.3)) {
          this.enemy.buffSystem.addBuff(BUFF_TYPE.BURN, '灼烧', 3, Math.floor(this.player.atk * 0.2));
          this.addLog(`${this.enemy.name} 被灼烧了！`, 'system');
        }
        break;
      }

      case SKILL_TYPE.HEAL: {
        const healAmount = Math.floor(this.player.getActualAtk() * HEAL_BASE_COEFFICIENT);
        const actualHeal = this.player.heal(healAmount);
        this.addLog(`治疗术恢复了 ${actualHeal} 点HP`, 'player');
        break;
      }

      case SKILL_TYPE.FLEE: {
        // 逃跑成功率基于等级差：我方等级比敌方高5级必成功
        const levelDiff = this.player.level - this.enemy.level;
        // 基础成功率40%，每级差增加10%，高5级以上100%成功
        let fleeChance = FLEE_BASE_CHANCE + levelDiff * 0.1;
        fleeChance = Math.min(1.0, Math.max(0.1, fleeChance)); // 限制在10%-100%
        
        if (chance(fleeChance)) {
          this.addLog('你成功逃离了战斗！', 'system');
          this.endBattle(false, true);
        } else {
          this.addLog('逃跑失败！', 'system');
        }
        break;
      }
    }
  }

  /**
   * 执行敌人行动
   */
  private executeEnemyAction(action: AIAction): void {
    if (action.skillId === 'none') return; // 被眩晕

    switch (action.skillType) {
      case SKILL_TYPE.ATTACK: {
        const { damage, isCritical } = this.calculateDamage(this.enemy.getActualAtk(), 1.0);
        const actualDamage = this.player.takeDamage(damage);
        this.addLog(
          isCritical
            ? `暴击！你受到了 ${actualDamage} 点伤害！`
            : `你受到了 ${actualDamage} 点伤害`,
          isCritical ? 'critical' : 'enemy'
        );
        break;
      }

      case SKILL_TYPE.HEAVY_STRIKE: {
        const { damage, isCritical } = this.calculateDamage(this.enemy.getActualAtk(), 1.5);
        const actualDamage = this.player.takeDamage(damage);
        this.addLog(
          isCritical
            ? `暴击！重击！你受到了 ${actualDamage} 点伤害！`
            : `重击！你受到了 ${actualDamage} 点伤害`,
          isCritical ? 'critical' : 'enemy'
        );
        break;
      }

      case SKILL_TYPE.DEFEND: {
        this.enemy.setDefending();
        break;
      }

      case SKILL_TYPE.FIREBALL: {
        const magicDamage = Math.floor(this.enemy.getActualAtk() * FIREBALL_COEFFICIENT);
        const { damage, isCritical } = this.calculateDamage(magicDamage, 1.0);
        const actualDamage = this.player.takeDamage(damage);
        this.addLog(
          isCritical
            ? `暴击！火球！你受到了 ${actualDamage} 点伤害！`
            : `火球！你受到了 ${actualDamage} 点伤害`,
          isCritical ? 'critical' : 'enemy'
        );
        if (chance(0.3)) {
          this.player.buffSystem.addBuff(BUFF_TYPE.BURN, '灼烧', 3, Math.floor(this.enemy.atk * 0.2));
          this.addLog('你被灼烧了！', 'system');
        }
        break;
      }

      case SKILL_TYPE.HEAL: {
        const healAmount = Math.floor(this.enemy.getActualAtk() * HEAL_BASE_COEFFICIENT);
        const actualHeal = this.enemy.heal(healAmount);
        this.addLog(`${this.enemy.name} 恢复了 ${actualHeal} 点HP`, 'enemy');
        break;
      }

      case SKILL_TYPE.FLEE: {
        // 敌人不逃跑
        break;
      }
    }
  }

  /**
   * 计算伤害
   */
  private calculateDamage(atk: number, multiplier: number): { damage: number; isCritical: boolean } {
    const isCritical = chance(CRITICAL_RATE);
    const variance = 1 + randomFloat(-DAMAGE_VARIANCE, DAMAGE_VARIANCE);
    let damage = Math.floor(atk * multiplier * variance);

    if (isCritical) {
      damage = Math.floor(damage * CRITICAL_MULTIPLIER);
    }

    return { damage: Math.max(1, damage), isCritical };
  }

  /**
   * 结束战斗
   */
  private endBattle(victory: boolean, fled: boolean): void {
    this.state = victory ? BATTLE_STATE.VICTORY : (fled ? BATTLE_STATE.FLED : BATTLE_STATE.DEFEAT);
    this.notifyStateChange();

    let expGained = 0;
    let goldGained = 0;

    if (victory) {
      expGained = this.enemy.expReward;
      goldGained = this.enemy.goldDrop;
      this.addLog(`战斗胜利！获得 ${expGained} 经验和 ${goldGained} 金币`, 'system');
    } else if (!fled) {
      this.addLog('你被击败了...', 'system');
    }

    const result: BattleResult = {
      victory,
      fled,
      expGained,
      goldGained,
      rounds: this.round,
      playerHp: this.player.hp,
      playerMp: this.player.mp,
    };

    if (this.onBattleEndCallback) {
      this.onBattleEndCallback(result);
    }
  }

  /**
   * 添加战斗日志
   */
  private addLog(message: string, type: BattleLog['type']): void {
    const log: BattleLog = { message, type };
    this.battleLog.push(log);
    if (this.onLogCallback) {
      this.onLogCallback(log);
    }
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.state);
    }
  }

  /**
   * 获取战斗状态
   */
  getState(): BATTLE_STATE {
    return this.state;
  }

  /**
   * 获取当前回合数
   */
  getRound(): number {
    return this.round;
  }

  /**
   * 获取战斗日志
   */
  getLog(): BattleLog[] {
    return [...this.battleLog];
  }

  /**
   * 获取玩家
   */
  getPlayer(): Character {
    return this.player;
  }

  /**
   * 获取敌人
   */
  getEnemy(): Enemy {
    return this.enemy;
  }

  /**
   * 获取可用技能列表
   */
  getAvailableSkills(): SkillConfig[] {
    return skillsData as SkillConfig[];
  }
}
