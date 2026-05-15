import { FRAME_TIME } from '../constants/GameConfig';

/**
 * 游戏主循环 (Web 版本)
 * 使用标准 requestAnimationFrame
 */
export class GameLoop {
  private running: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private animFrameId: number = 0;
  private updateCallback: ((dt: number) => void) | null = null;
  private renderCallback: ((dt: number) => void) | null = null;

  /**
   * 设置更新回调
   */
  onUpdate(callback: (dt: number) => void): void {
    this.updateCallback = callback;
  }

  /**
   * 设置渲染回调
   */
  onRender(callback: (dt: number) => void): void {
    this.renderCallback = callback;
  }

  /**
   * 启动游戏循环
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }

  /**
   * 暂停游戏循环
   */
  pause(): void {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  /**
   * 恢复游戏循环
   */
  resume(): void {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.accumulator = 0;
      this.loop();
    }
  }

  /**
   * 停止游戏循环
   */
  stop(): void {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  /**
   * 主循环
   */
  private loop(): void {
    if (!this.running) return;

    const now = performance.now();
    let deltaTime = now - this.lastTime;
    this.lastTime = now;

    // 防止大跳帧（如切换后台回来）
    if (deltaTime > 200) {
      deltaTime = FRAME_TIME;
    }

    this.accumulator += deltaTime;

    // 固定时间步长更新
    while (this.accumulator >= FRAME_TIME) {
      if (this.updateCallback) {
        this.updateCallback(FRAME_TIME / 1000);
      }
      this.accumulator -= FRAME_TIME;
    }

    // 渲染
    if (this.renderCallback) {
      this.renderCallback(deltaTime / 1000);
    }

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * 是否正在运行
   */
  isRunning(): boolean {
    return this.running;
  }
}
