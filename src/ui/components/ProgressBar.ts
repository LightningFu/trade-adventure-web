import { Renderer } from '../../core/Renderer';
import { PIXEL_SCALE, COLORS, FONT_SIZE } from '../../constants/GameConfig';

/**
 * 进度条组件（用于血条、经验条等）
 */
export class ProgressBar {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private value: number = 1.0;
  private maxValue: number = 1.0;
  private fillColor: string = COLORS.HP_BAR;
  private bgColor: string = COLORS.HP_BAR_BG;
  private borderColor: string = COLORS.PANEL_BORDER;
  private showText: boolean = true;
  private labelText: string = '';
  private visible: boolean = true;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: string,
    bgColor?: string
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (fillColor) this.fillColor = fillColor;
    if (bgColor) this.bgColor = bgColor;
  }

  /**
   * 渲染进度条
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    const px = Math.floor(this.x);
    const py = Math.floor(this.y);

    // 背景
    renderer.fillRect(px, py, this.width, this.height, this.bgColor);

    // 填充
    const fillWidth = Math.floor(this.width * this.getPercent());
    if (fillWidth > 0) {
      renderer.fillRect(px, py, fillWidth, this.height, this.fillColor);

      // 高光效果
      (renderer.getContext() as any).globalAlpha = 0.15;
      renderer.fillRect(px, py, fillWidth, Math.floor(this.height / 3), COLORS.WHITE);
      (renderer.getContext() as any).globalAlpha = 1.0;
    }

    // 边框
    renderer.drawRect(px, py, this.width, this.height, this.borderColor, 1);

    // 文字
    if (this.showText) {
      const text = this.labelText || `${Math.floor(this.value)}/${Math.floor(this.maxValue)}`;
      const fontSize = Math.max(FONT_SIZE.SMALL, Math.floor(this.height * 0.8));
      renderer.drawText(
        text,
        px + this.width / 2,
        py + (this.height - fontSize * PIXEL_SCALE) / 2,
        COLORS.WHITE,
        fontSize,
        'center'
      );
    }
  }

  /**
   * 设置值
   */
  setValue(value: number, maxValue?: number): void {
    this.value = Math.max(0, Math.min(value, maxValue || this.maxValue));
    if (maxValue !== undefined) {
      this.maxValue = maxValue;
    }
  }

  /**
   * 获取百分比
   */
  getPercent(): number {
    if (this.maxValue <= 0) return 0;
    return Math.max(0, Math.min(1, this.value / this.maxValue));
  }

  /**
   * 设置标签文字
   */
  setLabelText(text: string): void {
    this.labelText = text;
  }

  /**
   * 设置颜色
   */
  setColors(fill: string, bg: string, border: string): void {
    this.fillColor = fill;
    this.bgColor = bg;
    this.borderColor = border;
  }

  /**
   * 设置是否显示文字
   */
  setShowText(show: boolean): void {
    this.showText = show;
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
}
