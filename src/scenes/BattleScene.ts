import { BaseScene } from './BaseScene';
import { Game } from '../core/Game';
import { Renderer } from '../core/Renderer';
import { InputManager } from '../core/InputManager';
import { SceneManager } from '../core/SceneManager';
import { Timer } from '../core/Timer';
import { Button } from '../ui/components/Button';
import { Panel } from '../ui/components/Panel';
import { Label } from '../ui/components/Label';
import { ProgressBar } from '../ui/components/ProgressBar';
import { UIManager } from '../ui/UIManager';
import { Character } from '../modules/battle/Character';
import { Enemy } from '../modules/battle/Enemy';
import { BattleSystem, BattleResult, BattleLog } from '../modules/battle/BattleSystem';
import { LevelSystem } from '../modules/rpg/LevelSystem';
import { BATTLE_STATE, BATTLE_ANIMATION_DELAY } from '../constants/BattleConfig';
import { GAME_STATE, SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, FONT_SIZE, PIXEL_SCALE } from '../constants/GameConfig';
import { formatNumber } from '../utils/MathUtils';
import enemiesData from '../data/tables/enemies.json';
import { GameOverScene } from './GameOverScene';
import { TownScene } from './TownScene';

/**
 * 战斗场景
 * 显示玩家和敌人、血条、战斗操作按钮
 */
export class BattleScene extends BaseScene {
  private game: Game;
  private renderer: Renderer;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private timer: Timer;
  private uiManager: UIManager;
  private battleSystem: BattleSystem | null = null;
  private battleLogs: BattleLog[] = [];
  private battleResult: BattleResult | null = null;
  private animTime: number = 0;
  private showResult: boolean = false;
  private enemyId: string = '';
  private fromTownId: string = '';

  constructor(game: Game, enemyId: string, fromTownId: string = '') {
    super();
    this.game = game;
    this.renderer = game.renderer;
    this.inputManager = game.inputManager;
    this.sceneManager = SceneManager.getInstance();
    this.timer = Timer.getInstance();
    this.uiManager = new UIManager(this.renderer, this.inputManager);
    this.enemyId = enemyId;
    this.fromTownId = fromTownId;
  }

  onEnter(): void {
    this.inputManager.clearClickAreas();
    this.initBattle();
  }

  onExit(): void {
    this.uiManager.clear();
    this.inputManager.clearClickAreas();
  }

  private initBattle(): void {
    const playerData = this.game.gameData.player;

    const player = new Character(
      playerData.name,
      playerData.level,
      playerData.hp,
      playerData.maxHp,
      playerData.mp,
      playerData.maxMp,
      playerData.atk,
      playerData.def
    );

    const enemy = new Enemy(this.enemyId, playerData.level);
    this.battleSystem = new BattleSystem(player, enemy);
    this.battleLogs = [];

    this.battleSystem.onLog((log: BattleLog) => {
      this.battleLogs.push(log);
      if (this.battleLogs.length > 5) {
        this.battleLogs.shift();
      }
    });

    this.battleSystem.onBattleEnd((result: BattleResult) => {
      this.battleResult = result;
      this.showResult = true;
      this.timer.setTimeout(() => {
        this.setupResultUI();
      }, BATTLE_ANIMATION_DELAY * 2);
    });

    this.battleSystem.startBattle();
    this.setupBattleUI();
  }

