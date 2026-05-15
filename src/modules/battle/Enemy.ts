import { Character } from './Character';
import enemiesData from '../../data/tables/enemies.json';

/** 敌人配置 */
interface EnemyConfig {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  hp: number;
  atk: number;
  def: number;
  exp: number;
  goldDrop: number;
  skills: string[];
  personality: string;
}

/**
 * 敌人类
 * 基于配置表生成敌人实例
 */
export class Enemy extends Character {
  readonly configId: string;
  readonly expReward: number;
  readonly goldDrop: number;
  readonly skills: string[];
  readonly personality: string;

  constructor(configId: string, playerLevel: number = 1) {
    const config = enemiesData.find((e) => e.id === configId) as EnemyConfig | undefined;
    if (!config) {
      throw new Error(`Enemy config not found: ${configId}`);
    }

    // 根据玩家等级缩放敌人属性
    const levelScale = 1 + (playerLevel - config.minLevel) * 0.1;
    const scaledHp = Math.floor(config.hp * Math.max(0.8, Math.min(2.0, levelScale)));
    const scaledAtk = Math.floor(config.atk * Math.max(0.8, Math.min(2.0, levelScale)));
    const scaledDef = Math.floor(config.def * Math.max(0.8, Math.min(2.0, levelScale)));

    super(config.name, playerLevel, scaledHp, scaledHp, 0, 0, scaledAtk, scaledDef);

    this.configId = configId;
    this.expReward = Math.floor(config.exp * Math.max(0.8, Math.min(2.0, levelScale)));
    this.goldDrop = Math.floor(config.goldDrop * Math.max(0.8, Math.min(2.0, levelScale)));
    this.skills = config.skills;
    this.personality = config.personality;
  }

  /**
   * 获取敌人描述
   */
  getDescription(): string {
    return `Lv.${this.level} ${this.name}`;
  }

  /**
   * 根据等级范围检查是否可出现
   */
  static canAppear(configId: string, playerLevel: number): boolean {
    const config = enemiesData.find((e) => e.id === configId) as EnemyConfig | undefined;
    if (!config) return false;
    return playerLevel >= config.minLevel && playerLevel <= config.maxLevel + 2;
  }

  /**
   * 获取适合玩家等级的敌人配置ID列表
   */
  static getAvailableEnemies(playerLevel: number, possibleIds: string[]): string[] {
    return possibleIds.filter((id) => Enemy.canAppear(id, playerLevel));
  }
}
