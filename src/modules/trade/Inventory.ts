import { InventoryItem } from '../../data/GameData';
import { MAX_INVENTORY_SLOTS } from '../../constants/TradeConfig';

/**
 * 背包系统
 * 管理物品的添加/移除/查询
 */
export class Inventory {
  private items: InventoryItem[] = [];

  constructor(items?: InventoryItem[]) {
    if (items) {
      this.items = [...items];
    }
  }

  /**
   * 添加物品
   */
  addItem(goodsId: string, quantity: number, buyPrice: number): boolean {
    // 先检查是否已有同类物品，合并堆叠
    const existing = this.items.find((item) => item.goodsId === goodsId);
    if (existing) {
      existing.quantity += quantity;
      existing.buyPrice = Math.round((existing.buyPrice + buyPrice) / 2);
      return true;
    }

    // 检查背包是否已满
    if (this.items.length >= MAX_INVENTORY_SLOTS) {
      return false;
    }

    this.items.push({ goodsId, quantity, buyPrice });
    return true;
  }

  /**
   * 移除物品
   */
  removeItem(goodsId: string, quantity: number): boolean {
    const index = this.items.findIndex((item) => item.goodsId === goodsId);
    if (index === -1) return false;

    const item = this.items[index];
    if (item.quantity < quantity) return false;

    item.quantity -= quantity;
    if (item.quantity <= 0) {
      this.items.splice(index, 1);
    }
    return true;
  }

  /**
   * 获取物品数量
   */
  getQuantity(goodsId: string): number {
    const item = this.items.find((i) => i.goodsId === goodsId);
    return item ? item.quantity : 0;
  }

  /**
   * 获取物品信息
   */
  getItem(goodsId: string): InventoryItem | undefined {
    return this.items.find((i) => i.goodsId === goodsId);
  }

  /**
   * 获取所有物品
   */
  getItems(): InventoryItem[] {
    return [...this.items];
  }

  /**
   * 获取已使用格数
   */
  getUsedSlots(): number {
    return this.items.length;
  }

  /**
   * 获取剩余格数
   */
  getFreeSlots(): number {
    return MAX_INVENTORY_SLOTS - this.items.length;
  }

  /**
   * 检查是否有空间
   */
  hasSpace(): boolean {
    return this.items.length < MAX_INVENTORY_SLOTS;
  }

  /**
   * 检查是否有指定物品
   */
  hasItem(goodsId: string, quantity: number = 1): boolean {
    return this.getQuantity(goodsId) >= quantity;
  }

  /**
   * 获取背包总价值（按买入价）
   */
  getTotalValue(): number {
    return this.items.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);
  }

  /**
   * 清空背包
   */
  clear(): void {
    this.items = [];
  }

  /**
   * 从存档数据恢复
   */
  loadFromData(items: InventoryItem[]): void {
    this.items = [...items];
  }

  /**
   * 导出数据
   */
  toData(): InventoryItem[] {
    return [...this.items];
  }
}
