import { BaseScene } from './BaseScene';
import { Game } from '../core/Game';
import { Renderer } from '../core/Renderer';
import { InputManager } from '../core/InputManager';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../ui/components/Button';
import { Panel } from '../ui/components/Panel';
import { Label } from '../ui/components/Label';
import { UIManager } from '../ui/UIManager';
import { GAME_STATE, SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, FONT_SIZE, PIXEL_SCALE } from '../constants/GameConfig';
import { formatNumber } from '../utils/MathUtils';
import { MainMenuScene } from './MainMenuScene';

/**
 * 游戏结束场景
 * 显示最终统计、重新开始按钮
 */
export class GameOverScene extends BaseScene {
  private game: Game;
  private renderer: Renderer;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private uiManager: UIManager;
  private animTime: number = 0;

  constructor(game: Game) {
    super();
    this.game = game;
    this.renderer = game.renderer;
    this.inputManager = game.inputManager;
    this.sceneManager = SceneManager.getInstance();
    this.uiManager = new UIManager(this.renderer, this.inputManager);
  }

  onEnter(): void {
    this.inputManager.clearClickAreas();
    this.setupUI();
  }

  onExit(): void {
    this.uiManager.clear();
    this.inputManager.clearClickAreas();
  }

  private setupUI(): void {
    const player = this.game.gameData;

    // 游戏结束面板
    const panel = new Panel(30, 100, SCREEN_WIDTH - 60, 420, '游戏结束');
    this.uiManager.addPanel('gameover_panel', panel);

    const contentArea = panel.getContentArea();
    let y = contentArea.y + 10;
    const lineH = FONT_SIZE.NORMAL * PIXEL_SCALE + 12;

    // 统计信息
    const stats = [
      { label: '角色等级', value: `Lv.${player.player.level}`, color: COLORS.GOLD },
      { label: '获得经验', value: `${player.player.exp}`, color: COLORS.EXP_BAR },
      { label: '最终金币', value: `${formatNumber(player.player.gold)}`, color: COLORS.GOLD_COLOR },
      { label: '总战斗次数', value: `${player.totalBattles}`, color: COLORS.RED },
      { label: '总交易次数', value: `${player.totalTrades}`, color: COLORS.GREEN },
      { label: '总旅行距离', value: `${player.totalDistance}`, color: COLORS.SKY_BLUE },
      { label: '访问城镇', value: `${player.visitedTowns.length}`, color: COLORS.WHITE },
    ];

    stats.forEach((stat, index) => {
      const label = new Label(
        `${stat.label}: ${stat.value}`,
        contentArea.x + 10,
        y + index * lineH,
        stat.color,
        FONT_SIZE.NORMAL
      );
      this.uiManager.addLabel(`stat_${index}`, label);
    });

    // 重新开始按钮
    const restartBtn = new Button(
      'gameover_restart',
      SCREEN_WIDTH / 2 - 80,
      contentArea.y + contentArea.height - 55,
      160,
      42,
      '重新开始',
      () => {
        this.restartGame();
      }
    );
    this.uiManager.addButton(restartBtn);
  }

  private restartGame(): void {
    this.game.gameData.reset();
    this.game.saveManager.deleteSave();
    this.game.setGameState(GAME_STATE.MENU);
    this.sceneManager.replace(new MainMenuScene(this.game));
  }

  update(dt: number): void {
    this.animTime += dt;
    this.uiManager.update(dt);
  }

  render(): void {
    const ctx = this.renderer.getContext();

    // 暗红色渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#1a0000');
    gradient.addColorStop(0.5, '#2a0a0a');
    gradient.addColorStop(1, '#0a0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 粒子效果
    ctx.fillStyle = COLORS.RED;
    for (let i = 0; i < 20; i++) {
      const x = ((i * 73 + Math.floor(this.animTime * 20)) % SCREEN_WIDTH);
      const y = ((i * 47 + Math.floor(this.animTime * 15)) % SCREEN_HEIGHT);
      const alpha = 0.1 + 0.2 * Math.abs(Math.sin(this.animTime + i));
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // 标题
    this.renderer.drawTextCenter('游戏结束', 40, COLORS.RED, FONT_SIZE.HUGE);

    // 副标题
    const blink = Math.abs(Math.sin(this.animTime * 2));
    ctx.globalAlpha = blink;
    this.renderer.drawTextCenter('你的商路之旅结束了...', 40 + FONT_SIZE.HUGE * PIXEL_SCALE + 8, COLORS.GRAY, FONT_SIZE.SMALL);
    ctx.globalAlpha = 1.0;

    // 渲染UI
    this.uiManager.render();
  }
}
