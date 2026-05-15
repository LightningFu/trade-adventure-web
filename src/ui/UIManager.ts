import { Renderer } from '../core/Renderer';
import { InputManager } from '../core/InputManager';
import { Button } from './components/Button';
import { Panel } from './components/Panel';
import { Label } from './components/Label';
import { ProgressBar } from './components/ProgressBar';
import { DialogBox } from './components/DialogBox';

/**
 * UI管理器
 * 管理所有UI组件的渲染和交互
 */
export class UIManager {
  private buttons: Map<string, Button> = new Map();
  private panels: Map<string, Panel> = new Map();
  private labels: Map<string, Label> = new Map();
  private progressBars: Map<string, ProgressBar> = new Map();
  private dialogBoxes: Map<string, DialogBox> = new Map();
  private renderer: Renderer;
  private inputManager: InputManager;

  constructor(renderer: Renderer, inputManager: InputManager) {
    this.renderer = renderer;
    this.inputManager = inputManager;
  }

  /**
   * 添加按钮
   */
  addButton(button: Button): void {
    this.buttons.set(button.getId(), button);
    button.register(this.inputManager);
  }

  /**
   * 移除按钮
   */
  removeButton(id: string): void {
    const button = this.buttons.get(id);
    if (button) {
      button.unregister(this.inputManager);
      this.buttons.delete(id);
    }
  }

  /**
   * 获取按钮
   */
  getButton(id: string): Button | undefined {
    return this.buttons.get(id);
  }

  /**
   * 添加面板
   */
  addPanel(id: string, panel: Panel): void {
    this.panels.set(id, panel);
  }

  /**
   * 获取面板
   */
  getPanel(id: string): Panel | undefined {
    return this.panels.get(id);
  }

  /**
   * 添加标签
   */
  addLabel(id: string, label: Label): void {
    this.labels.set(id, label);
  }

  /**
   * 获取标签
   */
  getLabel(id: string): Label | undefined {
    return this.labels.get(id);
  }

  /**
   * 添加进度条
   */
  addProgressBar(id: string, bar: ProgressBar): void {
    this.progressBars.set(id, bar);
  }

  /**
   * 获取进度条
   */
  getProgressBar(id: string): ProgressBar | undefined {
    return this.progressBars.get(id);
  }

  /**
   * 添加对话框
   */
  addDialogBox(id: string, dialog: DialogBox): void {
    this.dialogBoxes.set(id, dialog);
  }

  /**
   * 获取对话框
   */
  getDialogBox(id: string): DialogBox | undefined {
    return this.dialogBoxes.get(id);
  }

  /**
   * 渲染所有UI组件
   */
  render(): void {
    // 渲染面板
    this.panels.forEach((panel) => panel.render(this.renderer));

    // 渲染进度条
    this.progressBars.forEach((bar) => bar.render(this.renderer));

    // 渲染标签
    this.labels.forEach((label) => label.render(this.renderer));

    // 渲染按钮
    this.buttons.forEach((button) => button.render(this.renderer));

    // 渲染对话框（最上层）
    this.dialogBoxes.forEach((dialog) => dialog.render(this.renderer));
  }

  /**
   * 更新所有UI组件
   */
  update(dt: number): void {
    this.buttons.forEach((button) => button.update(dt));
  }

  /**
   * 清除所有组件
   */
  clear(): void {
    this.buttons.forEach((button) => button.unregister(this.inputManager));
    this.buttons.clear();
    this.panels.clear();
    this.labels.clear();
    this.progressBars.clear();
    this.dialogBoxes.forEach((dialog) => dialog.unregisterButtons(this.inputManager));
    this.dialogBoxes.clear();
  }

  /**
   * 清除所有按钮
   */
  clearButtons(): void {
    this.buttons.forEach((button) => button.unregister(this.inputManager));
    this.buttons.clear();
  }

  /**
   * 清除所有标签
   */
  clearLabels(): void {
    this.labels.clear();
  }

  /**
   * 清除所有面板
   */
  clearPanels(): void {
    this.panels.clear();
  }

  /**
   * 清除所有进度条
   */
  clearProgressBars(): void {
    this.progressBars.clear();
  }

  /**
   * 清除所有对话框
   */
  clearDialogBoxes(): void {
    this.dialogBoxes.forEach((dialog) => dialog.unregisterButtons(this.inputManager));
    this.dialogBoxes.clear();
  }
}
