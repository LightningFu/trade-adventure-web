/**
 * 场景基类
 * 定义生命周期方法
 */
export abstract class BaseScene {
  /**
   * 场景进入时调用
   */
  onEnter(): void {
    // 子类实现
  }

  /**
   * 场景退出时调用
   */
  onExit(): void {
    // 子类实现
  }

  /**
   * 场景暂停时调用（被新场景覆盖）
   */
  onPause(): void {
    // 子类实现
  }

  /**
   * 场景恢复时调用（从覆盖场景返回）
   */
  onResume(): void {
    // 子类实现
  }

  /**
   * 每帧更新
   */
  update(dt: number): void {
    // 子类实现
  }

  /**
   * 每帧渲染
   */
  render(): void {
    // 子类实现
  }
}
