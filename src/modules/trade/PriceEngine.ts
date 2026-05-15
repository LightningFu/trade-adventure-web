import { PRICE_FLUCTUATION } from '../../constants/TradeConfig';
import { randomFloat } from '../../utils/MathUtils';

/**
 * 价格波动引擎
 * 基于随机因素和时间计算当前价格
 */
export class PriceEngine {
  private priceSeed: Map<string, number> = new Map();
  private dayCounter: number = 1;

  constructor() {
    this.initSeeds();
  }

  /**
   * 初始化价格种子
   */
  private initSeeds(): void {
    // 为不同货物类型设置基础波动种子
    const goodsIds = [
      'wood', 'grain', 'fish', 'salt',
      'iron', 'weapon', 'herb', 'silk',
      'spice', 'gem',
    ];
    goodsIds.forEach((id) => {
      this.priceSeed.set(id, randomFloat(-PRICE_FLUCTUATION, PRICE_FLUCTUATION));
    });
  }

  /**
   * 计算当前价格
   */
  calculatePrice(basePrice: number, goodsId: string, townId: string): number {
    const seed = this.priceSeed.get(goodsId) || 0;
    const townFactor = this.getTownPriceFactor(townId);
    const timeFactor = this.getTimeFactor();
    const randomFactor = randomFloat(-0.05, 0.05);

    const fluctuation = seed + townFactor + timeFactor + randomFactor;
    const clampedFluctuation = Math.max(-PRICE_FLUCTUATION, Math.min(PRICE_FLUCTUATION, fluctuation));

    const price = Math.round(basePrice * (1 + clampedFluctuation));
    return Math.max(1, price);
  }

  /**
   * 获取城镇价格因子
   * 产地价格低，远方价格高
   */
  private getTownPriceFactor(townId: string): number {
    const townGoods: Record<string, string[]> = {
      '1': ['wood', 'grain'],
      '2': ['fish', 'salt'],
      '3': ['iron', 'weapon'],
      '4': ['herb', 'silk'],
      '5': ['spice', 'gem'],
    };

    // 基础城镇因子
    const factors: Record<string, number> = {
      '1': 0.0,
      '2': 0.02,
      '3': 0.05,
      '4': 0.08,
      '5': 0.1,
    };

    return factors[townId] || 0;
  }

  /**
   * 获取时间因子
   * 模拟市场波动周期
   */
  private getTimeFactor(): number {
    return Math.sin(this.dayCounter * 0.5) * 0.1;
  }

  /**
   * 推进天数
   */
  advanceDay(days: number = 1): void {
    this.dayCounter += days;
    // 每天重新随机部分种子
    this.priceSeed.forEach((_, key) => {
      if (Math.random() < 0.3) {
        this.priceSeed.set(key, randomFloat(-PRICE_FLUCTUATION, PRICE_FLUCTUATION));
      }
    });
  }

  /**
   * 获取当前天数
   */
  getDay(): number {
    return this.dayCounter;
  }

  /**
   * 获取价格描述
   */
  getPriceDescription(currentPrice: number, basePrice: number): string {
    const ratio = currentPrice / basePrice;
    if (ratio < 0.7) return '暴跌';
    if (ratio < 0.85) return '偏低';
    if (ratio < 1.15) return '正常';
    if (ratio < 1.3) return '偏高';
    return '暴涨';
  }

  /**
   * 获取价格颜色
   */
  getPriceColor(currentPrice: number, basePrice: number): string {
    const ratio = currentPrice / basePrice;
    if (ratio < 0.85) return '#44FF44'; // 低于基础价 - 绿色（适合买入）
    if (ratio > 1.15) return '#FF4444'; // 高于基础价 - 红色（适合卖出）
    return '#FFFFFF'; // 正常 - 白色
  }
}
