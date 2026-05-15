import { BaseScene } from '../scenes/BaseScene';

/**
 * 场景管理器
 * 支持场景栈(push/pop/replace)，场景生命周期管理
 */
export class SceneManager {
  private static instance: SceneManager;
  private sceneStack: BaseScene[] = [];
  private currentScene: BaseScene | null = null;

  private constructor() {}

  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  /**
   * 推入新场景（暂停当前场景）
   */
  push(scene: BaseScene): void {
    if (this.currentScene) {
      this.currentScene.onPause();
    }
    this.sceneStack.push(scene);
    this.currentScene = scene;
    this.currentScene.onEnter();
  }

  /**
   * 弹出当前场景（恢复上一个场景）
   */
  pop(): void {
    if (this.currentScene) {
      this.currentScene.onExit();
      this.sceneStack.pop();
    }

    if (this.sceneStack.length > 0) {
      this.currentScene = this.sceneStack[this.sceneStack.length - 1];
      this.currentScene.onResume();
    } else {
      this.currentScene = null;
    }
  }

  /**
   * 替换当前场景
   */
  replace(scene: BaseScene): void {
    if (this.currentScene) {
      this.currentScene.onExit();
      this.sceneStack.pop();
    }
    this.sceneStack.push(scene);
    this.currentScene = scene;
    this.currentScene.onEnter();
  }

  /**
   * 清空所有场景并推入新场景
   */
  clearAndPush(scene: BaseScene): void {
    while (this.sceneStack.length > 0) {
      const s = this.sceneStack.pop()!;
      s.onExit();
    }
    this.currentScene = null;
    this.push(scene);
  }

  /**
   * 获取当前场景
   */
  getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  /**
   * 获取场景栈大小
   */
  getStackSize(): number {
    return this.sceneStack.length;
  }

  /**
   * 更新当前场景
   */
  update(dt: number): void {
    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  /**
   * 渲染当前场景
   */
  render(): void {
    if (this.currentScene) {
      this.currentScene.render();
    }
  }
}
