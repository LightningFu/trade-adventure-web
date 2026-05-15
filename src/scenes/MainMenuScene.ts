import { BaseScene } from './BaseScene';
import { Game } from '../core/Game';
import { Renderer } from '../core/Renderer';
import { InputManager } from '../core/InputManager';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../ui/components/Button';
import { UIManager } from '../ui/UIManager';
import { SaveManager } from '../data/SaveManager';
import { GAME_STATE, SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, FONT_SIZE, PIXEL_SCALE } from '../constants/GameConfig';
import { TownScene } from './TownScene';

/**
 * 主菜单场景
 * 显示游戏标题、开始游戏按钮、继续游戏按钮
 */
export class MainMenuScene extends BaseScene {
  private game: Game;
  private renderer: Renderer;
  private inputManager: InputManager;
  private uiManager: UIManager;
  private sceneManager: SceneManager;
  private animTime: number = 0;
  private hasSave: boolean = false;

  constructor(game: Game) {
    super();
    this.game = game;
    this.renderer = game.renderer;
    this.inputManager = game.inputManager;
    this.sceneManager = SceneManager.getInstance();
    this.uiManager = new UIManager(this.renderer, this.inputManager);
    this.hasSave = new SaveManager().hasSave();
  }

  onEnter(): void {
    this.hasSave = new SaveManager().hasSave();
    this.inputManager.clearClickAreas();
    this.setupUI();
  }

  onExit(): void {
    this.uiManager.clear();
    this.inputManager.clearClickAreas();
  }

  private setupUI(): void {
    const centerX = SCREEN_WIDTH / 2;
    const buttonWidth = 200;
    const buttonHeight = 44;

    // 开始游戏按钮
    const startBtn = new Button(
      'menu_start',
      centerX - buttonWidth / 2,
      380,
      buttonWidth,
      buttonHeight,
      '开始游戏',
      () => {
        this.startNewGame();
      }
    );
    this.uiManager.addButton(startBtn);

    // 继续游戏按钮
    if (this.hasSave) {
      const continueBtn = new Button(
        'menu_continue',
        centerX - buttonWidth / 2,
        440,
        buttonWidth,
        buttonHeight,
        '继续游戏',
        () => {
          this.continueGame();
        }
      );
      this.uiManager.addButton(continueBtn);
    }
  }

  private startNewGame(): void {
    this.game.gameData.reset();
    this.game.saveManager.deleteSave();
    this.game.setGameState(GAME_STATE.TOWN);
    this.switchToTown();
  }

  private continueGame(): void {
    const saveData = this.game.saveManager.load();
    if (saveData) {
      this.game.gameData.loadFromSave(saveData);
      this.game.setGameState(saveData.state);
      this.switchToTown();
    }
  }

  private switchToTown(): void {
    this.sceneManager.replace(new TownScene(this.game));
  }

  update(dt: number): void {
    this.animTime += dt;
    this.uiManager.update(dt);
  }

  render(): void {
    const ctx = this.renderer.getContext();

    // 背景渐变（深蓝到黑色）
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#1a1a4e');
    gradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 绘制星星背景
    this.drawStars(ctx);

    // 绘制像素风装饰边框
    this.renderer.drawRect(20, 20, SCREEN_WIDTH - 40, SCREEN_HEIGHT - 40, COLORS.GOLD, 2);

    // 绘制标题
    this.renderer.drawTextCenter('商路风云', SCREEN_HEIGHT * 0.22, COLORS.GOLD, FONT_SIZE.HUGE);

    // 副标题
    this.renderer.drawTextCenter('Trade Adventure', SCREEN_HEIGHT * 0.22 + FONT_SIZE.HUGE * PIXEL_SCALE + 8, COLORS.LIGHT_GRAY, FONT_SIZE.SMALL);

    // 绘制像素风商人图标
    this.drawMerchantIcon(ctx, SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.42);

    // 版本信息
    this.renderer.drawText('v1.0.0', SCREEN_WIDTH - 60, SCREEN_HEIGHT - 30, COLORS.GRAY, FONT_SIZE.SMALL);

    // 渲染UI
    this.uiManager.render();
  }

  private drawStars(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS.WHITE;
    for (let i = 0; i < 30; i++) {
      const x = ((i * 73 + 17) % SCREEN_WIDTH);
      const y = ((i * 47 + 23) % (SCREEN_HEIGHT * 0.6));
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(this.animTime * 0.5 + i));
      ctx.globalAlpha = alpha;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1.0;
  }

  private drawMerchantIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const s = PIXEL_SCALE;
    // 简单的像素风商人图标
    // 头
    ctx.fillStyle = COLORS.SKIN;
    ctx.fillRect(cx - 4 * s, cy - 12 * s, 8 * s, 8 * s);
    // 帽子
    ctx.fillStyle = COLORS.BROWN;
    ctx.fillRect(cx - 5 * s, cy - 14 * s, 10 * s, 3 * s);
    ctx.fillRect(cx - 3 * s, cy - 17 * s, 6 * s, 3 * s);
    // 眼睛
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(cx - 2 * s, cy - 10 * s, s, s);
    ctx.fillRect(cx + 1 * s, cy - 10 * s, s, s);
    // 身体
    ctx.fillStyle = COLORS.BLUE;
    ctx.fillRect(cx - 5 * s, cy - 4 * s, 10 * s, 12 * s);
    // 腰带
    ctx.fillStyle = COLORS.BROWN;
    ctx.fillRect(cx - 5 * s, cy + 2 * s, 10 * s, 2 * s);
    // 腿
    ctx.fillStyle = COLORS.DARK_GRAY;
    ctx.fillRect(cx - 4 * s, cy + 8 * s, 3 * s, 6 * s);
    ctx.fillRect(cx + 1 * s, cy + 8 * s, 3 * s, 6 * s);
    // 包裹
    ctx.fillStyle = COLORS.ORANGE;
    ctx.fillRect(cx + 6 * s, cy - 2 * s, 6 * s, 8 * s);
    ctx.fillStyle = COLORS.BROWN;
    ctx.fillRect(cx + 6 * s, cy - 2 * s, 6 * s, 2 * s);
  }
}
