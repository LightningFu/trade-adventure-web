/** 初始金币 */
export const INITIAL_GOLD = 500;

/** 最大背包格数 */
export const MAX_INVENTORY_SLOTS = 20;

/** 价格波动幅度 (30%) */
export const PRICE_FLUCTUATION = 0.3;

/** 城镇解锁所需等级 */
export const TOWN_UNLOCK_LEVELS: Record<string, number> = {
  '1': 1,   // 清风镇
  '2': 1,   // 碧水城
  '3': 3,   // 赤焰堡
  '4': 5,   // 翡翠林
  '5': 8,   // 黄金沙港
};

/** 旅行速度（每秒前进的进度百分比） */
export const TRAVEL_SPEED = 0.5;

/** 随机事件触发概率 */
export const RANDOM_EVENT_CHANCE = 0.3;

/** 旅行事件类型 */
export enum TRAVEL_EVENT_TYPE {
  NONE = 'NONE',
  BATTLE = 'BATTLE',
  MERCHANT = 'MERCHANT',
  TREASURE = 'TREASURE',
  TRAP = 'TRAP',
  REST = 'REST',
}

/** 交易类型 */
export enum TRADE_ACTION {
  BUY = 'BUY',
  SELL = 'SELL',
}

/** 货物类型 */
export enum GOODS_TYPE {
  MATERIAL = 'MATERIAL',
  FOOD = 'FOOD',
  EQUIPMENT = 'EQUIPMENT',
  LUXURY = 'LUXURY',
}
