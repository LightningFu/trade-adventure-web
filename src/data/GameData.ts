import { GAME_STATE, COLORS } from '../constants/GameConfig';
import { INITIAL_GOLD } from '../constants/TradeConfig';

/** 存档数据结构 */
export interface SaveData {
  version: number;
  state: GAME_STATE;
  player: PlayerData;
  currentTownId: string;
  visitedTowns: string[];
  totalBattles: number;
  totalTrades: number;
  totalGoldEarned: number;
  totalDistance: number;
  playTime: number;
}

/** 玩家数据 */
export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  gold: number;
  inventory: InventoryItem[];
}

/** 背包物品 */
export interface InventoryItem {
  goodsId: string;
  quantity: number;
  buyPrice: number;
}

/**
 * 运行时游戏数据
 * 管理玩家状态、当前场景、游戏进度
 */
export class GameData {
  state: GAME_STATE = GAME_STATE.MENU;
  player: PlayerData;
  currentTownId: string = '1';
  visitedTowns: string[] = ['1'];
  totalBattles: number = 0;
  totalTrades: number = 0;
  totalGoldEarned: number = 0;
  totalDistance: number = 0;
  playTime: number = 0;

  constructor() {
    this.player = this.createDefaultPlayer();
  }

  /**
   * 创建默认玩家数据
   */
  private createDefaultPlayer(): PlayerData {
    return {
      name: '商人',
      level: 1,
      exp: 0,
      hp: 100,
      maxHp: 100,
      mp: 30,
      maxMp: 30,
      atk: 12,
      def: 5,
      gold: INITIAL_GOLD,
      inventory: [],
    };
  }

  /**
   * 重置游戏数据
   */
  reset(): void {
    this.state = GAME_STATE.MENU;
    this.player = this.createDefaultPlayer();
    this.currentTownId = '1';
    this.visitedTowns = ['1'];
    this.totalBattles = 0;
    this.totalTrades = 0;
    this.totalGoldEarned = 0;
    this.totalDistance = 0;
    this.playTime = 0;
  }

  /**
   * 从存档加载数据
   */
  loadFromSave(data: SaveData): void {
    this.state = data.state;
    this.player = { ...data.player };
    this.currentTownId = data.currentTownId;
    this.visitedTowns = [...data.visitedTowns];
    this.totalBattles = data.totalBattles;
    this.totalTrades = data.totalTrades;
    this.totalGoldEarned = data.totalGoldEarned;
    this.totalDistance = data.totalDistance;
    this.playTime = data.playTime;
  }

  /**
   * 导出为存档数据
   */
  toSaveData(): SaveData {
    return {
      version: 1,
      state: this.state,
      player: { ...this.player },
      currentTownId: this.currentTownId,
      visitedTowns: [...this.visitedTowns],
      totalBattles: this.totalBattles,
      totalTrades: this.totalTrades,
      totalGoldEarned: this.totalGoldEarned,
      totalDistance: this.totalDistance,
      playTime: this.playTime,
    };
  }

  /**
   * 添加经验值
   */
  addExp(amount: number): number {
    this.player.exp += amount;
    return this.player.exp;
  }

  /**
   * 检查是否升级
   */
  checkLevelUp(currentLevelExp: number, nextLevelExp: number): boolean {
    return this.player.exp >= nextLevelExp;
  }

  /**
   * 升级
   */
  levelUp(newMaxHp: number, newMaxMp: number, newAtk: number, newDef: number): void {
    this.player.level++;
    this.player.maxHp = newMaxHp;
    this.player.hp = newMaxHp;
    this.player.maxMp = newMaxMp;
    this.player.mp = newMaxMp;
    this.player.atk = newAtk;
    this.player.def = newDef;
  }

  /**
   * 增加金币
   */
  addGold(amount: number): void {
    this.player.gold += amount;
    if (amount > 0) {
      this.totalGoldEarned += amount;
    }
  }

  /**
   * 检查是否有足够金币
   */
  hasGold(amount: number): boolean {
    return this.player.gold >= amount;
  }

  /**
   * 访问城镇
   */
  visitTown(townId: string): void {
    if (!this.visitedTowns.includes(townId)) {
      this.visitedTowns.push(townId);
    }
    this.currentTownId = townId;
  }

  /**
   * 检查城镇是否已解锁
   */
  isTownUnlocked(townId: string, requiredLevel: number): boolean {
    return this.player.level >= requiredLevel;
  }
}