  private setupBattleUI(): void {
    this.uiManager.clear();

    if (!this.battleSystem) return;

    const player = this.battleSystem.getPlayer();
    const enemy = this.battleSystem.getEnemy();

    // 战斗面板
    const battlePanel = new Panel(8, 8, SCREEN_WIDTH - 16, SCREEN_HEIGHT - 16, '战斗');
    this.uiManager.addPanel('battle_panel', battlePanel);

    // 敌人名称
    const enemyNameLabel = new Label(
      `${enemy.name} Lv.${enemy.level}`,
      SCREEN_WIDTH / 2,
      50,
      COLORS.RED,
      FONT_SIZE.NORMAL
    );
    enemyNameLabel.setAlign('center');
    this.uiManager.addLabel('enemy_name', enemyNameLabel);

    // 敌人HP条
    const enemyHpBar = new ProgressBar(30, 75, SCREEN_WIDTH - 60, 20, COLORS.HP_BAR, COLORS.HP_BAR_BG);
    enemyHpBar.setValue(enemy.hp, enemy.maxHp);
    enemyHpBar.setLabelText(`${enemy.hp}/${enemy.maxHp}`);
    this.uiManager.addProgressBar('enemy_hp', enemyHpBar);

    // 敌人属性
    const enemyAtkLabel = new Label(`ATK:${enemy.atk} DEF:${enemy.def}`, SCREEN_WIDTH / 2, 100, COLORS.GRAY, FONT_SIZE.SMALL);
    enemyAtkLabel.setAlign('center');
    this.uiManager.addLabel('enemy_stats', enemyAtkLabel);

    // 玩家名称
    const playerNameLabel = new Label(
      `${player.name} Lv.${player.level}`,
      30,
      340,
      COLORS.WHITE,
      FONT_SIZE.NORMAL
    );
    this.uiManager.addLabel('player_name', playerNameLabel);

    // 玩家HP条
    const playerHpBar = new ProgressBar(30, 365, SCREEN_WIDTH - 60, 20, COLORS.HP_BAR, COLORS.HP_BAR_BG);
    playerHpBar.setValue(player.hp, player.maxHp);
    playerHpBar.setLabelText(`HP: ${player.hp}/${player.maxHp}`);
    this.uiManager.addProgressBar('player_hp', playerHpBar);

    // 玩家MP条
    const playerMpBar = new ProgressBar(30, 390, SCREEN_WIDTH - 60, 16, COLORS.MP_BAR, COLORS.MP_BAR_BG);
    playerMpBar.setValue(player.mp, player.maxMp);
    playerMpBar.setLabelText(`MP: ${player.mp}/${player.maxMp}`);
    this.uiManager.addProgressBar('player_mp', playerMpBar);

    // 回合数
    const roundLabel = new Label(`第 ${this.battleSystem.getRound()} 回合`, SCREEN_WIDTH - 30, 340, COLORS.GOLD, FONT_SIZE.SMALL);
    roundLabel.setAlign('right');
    this.uiManager.addLabel('round', roundLabel);

    // 战斗日志区域
    const logPanel = new Panel(20, 415, SCREEN_WIDTH - 40, 80, '');
    this.uiManager.addPanel('log_panel', logPanel);

    // 初始日志
    this.updateLogDisplay();

    // 技能按钮
    const skills = this.battleSystem.getAvailableSkills();
    const btnWidth = 90;
    const btnHeight = 38;
    const btnGap = 6;
    const cols = 3;
    const rows = Math.ceil(skills.length / cols);
    const totalWidth = cols * btnWidth + (cols - 1) * btnGap;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;
    const startY = 510;

    skills.forEach((skill, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const btn = new Button(
        `skill_${skill.id}`,
        startX + col * (btnWidth + btnGap),
        startY + row * (btnHeight + btnGap),
        btnWidth,
        btnHeight,
        `${skill.name}`,
        () => {
          this.playerUseSkill(skill.id);
        }
      );
      this.uiManager.addButton(btn);
    });
  }

