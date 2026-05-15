/**
 * 触摸/鼠标输入管理器 (Web 版本)
 * 使用标准 DOM 事件，支持 Canvas 坐标转换
 */
export class InputManager {
  private static instance: InputManager;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private isTouching: boolean = false;
  private swipeThreshold: number = 30;
  private tapThreshold: number = 10;
  private tapCallback: ((x: number, y: number) => void) | null = null;
  private swipeCallback: ((direction: string, distance: number) => void) | null = null;
  private clickAreas: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    callback: (x: number, y: number) => void;
  }> = [];

  // Canvas 相关信息
  private canvas: HTMLCanvasElement | null = null;
  private canvasRect: DOMRect | null = null;
  private canvasScaleX: number = 1;
  private canvasScaleY: number = 1;

  private constructor() {
    this.bindEvents();
  }

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /**
   * 设置 Canvas 元素（用于坐标转换）
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.updateCanvasRect();
  }

  /**
   * 更新 Canvas 位置和缩放信息
   */
  private updateCanvasRect(): void {
    if (this.canvas) {
      this.canvasRect = this.canvas.getBoundingClientRect();
      // 计算缩放比例（逻辑尺寸 vs 实际尺寸）
      this.canvasScaleX = this.canvas.width / this.canvasRect.width;
      this.canvasScaleY = this.canvas.height / this.canvasRect.height;
    }
  }

  /**
   * 将客户端坐标转换为 Canvas 内部坐标
   */
  private clientToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    if (!this.canvas || !this.canvasRect) {
      return { x: clientX, y: clientY };
    }

    // 更新 Canvas rect（以防窗口大小改变）
    this.updateCanvasRect();

    // 计算 Canvas 内部的坐标
    const x = (clientX - this.canvasRect.left) * this.canvasScaleX;
    const y = (clientY - this.canvasRect.top) * this.canvasScaleY;

    return { x, y };
  }

  /**
   * 绑定 DOM 触摸/鼠标事件
   */
  private bindEvents(): void {
    // 触摸事件
    window.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const { x, y } = this.clientToCanvas(e.touches[0].clientX, e.touches[0].clientY);
        this.touchStartX = x;
        this.touchStartY = y;
        this.isTouching = true;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const { x, y } = this.clientToCanvas(e.touches[0].clientX, e.touches[0].clientY);
        this.touchEndX = x;
        this.touchEndY = y;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e: TouchEvent) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const { x, y } = this.clientToCanvas(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        this.touchEndX = x;
        this.touchEndY = y;
        this.isTouching = false;
        this.handleInput();
      }
    });

    window.addEventListener('touchcancel', () => {
      this.isTouching = false;
    });

    // 鼠标事件（桌面端支持）
    window.addEventListener('mousedown', (e: MouseEvent) => {
      const { x, y } = this.clientToCanvas(e.clientX, e.clientY);
      this.touchStartX = x;
      this.touchStartY = y;
      this.isTouching = true;
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isTouching) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);
        this.touchEndX = x;
        this.touchEndY = y;
      }
    });

    window.addEventListener('mouseup', (e: MouseEvent) => {
      const { x, y } = this.clientToCanvas(e.clientX, e.clientY);
      this.touchEndX = x;
      this.touchEndY = y;
      this.isTouching = false;
      this.handleInput();
    });

    // 窗口大小改变时更新 Canvas rect
    window.addEventListener('resize', () => {
      this.updateCanvasRect();
    });
  }

  /**
   * 处理输入
   */
  private handleInput(): void {
    const dx = this.touchEndX - this.touchStartX;
    const dy = this.touchEndY - this.touchStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 转换点击坐标为 Canvas 坐标
    const clickX = this.touchEndX;
    const clickY = this.touchEndY;

    if (distance < this.tapThreshold) {
      // 点击事件
      this.handleClick(clickX, clickY);
      if (this.tapCallback) {
        this.tapCallback(clickX, clickY);
      }
    } else if (distance >= this.swipeThreshold) {
      // 滑动事件
      let direction: string;
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }
      if (this.swipeCallback) {
        this.swipeCallback(direction, distance);
      }
    }
  }

  /**
   * 检查点击是否命中注册区域
   */
  private handleClick(x: number, y: number): void {
    for (let i = this.clickAreas.length - 1; i >= 0; i--) {
      const area = this.clickAreas[i];
      if (
        x >= area.x &&
        x <= area.x + area.width &&
        y >= area.y &&
        y <= area.y + area.height
      ) {
        area.callback(x, y);
        break;
      }
    }
  }

  /**
   * 注册点击区域
   */
  registerClickArea(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    callback: (x: number, y: number) => void
  ): void {
    // 移除同ID的旧区域
    this.unregisterClickArea(id);
    this.clickAreas.push({ id, x, y, width, height, callback });
  }

  /**
   * 移除点击区域
   */
  unregisterClickArea(id: string): void {
    this.clickAreas = this.clickAreas.filter((area) => area.id !== id);
  }

  /**
   * 清除所有点击区域
   */
  clearClickAreas(): void {
    this.clickAreas = [];
  }

  /**
   * 设置点击回调
   */
  setTapCallback(callback: (x: number, y: number) => void): void {
    this.tapCallback = callback;
  }

  /**
   * 设置滑动回调
   */
  setSwipeCallback(callback: (direction: string, distance: number) => void): void {
    this.swipeCallback = callback;
  }

  /**
   * 检查点是否在矩形内
   */
  static isPointInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }
}
