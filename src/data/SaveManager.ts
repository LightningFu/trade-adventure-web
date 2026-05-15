import { SaveData } from './GameData';

/**
 * 存档管理器 (Web 版本)
 * 使用 localStorage 进行存取档
 */
export class SaveManager {
  private static SAVE_KEY = 'trade_adventure_save';

  /**
   * 保存游戏数据
   */
  save(data: SaveData): boolean {
    try {
      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[SaveManager] 保存失败:', e);
      return false;
    }
  }

  /**
   * 加载游戏数据
   */
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      if (data && data.version) {
        return data;
      }
      return null;
    } catch (e) {
      console.error('[SaveManager] 加载失败:', e);
      return null;
    }
  }

  /**
   * 检查是否有存档
   */
  hasSave(): boolean {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      return !!raw;
    } catch (e) {
      return false;
    }
  }

  /**
   * 删除存档
   */
  deleteSave(): boolean {
    try {
      localStorage.removeItem(SaveManager.SAVE_KEY);
      return true;
    } catch (e) {
      console.error('[SaveManager] 删除存档失败:', e);
      return false;
    }
  }
}
