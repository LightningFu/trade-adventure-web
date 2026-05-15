import { Renderer } from '../../core/Renderer';
import { InputManager } from '../../core/InputManager';
import { PIXEL_SCALE, COLORS, FONT_SIZE } from '../../constants/GameConfig';

/**
 * 像素风按钮组件
 * 支持点击回调、悬停效果
 */
export class Button {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private text: string;
  private callback: (() => void) | null = null;
  private visible: boolean = true;
  private enabled: boolean = true;
  private pressed: boolean = false;
  private id: string;
  private color: string = COLORS.BUTTON_BG;
  private hoverColor: string = COLORS.BUTTON_HOVER;
  private textColor: string = COLORS.BUTTON_TEXT;
  private fontSize: number = FONT_SIZE.NORMAL;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    callback?: () => void
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    if (callback) {
      this.callback = callback;
    }
  }

  /**
   * 设置点击回调
   */
  setCallback(callback: () => void): void {
    this.callback = callback;
  }

  /**
   * 注册点击区域
   */
  register(inputManager: InputManager): void {
    inputManager.registerClickArea(
      this.id,
      this.x,
      this.y,
      this.width,
      this.height,
      () => {
        if (this.enabled && this.callback) {
          this.pressed = true;
          this.callback();
        }
      }
    );
  }

  /**
   * 注销点击区域
   */
  unregister(inputManager: InputManager): void {
    inputManager.unregisterClickArea(this.id);
  }

  /**
   * 渲染按钮
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    const bgColor = this.pressed ? this.hoverColor : (this.enabled ? this.color : COLORS.DARK_GRAY);
    const borderColor = this.enabled ? COLORS.LIGHT_GRAY : COLORS.GRAY;
    const txtColor = this.enabled ? this.textColor : COLORS.GRAY;

    // 绘制像素风格矩形
    renderer.drawPixelRect(this.x, this.y, this.width, this.height, bgColor, borderColor);

    // 绘制文字
    const textX = this.x + this.width / 2;
    const textY = this.y + (this.height - this.fontSize * PIXEL_SCALE) / 2;
    renderer.drawText(this.text, textX, textY, txtColor, this.fontSize, 'center');

    // 重置按下状态
    this.pressed = false;
  }

  /**
   * 更新
   */
  update(dt: number): void {
    // 按钮状态更新（可用于动画效果）
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * 设置启用状态
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 设置颜色
   */
  setColors(bg: string, hover: string, text: string): void {
    this.color = bg;
    this.hoverColor = hover;
    this.textColor = text;
  }

  /**
   * 设置文字
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 获取ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * 是否可见
   */
  isVisible(): boolean {
    return this.visible;
  }
}
