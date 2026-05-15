import { BuffSystem } from '../rpg/BuffSystem';
import { BUFF_TYPE } from '../../constants/BattleConfig';

/**
 * 角色类
 * 管理HP/ATK/DEF/等级/经验/Buff
 */
export class Character {
  name: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  buffSystem: BuffSystem;
  isDefending: boolean = false;

  constructor(
    name: string = '商人',
    level: number = 1,
    hp: number = 100,
    maxHp: number = 100,
    mp: number = 30,
    maxMp: number = 30,
    atk: number = 12,
    def: number = 5
  ) {
    this.name = name;
    this.level = level;
    this.exp = 0;
    this.hp = hp;
    this.maxHp = maxHp;
    this.mp = mp;
    this.maxMp = maxMp;
    this.atk = atk;
    this.def = def;
    this.buffSystem = new BuffSystem();
  }

  /**
   * 受到伤害
   */
  takeDamage(damage: number): number {
    let actualDamage = damage;

    // 防御修正
    const defModifier = this.buffSystem.getDefenseModifier();
    let reducedDamage = Math.floor(this.def * defModifier * 0.5);

    // 防御姿态额外减伤
    if (this.isDefending) {
      reducedDamage = Math.floor(reducedDamage * 1.5);
      this.isDefending = false;
    }

    actualDamage = Math.max(1, actualDamage - reducedDamage);
    this.hp = Math.max(0, this.hp - actualDamage);
    return actualDamage;
  }

  /**
   * 恢复HP
   */
  heal(amount: number): number {
    const actualHeal = Math.min(amount, this.maxHp - this.hp);
    this.hp += actualHeal;
    return actualHeal;
  }

  /**
   * 恢复MP
   */
  restoreMp(amount: number): number {
    const actualRestore = Math.min(amount, this.maxMp - this.mp);
    this.mp += actualRestore;
    return actualRestore;
  }

  /**
   * 消耗MP
   */
  consumeMp(amount: number): boolean {
    if (this.mp < amount) return false;
    this.mp -= amount;
    return true;
  }

  /**
   * 获取实际攻击力（含 Buff 修正）
   */
  getActualAtk(): number {
    const modifier = this.buffSystem.getAttackModifier();
    return Math.floor(this.atk * modifier);
  }

  /**
   * 获取实际防御力（含 Buff 修正）
   */
  getActualDef(): number {
    const modifier = this.buffSystem.getDefenseModifier();
    return Math.floor(this.def * modifier);
  }

  /**
   * 是否存活
   */
  isAlive(): boolean {
    return this.hp > 0;
  }

  /**
   * 是否死亡
   */
  isDead(): boolean {
    return this.hp <= 0;
  }

  /**
   * 获取HP百分比
   */
  getHpPercent(): number {
    return this.maxHp > 0 ? this.hp / this.maxHp : 0;
  }

  /**
   * 获取MP百分比
   */
  getMpPercent(): number {
    return this.maxMp > 0 ? this.mp / this.maxMp : 0;
  }

  /**
   * 回合开始处理
   */
  onTurnStart(): void {
    // 处理持续伤害 Buff
    const poisonDmg = this.buffSystem.getPoisonDamage();
    if (poisonDmg > 0) {
      this.hp = Math.max(0, this.hp - poisonDmg);
    }

    const burnDmg = this.buffSystem.getBurnDamage();
    if (burnDmg > 0) {
      this.hp = Math.max(0, this.hp - burnDmg);
    }

    this.isDefending = false;
  }

  /**
   * 回合结束处理
   */
  onTurnEnd(): string[] {
    const messages: string[] = [];
    const expired = this.buffSystem.onTurnEnd();

    expired.forEach((buff) => {
      messages.push(`${buff.name} 效果消失了`);
    });

    return messages;
  }

  /**
   * 完全恢复
   */
  fullRestore(): void {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.buffSystem.clearAll();
    this.isDefending = false;
  }

  /**
   * 设置防御姿态
   */
  setDefending(): void {
    this.isDefending = true;
    this.buffSystem.addBuff(BUFF_TYPE.DEFEND_UP, '防御', 1, 0.5);
  }
}