  private setupResultUI(): void {
    this.uiManager.clear();

    if (!this.battleResult) return;

    const isVictory = this.battleResult.victory;
    const title = isVictory ? '战斗胜利！' : (this.battleResult.fled ? '成功逃脱！' : '战斗失败...');

    // 结果面板
    const resultPanel = new Panel(30, 120, SCREEN_WIDTH - 60, 350, title);
    this.uiManager.addPanel('result_panel', resultPanel);

    const contentArea = resultPanel.getContentArea();
    let y = contentArea.y + 10;
    const lineH = FONT_SIZE.NORMAL * PIXEL_SCALE + 12;

    if (isVictory) {
      const expLabel = new Label(`获得经验: +${this.battleResult.expGained}`, contentArea.x + 10, y, COLORS.EXP_BAR, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('result_exp', expLabel);
      y += lineH;

      const goldLabel = new Label(`获得金币: +${formatNumber(this.battleResult.goldGained)}`, contentArea.x + 10, y, COLORS.GOLD_COLOR, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('result_gold', goldLabel);
      y += lineH;

      const roundsLabel = new Label(`战斗回合: ${this.battleResult.rounds}`, contentArea.x + 10, y, COLORS.LIGHT_GRAY, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('result_rounds', roundsLabel);
      y += lineH;

      // 检查是否升级
      const levelSystem = new LevelSystem();
      const newExp = this.game.gameData.player.exp + this.battleResult.expGained;
      if (levelSystem.canLevelUp(this.game.gameData.player.level, newExp)) {
        const levelUpLabel = new Label('恭喜升级！', contentArea.x + 10, y, COLORS.GOLD, FONT_SIZE.LARGE);
        this.uiManager.addLabel('result_levelup', levelUpLabel);
        y += lineH + 10;
      }
    } else if (!this.battleResult.fled) {
      const defeatLabel = new Label('你被击败了...', contentArea.x + 10, y, COLORS.RED, FONT_SIZE.LARGE);
      this.uiManager.addLabel('result_defeat', defeatLabel);
      y += lineH;
    }

    // 继续按钮
    const continueBtn = new Button(
      'result_continue',
      SCREEN_WIDTH / 2 - 60,
      contentArea.y + contentArea.height - 55,
      120,
      42,
      '继续',
      () => {
        this.handleBattleResult();
      }
    );
    this.uiManager.addButton(continueBtn);
  }

  private playerUseSkill(skillId: string): void {
    if (!this.battleSystem) return;
    if (this.battleSystem.getState() !== BATTLE_STATE.PLAYER_TURN) return;

    this.battleSystem.playerAction(skillId);

    if (this.battleSystem.getState() === BATTLE_STATE.ENEMY_TURN) {
      this.updateBattleUI();
      this.timer.setTimeout(() => {
        if (this.battleSystem) {
          this.battleSystem.enemyTurn();
          this.updateBattleUI();
        }
      }, BATTLE_ANIMATION_DELAY);
    } else {
      this.updateBattleUI();
    }
  }

  private updateBattleUI(): void {
    if (!this.battleSystem) return;

    const player = this.battleSystem.getPlayer();
    const enemy = this.battleSystem.getEnemy();

    const playerHpBar = this.uiManager.getProgressBar('player_hp');
    if (playerHpBar) {
      playerHpBar.setValue(player.hp, player.maxHp);
      playerHpBar.setLabelText(`HP: ${player.hp}/${player.maxHp}`);
    }

    const playerMpBar = this.uiManager.getProgressBar('player_mp');
    if (playerMpBar) {
      playerMpBar.setValue(player.mp, player.maxMp);
      playerMpBar.setLabelText(`MP: ${player.mp}/${player.maxMp}`);
    }

    const enemyHpBar = this.uiManager.getProgressBar('enemy_hp');
    if (enemyHpBar) {
      enemyHpBar.setValue(enemy.hp, enemy.maxHp);
      enemyHpBar.setLabelText(`${enemy.hp}/${enemy.maxHp}`);
    }

    const roundLabel = this.uiManager.getLabel('round');
    if (roundLabel) {
      roundLabel.setText(`第 ${this.battleSystem.getRound()} 回合`);
    }

    this.updateLogDisplay();
  }

  private updateLogDisplay(): void {
    // 移除旧日志标签
    for (let i = 0; i < 5; i++) {
      this.uiManager.addLabel(`log_${i}`, new Label('', 0, 0, COLORS.WHITE, FONT_SIZE.SMALL));
    }

    const logPanel = this.uiManager.getPanel('log_panel');
    if (!logPanel) return;

    const contentArea = logPanel.getContentArea();
    this.battleLogs.forEach((log, index) => {
      const color = log.type === 'critical' ? COLORS.YELLOW :
                    log.type === 'player' ? '#88FF88' :
                    log.type === 'enemy' ? '#FF8888' :
                    log.type === 'system' ? COLORS.GOLD : COLORS.WHITE;
      const label = new Label(log.message, contentArea.x + 8, contentArea.y + 4 + index * 14, color, FONT_SIZE.SMALL);
      this.uiManager.addLabel(`log_${index}`, label);
    });
  }

  private handleBattleResult(): void {
    if (!this.battleResult) return;

    if (this.battleResult.victory) {
      this.game.gameData.player.hp = this.battleResult.playerHp;
      this.game.gameData.player.mp = this.battleResult.playerMp;
      this.game.gameData.player.gold += this.battleResult.goldGained;
      this.game.gameData.totalBattles++;

      const levelSystem = new LevelSystem();
      this.game.gameData.player.exp += this.battleResult.expGained;

      while (levelSystem.canLevelUp(this.game.gameData.player.level, this.game.gameData.player.exp)) {
        const newLevel = this.game.gameData.player.level + 1;
        const stats = levelSystem.calculateLevelUpStats(newLevel);
        this.game.gameData.levelUp(stats.maxHp, stats.maxMp, stats.atk, stats.def);
      }
    } else if (!this.battleResult.fled) {
      this.game.gameData.player.hp = this.battleResult.playerHp;
      this.game.gameData.player.mp = this.battleResult.playerMp;

      if (this.game.gameData.player.hp <= 0) {
        this.sceneManager.replace(new GameOverScene(this.game));
        return;
      }
    }

    // 返回城镇
    this.game.setGameState(GAME_STATE.TOWN);
    this.sceneManager.replace(new TownScene(this.game));
  }

  update(dt: number): void {
    this.animTime += dt;

    if (this.battleSystem && !this.showResult) {
      this.updateBattleUI();
    }

    this.uiManager.update(dt);
  }

  render(): void {
    const ctx = this.renderer.getContext();

    // 战斗背景
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#2a1a3e');
    gradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 地面
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, SCREEN_HEIGHT * 0.65, SCREEN_WIDTH, SCREEN_HEIGHT * 0.35);

    // 战斗纹理
    ctx.fillStyle = '#222222';
    for (let i = 0; i < 10; i++) {
      const px = (i * 47 + 13) % SCREEN_WIDTH;
      const py = SCREEN_HEIGHT * 0.65 + (i * 31 + 7) % (SCREEN_HEIGHT * 0.35);
      ctx.fillRect(px, py, 4, 4);
    }

    if (this.battleSystem && !this.showResult) {
      const enemy = this.battleSystem.getEnemy();
      const player = this.battleSystem.getPlayer();

      // 绘制敌人
      this.drawEnemySprite(ctx, SCREEN_WIDTH / 2, 200, enemy);

      // 绘制玩家
      this.drawPlayerSprite(ctx, 80, 300, player);
    }

    // 渲染UI
    this.uiManager.render();
  }

  private drawEnemySprite(ctx: CanvasRenderingContext2D, x: number, y: number, enemy: Enemy): void {
    const s = PIXEL_SCALE;
    const bob = Math.sin(this.animTime * 2) * 3;

    // 身体
    ctx.fillStyle = '#CC3333';
    ctx.fillRect(x - 10 * s, y - 8 * s + bob, 20 * s, 18 * s);
    // 头部
    ctx.fillStyle = '#DD4444';
    ctx.fillRect(x - 8 * s, y - 16 * s + bob, 16 * s, 10 * s);
    // 眼睛
    ctx.fillStyle = COLORS.YELLOW;
    ctx.fillRect(x - 5 * s, y - 12 * s + bob, 4 * s, 4 * s);
    ctx.fillRect(x + 1 * s, y - 12 * s + bob, 4 * s, 4 * s);
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x - 4 * s, y - 11 * s + bob, 2 * s, 2 * s);
    ctx.fillRect(x + 2 * s, y - 11 * s + bob, 2 * s, 2 * s);
    // 嘴
    ctx.fillStyle = '#880000';
    ctx.fillRect(x - 4 * s, y - 5 * s + bob, 8 * s, 3 * s);
    ctx.fillStyle = COLORS.WHITE;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x - 3 * s + i * 2 * s, y - 5 * s + bob, s, 2 * s);
    }
    // 角
    ctx.fillStyle = '#880000';
    ctx.fillRect(x - 9 * s, y - 20 * s + bob, 4 * s, 6 * s);
    ctx.fillRect(x + 5 * s, y - 20 * s + bob, 4 * s, 6 * s);
    // 手臂
    ctx.fillStyle = '#AA2222';
    ctx.fillRect(x - 14 * s, y - 4 * s + bob, 5 * s, 12 * s);
    ctx.fillRect(x + 9 * s, y - 4 * s + bob, 5 * s, 12 * s);
  }

  private drawPlayerSprite(ctx: CanvasRenderingContext2D, x: number, y: number, player: Character): void {
    const s = PIXEL_SCALE;

    // 身体
    ctx.fillStyle = '#3366CC';
    ctx.fillRect(x - 6 * s, y - 5 * s, 12 * s, 14 * s);
    // 头
    ctx.fillStyle = COLORS.SKIN;
    ctx.fillRect(x - 5 * s, y - 12 * s, 10 * s, 8 * s);
    // 头发
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(x - 5 * s, y - 14 * s, 10 * s, 4 * s);
    ctx.fillRect(x - 5 * s, y - 12 * s, 2 * s, 4 * s);
    // 眼睛
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x - 3 * s, y - 9 * s, s, s);
    ctx.fillRect(x + 2 * s, y - 9 * s, s, s);
    // 剑
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 8 * s, y - 10 * s, 2 * s, 18 * s);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 6 * s, y - 2 * s, 6 * s, 3 * s);
    // 盾牌
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 12 * s, y - 6 * s, 6 * s, 10 * s);
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(x - 11 * s, y - 5 * s, 4 * s, 8 * s);
    // 腿
    ctx.fillStyle = '#333366';
    ctx.fillRect(x - 5 * s, y + 9 * s, 4 * s, 7 * s);
    ctx.fillRect(x + 1 * s, y + 9 * s, 4 * s, 7 * s);
    // 靴子
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 6 * s, y + 14 * s, 5 * s, 3 * s);
    ctx.fillRect(x, y + 14 * s, 5 * s, 3 * s);
  }
}
