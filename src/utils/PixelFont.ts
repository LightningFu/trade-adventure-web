import { PIXEL_SCALE, FONT_SIZE, COLORS } from '../constants/GameConfig';

/**
 * 像素字体渲染工具
 * 使用 Canvas 绘制像素风文字
 */
export class PixelFont {
  private static instance: PixelFont;
  private ctx: CanvasRenderingContext2D | null = null;

  private constructor() {}

  static getInstance(): PixelFont {
    if (!PixelFont.instance) {
      PixelFont.instance = new PixelFont();
    }
    return PixelFont.instance;
  }

  /**
   * 设置渲染上下文
   */
  setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  /**
   * 绘制像素风格文字
   */
  drawText(
    text: string,
    x: number,
    y: number,
    color: string = COLORS.WHITE,
    size: number = FONT_SIZE.NORMAL,
    align: CanvasTextAlign = 'left'
  ): void {
    if (!this.ctx) return;

    const fontSize = size * PIXEL_SCALE;
    this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';

    // 文字阴影
    this.ctx.fillStyle = COLORS.BLACK;
    this.ctx.globalAlpha = 0.6;
    this.ctx.fillText(text, x + PIXEL_SCALE, y + PIXEL_SCALE);
    this.ctx.globalAlpha = 1.0;

    // 文字主体
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }

  /**
   * 绘制居中文字
   */
  drawTextCenter(
    text: string,
    centerX: number,
    y: number,
    color: string = COLORS.WHITE,
    size: number = FONT_SIZE.NORMAL
  ): void {
    this.drawText(text, centerX, y, color, size, 'center');
  }

  /**
   * 绘制带描边的文字
   */
  drawTextWithStroke(
    text: string,
    x: number,
    y: number,
    fillColor: string = COLORS.WHITE,
    strokeColor: string = COLORS.BLACK,
    size: number = FONT_SIZE.NORMAL,
    align: CanvasTextAlign = 'left'
  ): void {
    if (!this.ctx) return;

    const fontSize = size * PIXEL_SCALE;
    this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';

    // 描边（四个方向偏移）
    this.ctx.fillStyle = strokeColor;
    const offsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [1, -1], [-1, 1], [1, 1],
    ];
    offsets.forEach(([ox, oy]) => {
      this.ctx?.fillText(text, x + ox * PIXEL_SCALE, y + oy * PIXEL_SCALE);
    });

    // 填充
    this.ctx.fillStyle = fillColor;
    this.ctx.fillText(text, x, y);
  }

  /**
   * 绘制闪烁文字
   */
  drawBlinkText(
    text: string,
    x: number,
    y: number,
    color: string = COLORS.YELLOW,
    size: number = FONT_SIZE.NORMAL,
    time: number = 0
  ): void {
    const alpha = Math.abs(Math.sin(time * 3));
    if (this.ctx) {
      this.ctx.globalAlpha = alpha;
    }
    this.drawText(text, x, y, color, size);
    if (this.ctx) {
      this.ctx.globalAlpha = 1.0;
    }
  }

  /**
   * 绘制多行文字
   */
  drawMultilineText(
    lines: string[],
    x: number,
    y: number,
    lineHeight: number = FONT_SIZE.NORMAL + 4,
    color: string = COLORS.WHITE,
    size: number = FONT_SIZE.NORMAL
  ): void {
    lines.forEach((line, index) => {
      this.drawText(line, x, y + index * lineHeight * PIXEL_SCALE, color, size);
    });
  }

  /**
   * 计算文字宽度
   */
  measureText(text: string, size: number = FONT_SIZE.NORMAL): number {
    if (!this.ctx) return text.length * size * PIXEL_SCALE;
    const fontSize = size * PIXEL_SCALE;
    this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    return this.ctx.measureText(text).width;
  }
}
