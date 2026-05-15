import { Renderer } from '../../core/Renderer';
import { InputManager } from '../../core/InputManager';
import { PIXEL_SCALE, COLORS, FONT_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants/GameConfig';
import { Button } from './Button';

/**
 * 对话框组件
 */
export class DialogBox {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private title: string = '';
  private message: string = '';
  private visible: boolean = false;
  private buttons: Button[] = [];
  private callback: ((buttonId: string) => void) | null = null;
  private id: string;

  constructor(id: string, width?: number, height?: number) {
    this.id = id;
    this.width = width || SCREEN_WIDTH - 40;
    this.height = height || 200;
    this.x = (SCREEN_WIDTH - this.width) / 2;
    this.y = (SCREEN_HEIGHT - this.height) / 2;
  }

  /**
   * 显示对话框
   */
  show(title: string, message: string, buttons: Array<{ id: string; text: string }>, callback: (buttonId: string) => void): void {
    this.title = title;
    this.message = message;
    this.callback = callback;
    this.visible = true;

    // 创建按钮
    this.buttons = [];
    const buttonWidth = Math.min(120, (this.width - 40 - (buttons.length - 1) * 10) / buttons.length);
    const buttonHeight = 36;
    const totalButtonsWidth = buttons.length * buttonWidth + (buttons.length - 1) * 10;
    const startX = this.x + (this.width - totalButtonsWidth) / 2;
    const buttonY = this.y + this.height - buttonHeight - 16;

    buttons.forEach((btn, index) => {
      const button = new Button(
        `${this.id}_btn_${btn.id}`,
        startX + index * (buttonWidth + 10),
        buttonY,
        buttonWidth,
        buttonHeight,
        btn.text,
        () => {
          this.hide();
          if (this.callback) {
            this.callback(btn.id);
          }
        }
      );
      this.buttons.push(button);
    });
  }

  /**
   * 隐藏对话框
   */
  hide(): void {
    this.visible = false;
    this.buttons = [];
    this.callback = null;
  }

  /**
   * 渲染对话框
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    // 半透明遮罩
    const ctx = renderer.getContext();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 对话框主体
    renderer.drawPixelRect(this.x, this.y, this.width, this.height, COLORS.PANEL_BG, COLORS.PANEL_BORDER);

    // 标题
    if (this.title) {
      const titleBarHeight = FONT_SIZE.NORMAL * PIXEL_SCALE + 16;
      renderer.fillRect(
        this.x + PIXEL_SCALE,
        this.y + PIXEL_SCALE,
        this.width - PIXEL_SCALE * 2,
        titleBarHeight,
        COLORS.DARK_GRAY
      );
      renderer.drawText(
        this.title,
        this.x + this.width / 2,
        this.y + 8,
        COLORS.GOLD,
        FONT_SIZE.NORMAL,
        'center'
      );
      renderer.fillRect(
        this.x + PIXEL_SCALE,
        this.y + titleBarHeight,
        this.width - PIXEL_SCALE * 2,
        PIXEL_SCALE,
        COLORS.PANEL_BORDER
      );
    }

    // 消息文本（自动换行）
    const messageY = this.title ? this.y + FONT_SIZE.NORMAL * PIXEL_SCALE + 24 : this.y + 16;
    this.renderWrappedText(renderer, this.message, this.x + 16, messageY, this.width - 32);

    // 按钮
    this.buttons.forEach((button) => button.render(renderer));
  }

  /**
   * 渲染自动换行文本
   */
  private renderWrappedText(renderer: Renderer, text: string, x: number, y: number, maxWidth: number): void {
    const fontSize = FONT_SIZE.NORMAL;
    const lineHeight = fontSize * PIXEL_SCALE + 4;
    const chars = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const testWidth = this.measureTextWidth(renderer, testLine, fontSize);

      if (testWidth > maxWidth && line.length > 0) {
        renderer.drawText(line, x, currentY, COLORS.WHITE, fontSize);
        line = chars[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      renderer.drawText(line, x, currentY, COLORS.WHITE, fontSize);
    }
  }

  /**
   * 测量文本宽度
   */
  private measureTextWidth(renderer: Renderer, text: string, fontSize: number): number {
    const ctx = renderer.getContext();
    ctx.font = `bold ${fontSize * PIXEL_SCALE}px "Courier New", monospace`;
    return ctx.measureText(text).width;
  }

  /**
   * 注册按钮点击
   */
  registerButtons(inputManager: InputManager): void {
    this.buttons.forEach((button) => button.register(inputManager));
  }

  /**
   * 注销按钮点击
   */
  unregisterButtons(inputManager: InputManager): void {
    this.buttons.forEach((button) => button.unregister(inputManager));
  }

  /**
   * 是否可见
   */
  isVisible(): boolean {
    return this.visible;
  }
}
