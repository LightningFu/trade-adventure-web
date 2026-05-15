/**
 * 商路风云 - Web 版本入口
 * 纯网页版游戏入口文件
 */

import { Game } from './core/Game';
import { SceneManager } from './core/SceneManager';
import { MainMenuScene } from './scenes/MainMenuScene';

/** 游戏实例 */
let game: Game | null = null;

/**
 * 初始化游戏
 */
function initGame(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  game = Game.getInstance();
  game.init();

  const sceneManager = SceneManager.getInstance();

  // 进入主菜单
  sceneManager.push(new MainMenuScene(game));

  game.start();

  // 隐藏加载画面
  hideLoading();
}

/**
 * 隐藏加载画面
 */
function hideLoading(): void {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
}

/**
 * 显示加载进度
 */
function updateLoadingProgress(loaded: number, total: number): void {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const percentage = Math.floor((loaded / total) * 100);

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  if (progressText) {
    progressText.textContent = `加载中... ${percentage}%`;
  }
}

/**
 * 页面可见性变化处理
 */
function handleVisibilityChange(): void {
  if (document.hidden) {
    // 页面隐藏，暂停游戏并自动保存
    if (game) {
      game.pause();
      game.saveManager.save(game.gameData.toSaveData());
      console.log('[Game] 游戏已暂停并自动保存');
    }
  } else {
    // 页面显示，恢复游戏
    if (game) {
      game.resume();
      console.log('[Game] 游戏已恢复');
    }
  }
}

/**
 * 显示提示信息
 */
function showToast(message: string): void {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
}

// 监听页面可见性变化
document.addEventListener('visibilitychange', handleVisibilityChange);

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Game] 页面加载完成，开始初始化游戏...');
  initGame();
});

// 导出全局函数供调试使用
(window as any).game = {
  showToast,
  updateLoadingProgress
};
