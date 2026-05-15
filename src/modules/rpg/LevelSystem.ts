import levelsData from '../../data/tables/levels.json';

/** 等级数据 */
interface LevelData {
  level: number;
  expRequired: number;
}

/**
 * 等级系统
 * 经验计算、升级、属性成长
 */
export class LevelSystem {
  private levelData: LevelData[];

  constructor() {
    this.levelData = levelsData as LevelData[];
  }

  /**
   * 获取指定等级所需经验
   */
  getExpRequired(level: number): number {
    if (level <= 1) return 0;
    if (level > this.levelData.length) {
      return this.levelData[this.levelData.length - 1].expRequired;
    }
    return this.levelData[level - 1].expRequired;
  }

  /**
   * 获取下一级所需经验
   */
  getNextLevelExp(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    if (nextLevel > this.levelData.length) {
      return this.levelData[this.levelData.length - 1].expRequired;
    }
    return this.levelData[nextLevel - 1].expRequired;
  }

  /**
   * 检查是否可以升级
   */
  canLevelUp(currentLevel: number, currentExp: number): boolean {
    if (currentLevel >= this.getMaxLevel()) return false;
    return currentExp >= this.getNextLevelExp(currentLevel);
  }

  /**
   * 获取最大等级
   */
  getMaxLevel(): number {
    return this.levelData.length;
  }

  /**
   * 计算升级后的属性
   */
  calculateLevelUpStats(level: number): {
    maxHp: number;
    maxMp: number;
    atk: number;
    def: number;
  } {
    // 基础属性 + 等级成长
    const baseHp = 100;
    const baseMp = 30;
    const baseAtk = 12;
    const baseDef = 5;

    const hpGrowth = 15 + Math.floor(level * 2);
    const mpGrowth = 5 + Math.floor(level * 1);
    const atkGrowth = 3 + Math.floor(level * 0.5);
    const defGrowth = 2 + Math.floor(level * 0.4);

    return {
      maxHp: baseHp + (level - 1) * hpGrowth,
      maxMp: baseMp + (level - 1) * mpGrowth,
      atk: baseAtk + (level - 1) * atkGrowth,
      def: baseDef + (level - 1) * defGrowth,
    };
  }

  /**
   * 获取当前等级经验进度
   */
  getExpProgress(currentLevel: number, currentExp: number): number {
    const currentLevelExp = this.getExpRequired(currentLevel);
    const nextLevelExp = this.getNextLevelExp(currentLevel);
    const expRange = nextLevelExp - currentLevelExp;

    if (expRange <= 0) return 1;
    const progress = (currentExp - currentLevelExp) / expRange;
    return Math.max(0, Math.min(1, progress));
  }
}
