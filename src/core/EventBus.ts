/** 事件回调类型 */
type EventCallback = (...args: any[]) => void;

/**
 * 简单的发布-订阅事件总线
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 注册事件监听
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * 移除事件监听
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`[EventBus] Error in event "${event}":`, e);
        }
      });
    }
  }

  /**
   * 注册一次性事件监听
   */
  once(event: string, callback: EventCallback): void {
    const wrapper: EventCallback = (...args: any[]) => {
      this.off(event, wrapper);
      callback(...args);
    };
    this.on(event, wrapper);
  }

  /**
   * 清除所有事件监听
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 清除指定事件的所有监听
   */
  clearEvent(event: string): void {
    this.listeners.delete(event);
  }
}
