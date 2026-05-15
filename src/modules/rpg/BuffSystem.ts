import { BUFF_TYPE } from '../../constants/BattleConfig';

/** Buff 数据 */
export interface BuffData {
  type: BUFF_TYPE;
  name: string;
  duration: number;
  value: number;
  icon: string;
}

/**
 * Buff 系统
 * 管理增益/减益效果
 */
export class BuffSystem {
  private buffs: BuffData[] = [];

  /**
   * 添加 Buff
   */
  addBuff(type: BUFF_TYPE, name: string, duration: number, value: number): void {
    // 同类型 Buff 不叠加，刷新持续时间
    const existing = this.buffs.find((b) => b.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.value = Math.max(existing.value, value);
      return;
    }
    this.buffs.push({ type, name, duration, value, icon: this.getBuffIcon(type) });
  }

  /**
   * 移除 Buff
   */
  removeBuff(type: BUFF_TYPE): void {
    this.buffs = this.buffs.filter((b) => b.type !== type);
  }

  /**
   * 获取 Buff
   */
  getBuff(type: BUFF_TYPE): BuffData | undefined {
    return this.buffs.find((b) => b.type === type);
  }

  /**
   * 获取所有 Buff
   */
  getBuffs(): BuffData[] {
    return [...this.buffs];
  }

  /**
   * 回合结束处理
   */
  onTurnEnd(): BuffData[] {
    const expired: BuffData[] = [];
    this.buffs = this.buffs.filter((buff) => {
      buff.duration--;
      if (buff.duration <= 0) {
        expired.push(buff);
        return false;
      }
      return true;
    });
    return expired;
  }

  /**
   * 计算攻击力修正
   */
  getAttackModifier(): number {
    let modifier = 1.0;
    const atkUp = this.getBuff(BUFF_TYPE.ATTACK_UP);
    if (atkUp) {
      modifier += atkUp.value;
    }
    return modifier;
  }

  /**
   * 计算防御力修正
   */
  getDefenseModifier(): number {
    let modifier = 1.0;
    const defUp = this.getBuff(BUFF_TYPE.DEFEND_UP);
    if (defUp) {
      modifier += defUp.value;
    }
    return modifier;
  }

  /**
   * 是否有指定类型的 Buff
   */
  hasBuff(type: BUFF_TYPE): boolean {
    return this.buffs.some((b) => b.type === type);
  }

  /**
   * 是否被眩晕
   */
  isStunned(): boolean {
    return this.hasBuff(BUFF_TYPE.STUN);
  }

  /**
   * 获取毒素伤害
   */
  getPoisonDamage(): number {
    const poison = this.getBuff(BUFF_TYPE.POISON);
    return poison ? poison.value : 0;
  }

  /**
   * 获取灼烧伤害
   */
  getBurnDamage(): number {
    const burn = this.getBuff(BUFF_TYPE.BURN);
    return burn ? burn.value : 0;
  }

  /**
   * 清除所有 Buff
   */
  clearAll(): void {
    this.buffs = [];
  }

  /**
   * 获取 Buff 图标
   */
  private getBuffIcon(type: BUFF_TYPE): string {
    const icons: Record<string, string> = {
      [BUFF_TYPE.DEFEND_UP]: 'shield',
      [BUFF_TYPE.ATTACK_UP]: 'sword',
      [BUFF_TYPE.POISON]: 'skull',
      [BUFF_TYPE.BURN]: 'fire',
      [BUFF_TYPE.STUN]: 'star',
    };
    return icons[type] || 'circle';
  }
}
