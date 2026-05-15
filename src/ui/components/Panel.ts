import { Renderer } from '../../core/Renderer';
import { PIXEL_SCALE, COLORS, FONT_SIZE } from '../../constants/GameConfig';

/**
 * 面板基类
 * 像素风格边框
 */
export class Panel {
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected bgColor: string = COLORS.PANEL_BG;
  protected borderColor: string = COLORS.PANEL_BORDER;
  protected title: string = '';
  protected visible: boolean = true;
  protected padding: number = 8;

  constructor(x: number, y: number, width: number, height: number, title?: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (title) {
      this.title = title;
    }
  }

  /**
   * 渲染面板
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    // 绘制像素风格矩形
    renderer.drawPixelRect(this.x, this.y, this.width, this.height, this.bgColor, this.borderColor);

    // 绘制标题
    if (this.title) {
      this.renderTitle(renderer);
    }
  }

  /**
   * 渲染标题栏
   */
  protected renderTitle(renderer: Renderer): void {
    const titleBarHeight = FONT_SIZE.NORMAL * PIXEL_SCALE + this.padding * 2;

    // 标题栏背景
    renderer.fillRect(
      this.x + PIXEL_SCALE,
      this.y + PIXEL_SCALE,
      this.width - PIXEL_SCALE * 2,
      titleBarHeight,
      COLORS.DARK_GRAY
    );

    // 标题文字
    renderer.drawText(
      this.title,
      this.x + this.width / 2,
      this.y + this.padding,
      COLORS.GOLD,
      FONT_SIZE.NORMAL,
      'center'
    );

    // 标题栏下分隔线
    renderer.fillRect(
      this.x + PIXEL_SCALE,
      this.y + titleBarHeight,
      this.width - PIXEL_SCALE * 2,
      PIXEL_SCALE,
      COLORS.PANEL_BORDER
    );
  }

  /**
   * 获取内容区域（去掉标题栏）
   */
  getContentArea(): { x: number; y: number; width: number; height: number } {
    const titleBarHeight = this.title
      ? FONT_SIZE.NORMAL * PIXEL_SCALE + this.padding * 2 + PIXEL_SCALE
      : 0;
    return {
      x: this.x + this.padding,
      y: this.y + titleBarHeight + this.padding,
      width: this.width - this.padding * 2,
      height: this.height - titleBarHeight - this.padding * 2,
    };
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置颜色
   */
  setColors(bg: string, border: string): void {
    this.bgColor = bg;
    this.borderColor = border;
  }

  /**
   * 是否可见
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 获取位置
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * 获取尺寸
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
