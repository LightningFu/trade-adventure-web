import { Renderer } from './Renderer';
import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';
import { ResourceManager } from './ResourceManager';
import { AudioManager } from './AudioManager';
import { Timer } from './Timer';
import { EventBus } from './EventBus';
import { GameData } from '../data/GameData';
import { SaveManager } from '../data/SaveManager';
import { GAME_STATE } from '../constants/GameConfig';

/**
 * 游戏主类 (Web 版本)
 * 初始化所有子系统，提供 init/start/destroy 方法
 */
export class Game {
  private static instance: Game;

  renderer: Renderer;
  gameLoop: GameLoop;
  inputManager: InputManager;
  sceneManager: SceneManager;
  resourceManager: ResourceManager;
  audioManager: AudioManager;
  timer: Timer;
  eventBus: EventBus;
  gameData: GameData;
  saveManager: SaveManager;

  private initialized: boolean = false;
  private canvas: HTMLCanvasElement | null = null;

  private constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || null;
    this.renderer = new Renderer(canvas);
    this.gameLoop = new GameLoop();
    this.inputManager = InputManager.getInstance();
    this.sceneManager = SceneManager.getInstance();
    this.resourceManager = ResourceManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.timer = Timer.getInstance();
    this.eventBus = EventBus.getInstance();
    this.gameData = new GameData();
    this.saveManager = new SaveManager();
  }

  static getInstance(canvas?: HTMLCanvasElement): Game {
    if (!Game.instance) {
      Game.instance = new Game(canvas);
    }
    return Game.instance;
  }

  /**
   * 初始化游戏
   */
  init(): void {
    if (this.initialized) return;

    // 设置游戏循环回调
    this.gameLoop.onUpdate((dt) => this.update(dt));
    this.gameLoop.onRender((dt) => this.render(dt));

    // 尝试加载存档
    const savedData = this.saveManager.load();
    if (savedData) {
      this.gameData.loadFromSave(savedData);
    }

    this.initialized = true;
    console.log('[Game] 初始化完成');
  }

  /**
   * 启动游戏
   */
  start(): void {
    if (!this.initialized) {
      this.init();
    }
    this.gameLoop.start();
    console.log('[Game] 游戏启动');
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    this.gameLoop.pause();
    this.audioManager.pauseBGM();
    console.log('[Game] 游戏暂停');
  }

  /**
   * 恢复游戏
   */
  resume(): void {
    this.gameLoop.resume();
    this.audioManager.resumeBGM();
    console.log('[Game] 游戏恢复');
  }

  /**
   * 销毁游戏
   */
  destroy(): void {
    this.gameLoop.stop();
    this.audioManager.destroy();
    this.timer.clearAll();
    this.inputManager.clearClickAreas();
    this.eventBus.clear();
    this.resourceManager.clearCache();
    this.initialized = false;
    console.log('[Game] 游戏销毁');
  }

  /**
   * 游戏更新
   */
  private update(dt: number): void {
    this.timer.update(dt);
    this.sceneManager.update(dt);
  }

  /**
   * 游戏渲染
   */
  private render(dt: number): void {
    this.renderer.clear();
    this.sceneManager.render();
  }

  /**
   * 获取游戏状态
   */
  getGameState(): GAME_STATE {
    return this.gameData.state;
  }

  /**
   * 设置游戏状态
   */
  setGameState(state: GAME_STATE): void {
    this.gameData.state = state;
    this.eventBus.emit('gameStateChange', state);
  }
}
