import { Renderer } from '../../core/Renderer';
import { PIXEL_SCALE, COLORS, FONT_SIZE } from '../../constants/GameConfig';

/**
 * 文本标签组件
 */
export class Label {
  private text: string;
  private x: number;
  private y: number;
  private color: string = COLORS.WHITE;
  private fontSize: number = FONT_SIZE.NORMAL;
  private align: CanvasTextAlign = 'left';
  private visible: boolean = true;
  private shadow: boolean = true;

  constructor(text: string, x: number, y: number, color?: string, fontSize?: number) {
    this.text = text;
    this.x = x;
    this.y = y;
    if (color) this.color = color;
    if (fontSize) this.fontSize = fontSize;
  }

  /**
   * 渲染文本
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    if (this.shadow) {
      renderer.drawText(this.text, this.x, this.y, COLORS.BLACK, this.fontSize, this.align);
    }
    renderer.drawText(this.text, this.x, this.y, this.color, this.fontSize, this.align);
  }

  /**
   * 设置文本
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * 设置颜色
   */
  setColor(color: string): void {
    this.color = color;
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置对齐方式
   */
  setAlign(align: CanvasTextAlign): void {
    this.align = align;
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * 设置阴影
   */
  setShadow(shadow: boolean): void {
    this.shadow = shadow;
  }

  /**
   * 获取文本
   */
  getText(): string {
    return this.text;
  }
}
