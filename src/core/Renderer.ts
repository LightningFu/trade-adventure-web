import { SCREEN_WIDTH, SCREEN_HEIGHT, PIXEL_SCALE, COLORS, FONT_SIZE } from '../constants/GameConfig';

/**
 * Canvas 2D 渲染器 (Web 版本)
 * 使用标准 HTML5 Canvas API
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(canvas?: HTMLCanvasElement) {
    // Web 版本：使用传入的 canvas 或创建新的
    this.canvas = canvas || document.createElement('canvas');
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;

    // 如果没有传入 canvas，自动添加到 body
    if (!canvas) {
      this.canvas.style.display = 'block';
      this.canvas.style.margin = '0 auto';
      this.canvas.style.maxWidth = '100%';
      this.canvas.style.maxHeight = '100vh';
      document.body.appendChild(this.canvas);
    }
  }

  /**
   * 获取 Canvas 上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 获取 Canvas
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 清屏
   */
  clear(): void {
    this.ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /**
   * 用指定颜色填充整个屏幕
   */
  fillScreen(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /**
   * 绘制矩形边框
   */
  drawRect(x: number, y: number, w: number, h: number, color: string, lineWidth: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(
      Math.floor(x + this.cameraX),
      Math.floor(y + this.cameraY),
      w,
      h
    );
  }

  /**
   * 绘制填充矩形
   */
  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.floor(x + this.cameraX),
      Math.floor(y + this.cameraY),
      w,
      h
    );
  }

  /**
   * 绘制像素风格矩形（带边框和阴影）
   */
  drawPixelRect(x: number, y: number, w: number, h: number, bgColor: string, borderColor: string): void {
    const px = Math.floor(x + this.cameraX);
    const py = Math.floor(y + this.cameraY);

    // 阴影
    this.ctx.fillStyle = COLORS.BLACK;
    this.ctx.fillRect(px + PIXEL_SCALE, py + PIXEL_SCALE, w, h);

    // 背景
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(px, py, w, h);

    // 边框 - 上
    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(px, py, w, PIXEL_SCALE);
    // 边框 - 下
    this.ctx.fillRect(px, py + h - PIXEL_SCALE, w, PIXEL_SCALE);
    // 边框 - 左
    this.ctx.fillRect(px, py, PIXEL_SCALE, h);
    // 边框 - 右
    this.ctx.fillRect(px + w - PIXEL_SCALE, py, PIXEL_SCALE, h);

    // 高光 - 左上
    this.ctx.fillStyle = COLORS.WHITE;
    this.ctx.globalAlpha = 0.15;
    this.ctx.fillRect(px + PIXEL_SCALE, py + PIXEL_SCALE, w - PIXEL_SCALE * 2, PIXEL_SCALE);
    this.ctx.fillRect(px + PIXEL_SCALE, py + PIXEL_SCALE, PIXEL_SCALE, h - PIXEL_SCALE * 2);
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * 绘制文本
   */
  drawText(text: string, x: number, y: number, color: string, fontSize: number = FONT_SIZE.NORMAL, align: CanvasTextAlign = 'left'): void {
    const px = Math.floor(x + this.cameraX);
    const py = Math.floor(y + this.cameraY);

    this.ctx.font = `bold ${fontSize * PIXEL_SCALE}px "Courier New", monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';

    // 文字阴影
    this.ctx.fillStyle = COLORS.BLACK;
    this.ctx.fillText(text, px + 1, py + 1);

    // 文字主体
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, px, py);
  }

  /**
   * 绘制居中文本
   */
  drawTextCenter(text: string, y: number, color: string, fontSize: number = FONT_SIZE.NORMAL): void {
    this.drawText(text, SCREEN_WIDTH / 2, y, color, fontSize, 'center');
  }

  /**
   * 绘制图片
   */
  drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number): void {
    const px = Math.floor(x + this.cameraX);
    const py = Math.floor(y + this.cameraY);
    if (width && height) {
      this.ctx.drawImage(image, px, py, width, height);
    } else {
      this.ctx.drawImage(image, px, py);
    }
  }

  /**
   * 绘制精灵（带裁剪）
   */
  drawSprite(
    image: HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number,
    dx: number, dy: number, dw: number, dh: number
  ): void {
    const px = Math.floor(dx + this.cameraX);
    const py = Math.floor(dy + this.cameraY);
    this.ctx.drawImage(image, sx, sy, sw, sh, px, py, dw, dh);
  }

  /**
   * 设置视口偏移（相机）
   */
  setCamera(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
  }

  /**
   * 获取相机位置
   */
  getCamera(): { x: number; y: number } {
    return { x: this.cameraX, y: this.cameraY };
  }

  /**
   * 重置相机
   */
  resetCamera(): void {
    this.cameraX = 0;
    this.cameraY = 0;
  }

  /**
   * 绘制像素点
   */
  drawPixel(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.floor(x + this.cameraX),
      Math.floor(y + this.cameraY),
      PIXEL_SCALE,
      PIXEL_SCALE
    );
  }

  /**
   * 绘制像素线条
   */
  drawPixelLine(x1: number, y1: number, x2: number, y2: number, color: string): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = PIXEL_SCALE;
    this.ctx.beginPath();
    this.ctx.moveTo(
      Math.floor(x1 + this.cameraX),
      Math.floor(y1 + this.cameraY)
    );
    this.ctx.lineTo(
      Math.floor(x2 + this.cameraX),
      Math.floor(y2 + this.cameraY)
    );
    this.ctx.stroke();
  }

  /**
   * 获取屏幕尺寸
   */
  getScreenSize(): { width: number; height: number } {
    return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
  }
}
