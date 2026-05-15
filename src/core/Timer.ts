/**
 * 计时器工具
 * 支持 setTimeout/setInterval/clear
 */
export class Timer {
  private static instance: Timer;
  private timers: Map<number, {
    type: 'timeout' | 'interval';
    callback: () => void;
    delay: number;
    elapsed: number;
    repeat: boolean;
    active: boolean;
  }> = new Map();
  private nextId: number = 1;

  private constructor() {}

  static getInstance(): Timer {
    if (!Timer.instance) {
      Timer.instance = new Timer();
    }
    return Timer.instance;
  }

  /**
   * 设置延时回调
   */
  setTimeout(callback: () => void, delay: number): number {
    const id = this.nextId++;
    this.timers.set(id, {
      type: 'timeout',
      callback,
      delay,
      elapsed: 0,
      repeat: false,
      active: true,
    });
    return id;
  }

  /**
   * 设置定时回调
   */
  setInterval(callback: () => void, delay: number): number {
    const id = this.nextId++;
    this.timers.set(id, {
      type: 'interval',
      callback,
      delay,
      elapsed: 0,
      repeat: true,
      active: true,
    });
    return id;
  }

  /**
   * 清除指定计时器
   */
  clearTimeout(id: number): void {
    this.timers.delete(id);
  }

  /**
   * 清除指定定时器
   */
  clearInterval(id: number): void {
    this.timers.delete(id);
  }

  /**
   * 清除所有计时器
   */
  clearAll(): void {
    this.timers.clear();
  }

  /**
   * 更新所有计时器（在游戏循环中调用）
   */
  update(dt: number): void {
    const dtMs = dt * 1000;
    const toRemove: number[] = [];

    this.timers.forEach((timer, id) => {
      if (!timer.active) return;

      timer.elapsed += dtMs;

      if (timer.elapsed >= timer.delay) {
        timer.callback();
        if (timer.repeat) {
          timer.elapsed -= timer.delay;
        } else {
          toRemove.push(id);
        }
      }
    });

    toRemove.forEach((id) => this.timers.delete(id));
  }
}
