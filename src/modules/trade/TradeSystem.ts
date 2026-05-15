import { Inventory } from './Inventory';
import { PriceEngine } from './PriceEngine';
import { InventoryItem } from '../../data/GameData';
import { TRADE_ACTION } from '../../constants/TradeConfig';
import townsData from '../../data/tables/towns.json';
import goodsData from '../../data/tables/goods.json';

/** 交易结果 */
export interface TradeResult {
  success: boolean;
  message: string;
  goldChange: number;
  itemChange?: { goodsId: string; quantity: number };
}

/** 城镇货物信息 */
export interface TownGoodsInfo {
  goodsId: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  priceDescription: string;
  priceColor: string;
  type: string;
  icon: string;
}

/**
 * 交易系统
 * 处理买卖逻辑，计算价格波动
 */
export class TradeSystem {
  private inventory: Inventory;
  private priceEngine: PriceEngine;

  constructor(inventory: Inventory) {
    this.inventory = inventory;
    this.priceEngine = new PriceEngine();
  }

  /**
   * 获取价格引擎
   */
  getPriceEngine(): PriceEngine {
    return this.priceEngine;
  }

  /**
   * 获取城镇可交易的货物列表
   */
  getTownGoods(townId: string): TownGoodsInfo[] {
    const town = townsData.find((t) => t.id === townId);
    if (!town) return [];

    return town.goods.map((tg) => {
      const goods = goodsData.find((g) => g.id === tg.goodsId);
      if (!goods) return null;

      const currentPrice = this.priceEngine.calculatePrice(tg.basePrice, tg.goodsId, townId);
      return {
        goodsId: goods.id,
        name: goods.name,
        basePrice: tg.basePrice,
        currentPrice,
        priceDescription: this.priceEngine.getPriceDescription(currentPrice, tg.basePrice),
        priceColor: this.priceEngine.getPriceColor(currentPrice, tg.basePrice),
        type: goods.type,
        icon: goods.icon,
      };
    }).filter(Boolean) as TownGoodsInfo[];
  }

  /**
   * 获取货物信息
   */
  getGoodsInfo(goodsId: string): { name: string; basePrice: number; type: string; icon: string } | null {
    const goods = goodsData.find((g) => g.id === goodsId);
    if (!goods) return null;
    return {
      name: goods.name,
      basePrice: goods.basePrice,
      type: goods.type,
      icon: goods.icon,
    };
  }

  /**
   * 买入货物
   */
  buy(goodsId: string, quantity: number, townId: string, currentGold: number): TradeResult {
    if (quantity <= 0) {
      return { success: false, message: '数量必须大于0', goldChange: 0 };
    }

    // 获取当前价格
    const town = townsData.find((t) => t.id === townId);
    if (!town) {
      return { success: false, message: '城镇不存在', goldChange: 0 };
    }

    const townGoods = town.goods.find((g) => g.goodsId === goodsId);
    if (!townGoods) {
      return { success: false, message: '该城镇不出产此货物', goldChange: 0 };
    }

    const currentPrice = this.priceEngine.calculatePrice(townGoods.basePrice, goodsId, townId);
    const totalCost = currentPrice * quantity;

    if (currentGold < totalCost) {
      return { success: false, message: '金币不足', goldChange: 0 };
    }

    if (!this.inventory.hasSpace() && !this.inventory.hasItem(goodsId)) {
      return { success: false, message: '背包已满', goldChange: 0 };
    }

    const added = this.inventory.addItem(goodsId, quantity, currentPrice);
    if (!added) {
      return { success: false, message: '添加物品失败', goldChange: 0 };
    }

    return {
      success: true,
      message: `购买了 ${quantity} 个 ${this.getGoodsInfo(goodsId)?.name || goodsId}`,
      goldChange: -totalCost,
      itemChange: { goodsId, quantity },
    };
  }

  /**
   * 卖出货物
   */
  sell(goodsId: string, quantity: number, townId: string): TradeResult {
    if (quantity <= 0) {
      return { success: false, message: '数量必须大于0', goldChange: 0 };
    }

    if (!this.inventory.hasItem(goodsId, quantity)) {
      return { success: false, message: '物品数量不足', goldChange: 0 };
    }

    // 卖出价格：当前城镇该货物的买入价 * 0.9
    const town = townsData.find((t) => t.id === townId);
    let sellPrice = 0;
    if (town) {
      const townGoods = town.goods.find((g) => g.goodsId === goodsId);
      if (townGoods) {
        sellPrice = Math.round(this.priceEngine.calculatePrice(townGoods.basePrice, goodsId, townId) * 0.9);
      }
    }

    // 如果该城镇不收此货物，按基础价 0.7 折回收
    if (sellPrice === 0) {
      const goods = goodsData.find((g) => g.id === goodsId);
      if (goods) {
        sellPrice = Math.round(goods.basePrice * 0.7);
      }
    }

    const totalRevenue = sellPrice * quantity;
    this.inventory.removeItem(goodsId, quantity);

    return {
      success: true,
      message: `卖出了 ${quantity} 个 ${this.getGoodsInfo(goodsId)?.name || goodsId}`,
      goldChange: totalRevenue,
      itemChange: { goodsId, quantity: -quantity },
    };
  }

  /**
   * 推进时间（旅行后调用）
   */
  advanceTime(days: number): void {
    this.priceEngine.advanceDay(days);
  }

  /**
   * 获取背包
   */
  getInventory(): Inventory {
    return this.inventory;
  }

  /**
   * 获取当前天数
   */
  getCurrentDay(): number {
    return this.priceEngine.getDay();
  }
}
