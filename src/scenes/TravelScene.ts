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
import { RANDOM_EVENT_CHANCE } from '../constants/TradeConfig';
import { chance, formatNumber, randomInt } from '../utils/MathUtils';
import routesData from '../data/tables/routes.json';
import enemiesData from '../data/tables/enemies.json';
import townsData from '../data/tables/towns.json';
import { GameOverScene } from './GameOverScene';
import { TownScene } from './TownScene';

/**
 * 旅行场景
 * 显示路线进度条、随机事件触发
 */
export class TravelScene extends BaseScene {
  private game: Game;
  private renderer: Renderer;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private timer: Timer;
  private uiManager: UIManager;
  private destTownId: string;
  private progress: number = 0; // 0-100
  private travelSpeed: number = 2; // 每秒进度
  private isTraveling: boolean = true;
  private animTime: number = 0;
  private eventTriggered: boolean = false;
  private battleSystem: BattleSystem | null = null;
  private battleLogs: BattleLog[] = [];
  private battleResult: BattleResult | null = null;
  private showBattleResult: boolean = false;
  private enemyShakeTime: number = 0;
  private playerShakeTime: number = 0;
  private subScene: string = 'travel';

  constructor(game: Game, destTownId: string) {
    super();
    this.game = game;
    this.renderer = game.renderer;
    this.inputManager = game.inputManager;
    this.sceneManager = SceneManager.getInstance();
    this.timer = Timer.getInstance();
    this.uiManager = new UIManager(this.renderer, this.inputManager);
    this.destTownId = destTownId;
  }

  onEnter(): void {
    this.inputManager.clearClickAreas();
    this.setupTravelUI();
  }

  onExit(): void {
    this.uiManager.clear();
    this.inputManager.clearClickAreas();
  }

  private setupTravelUI(): void {
    this.uiManager.clear();
    this.subScene = 'travel';

    // 旅行信息面板
    const travelPanel = new Panel(20, 100, SCREEN_WIDTH - 40, 300, '旅行中...');
    this.uiManager.addPanel('travel_info', travelPanel);

    // 进度条
    const progressBar = new ProgressBar(40, 200, SCREEN_WIDTH - 80, 24, COLORS.EXP_BAR, COLORS.EXP_BAR_BG);
    progressBar.setLabelText('0%');
    this.uiManager.addProgressBar('travel_progress', progressBar);

    // 提示文字
    const tipLabel = new Label('旅途中可能遇到危险...', 40, 240, COLORS.LIGHT_GRAY, FONT_SIZE.SMALL);
    this.uiManager.addLabel('travel_tip', tipLabel);
  }

  private setupBattleUI(): void {
    this.uiManager.clear();

    if (!this.battleSystem) return;

    const player = this.battleSystem.getPlayer();
    const enemy = this.battleSystem.getEnemy();

    // 战斗面板
    const battlePanel = new Panel(10, 10, SCREEN_WIDTH - 20, SCREEN_HEIGHT - 20, '战斗');
    this.uiManager.addPanel('battle_panel', battlePanel);

    // 敌人信息
    const enemyNameLabel = new Label(
      `${enemy.name} Lv.${enemy.level}`,
      SCREEN_WIDTH / 2,
      60,
      COLORS.RED,
      FONT_SIZE.NORMAL
    );
    enemyNameLabel.setAlign('center');
    this.uiManager.addLabel('enemy_name', enemyNameLabel);

    // 敌人HP条
    const enemyHpBar = new ProgressBar(40, 90, SCREEN_WIDTH - 80, 18, COLORS.HP_BAR, COLORS.HP_BAR_BG);
    enemyHpBar.setValue(enemy.hp, enemy.maxHp);
    this.uiManager.addProgressBar('enemy_hp', enemyHpBar);

    // 玩家信息
    const playerNameLabel = new Label(
      `${player.name} Lv.${player.level}`,
      40,
      360,
      COLORS.WHITE,
      FONT_SIZE.NORMAL
    );
    this.uiManager.addLabel('player_name', playerNameLabel);

    // 玩家HP条
    const playerHpBar = new ProgressBar(40, 390, SCREEN_WIDTH - 80, 18, COLORS.HP_BAR, COLORS.HP_BAR_BG);
    playerHpBar.setValue(player.hp, player.maxHp);
    playerHpBar.setLabelText(`HP: ${player.hp}/${player.maxHp}`);
    this.uiManager.addProgressBar('player_hp', playerHpBar);

    // 玩家MP条
    const playerMpBar = new ProgressBar(40, 414, SCREEN_WIDTH - 80, 14, COLORS.MP_BAR, COLORS.MP_BAR_BG);
    playerMpBar.setValue(player.mp, player.maxMp);
    playerMpBar.setLabelText(`MP: ${player.mp}/${player.maxMp}`);
    this.uiManager.addProgressBar('player_mp', playerMpBar);

    // 战斗日志
    const logLabel = new Label('', 40, 440, COLORS.LIGHT_GRAY, FONT_SIZE.SMALL);
    this.uiManager.addLabel('battle_log', logLabel);

    // 技能按钮
    const skills = this.battleSystem.getAvailableSkills();
    const btnWidth = 80;
    const btnHeight = 36;
    const btnGap = 6;
    const totalWidth = skills.length * btnWidth + (skills.length - 1) * btnGap;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;
    const btnY = 510;

    skills.forEach((skill, index) => {
      // 普通攻击和防御、逃跑不显示MP消耗（mpCost为0）
      const buttonText = skill.mpCost > 0 ? `${skill.name}(${skill.mpCost})` : skill.name;
      const btn = new Button(
        `skill_${skill.id}`,
        startX + index * (btnWidth + btnGap),
        btnY,
        btnWidth,
        btnHeight,
        buttonText,
        () => {
          if (this.battleSystem && this.battleSystem.getState() === BATTLE_STATE.PLAYER_TURN) {
            this.playerUseSkill(skill.id);
          }
        }
      );
      this.uiManager.addButton(btn);
    });
  }

  private setupBattleResultUI(): void {
    this.uiManager.clear();

    if (!this.battleResult) return;

    const isVictory = this.battleResult.victory;

    // 结果面板
    const resultPanel = new Panel(40, 150, SCREEN_WIDTH - 80, 300, isVictory ? '战斗胜利！' : (this.battleResult.fled ? '成功逃脱' : '战斗失败'));
    this.uiManager.addPanel('result_panel', resultPanel);

    const contentArea = resultPanel.getContentArea();
    let y = contentArea.y + 10;
    const lineH = FONT_SIZE.NORMAL * PIXEL_SCALE + 10;

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
    } else if (!this.battleResult.fled) {
      const defeatLabel = new Label('你被击败了...', contentArea.x + 10, y, COLORS.RED, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('result_defeat', defeatLabel);
      y += lineH;
    }

    // 继续按钮
    const continueBtn = new Button(
      'result_continue',
      SCREEN_WIDTH / 2 - 60,
      contentArea.y + contentArea.height - 50,
      120,
      40,
      '继续',
      () => {
        this.handleBattleResult();
      }
    );
    this.uiManager.addButton(continueBtn);
  }

  private triggerBattle(): void {
    this.eventTriggered = true;

    // 根据路线获取可能的敌人
    const route = routesData.find((r) => {
      const from = this.game.gameData.currentTownId;
      return (r.from === from && r.to === this.destTownId) || (r.to === from && r.from === this.destTownId);
    });

    let possibleEnemyIds: string[] = ['1', '2']; // 默认
    if (route) {
      possibleEnemyIds = route.possibleEnemies;
    }

    // 筛选适合等级的敌人
    const playerLevel = this.game.gameData.player.level;
    const available = possibleEnemyIds.filter((id) => {
      const enemy = enemiesData.find((e) => e.id === id);
      if (!enemy) return false;
      return playerLevel >= enemy.minLevel && playerLevel <= enemy.maxLevel + 2;
    });

    if (available.length === 0) {
      // 没有合适的敌人，继续旅行
      this.eventTriggered = false;
      return;
    }

    // 随机选择一个敌人
    const enemyId = available[randomInt(0, available.length - 1)];

    // 创建战斗
    const player = new Character(
      this.game.gameData.player.name,
      this.game.gameData.player.level,
      this.game.gameData.player.hp,
      this.game.gameData.player.maxHp,
      this.game.gameData.player.mp,
      this.game.gameData.player.maxMp,
      this.game.gameData.player.atk,
      this.game.gameData.player.def
    );
    const enemy = new Enemy(enemyId, playerLevel);

    this.battleSystem = new BattleSystem(player, enemy);
    this.battleLogs = [];

    this.battleSystem.onLog((log) => {
      this.battleLogs.push(log);
      if (this.battleLogs.length > 4) {
        this.battleLogs.shift();
      }
    });

    this.battleSystem.onBattleEnd((result) => {
      this.battleResult = result;
      this.showBattleResult = true;
      this.timer.setTimeout(() => {
        this.setupBattleResultUI();
      }, BATTLE_ANIMATION_DELAY);
    });

    this.battleSystem.startBattle();
    this.setupBattleUI();
  }

  private playerUseSkill(skillId: string): void {
    if (!this.battleSystem) return;

    this.battleSystem.playerAction(skillId);

    if (this.battleSystem.getState() === BATTLE_STATE.ENEMY_TURN) {
      // 延迟执行敌人回合
      this.timer.setTimeout(() => {
        this.battleSystem!.enemyTurn();
        this.updateBattleUI();
      }, BATTLE_ANIMATION_DELAY);
    } else {
      this.updateBattleUI();
    }
  }

  private updateBattleUI(): void {
    if (!this.battleSystem) return;

    const player = this.battleSystem.getPlayer();
    const enemy = this.battleSystem.getEnemy();

    // 更新HP条
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
    }

    // 更新日志
    const logLabel = this.uiManager.getLabel('battle_log');
    if (logLabel && this.battleLogs.length > 0) {
      const lastLog = this.battleLogs[this.battleLogs.length - 1];
      const logColor = lastLog.type === 'critical' ? COLORS.YELLOW :
                        lastLog.type === 'player' ? COLORS.GREEN :
                        lastLog.type === 'enemy' ? COLORS.RED : COLORS.WHITE;
      logLabel.setText(lastLog.message);
      logLabel.setColor(logColor);
    }
  }

  private handleBattleResult(): void {
    if (!this.battleResult) return;

    if (this.battleResult.victory) {
      // 应用战斗结果
      this.game.gameData.player.hp = this.battleResult.playerHp;
      this.game.gameData.player.mp = this.battleResult.playerMp;
      this.game.gameData.player.gold += this.battleResult.goldGained;
      this.game.gameData.totalBattles++;

      // 检查升级
      const levelSystem = new LevelSystem();
      this.game.gameData.player.exp += this.battleResult.expGained;

      while (levelSystem.canLevelUp(this.game.gameData.player.level, this.game.gameData.player.exp)) {
        const newLevel = this.game.gameData.player.level + 1;
        const stats = levelSystem.calculateLevelUpStats(newLevel);
        this.game.gameData.levelUp(stats.maxHp, stats.maxMp, stats.atk, stats.def);
      }
    } else if (!this.battleResult.fled) {
      // 战斗失败
      this.game.gameData.player.hp = this.battleResult.playerHp;
      this.game.gameData.player.mp = this.battleResult.playerMp;

      if (this.game.gameData.player.hp <= 0) {
        // 游戏结束
        this.sceneManager.replace(new GameOverScene(this.game));
        return;
      }
    }

    // 继续旅行
    this.battleSystem = null;
    this.battleResult = null;
    this.showBattleResult = false;
    this.eventTriggered = false;
    this.setupTravelUI();
  }

  update(dt: number): void {
    this.animTime += dt;

    if (this.isTraveling && !this.eventTriggered && !this.showBattleResult) {
      this.progress += this.travelSpeed * dt;

      // 更新进度条
      const progressBar = this.uiManager.getProgressBar('travel_progress');
      if (progressBar) {
        const pct = Math.min(100, Math.floor(this.progress));
        progressBar.setValue(this.progress, 100);
        progressBar.setLabelText(`${pct}%`);
      }

      // 随机事件检测
      if (this.progress > 20 && this.progress < 80 && chance(RANDOM_EVENT_CHANCE * dt)) {
        this.triggerBattle();
      }

      // 到达目的地
      if (this.progress >= 100) {
        this.arriveAtDestination();
      }
    }

    // 战斗中更新
    if (this.battleSystem && !this.showBattleResult) {
      this.updateBattleUI();
    }

    this.uiManager.update(dt);
  }

  private arriveAtDestination(): void {
    this.isTraveling = false;
    this.game.gameData.visitTown(this.destTownId);
    this.game.setGameState(GAME_STATE.TOWN);
    this.sceneManager.replace(new TownScene(this.game));
  }

  render(): void {
    const ctx = this.renderer.getContext();

    if (this.isTraveling && !this.eventTriggered && !this.showBattleResult) {
      this.renderTravelScene(ctx);
    } else if (this.battleSystem && !this.showBattleResult) {
      this.renderBattleScene(ctx);
    }

    // 渲染UI
    this.uiManager.render();
  }

  private renderTravelScene(ctx: CanvasRenderingContext2D): void {
    // 旅行背景
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.4, '#E0F0FF');
    gradient.addColorStop(0.7, '#4a7c3f');
    gradient.addColorStop(1, '#2d5a27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 道路
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(SCREEN_WIDTH / 2 - 15, 0, 30, SCREEN_HEIGHT);

    // 移动的像素商人
    const merchantY = SCREEN_HEIGHT * 0.5 - this.progress * 3;
    this.drawWalkingMerchant(ctx, SCREEN_WIDTH / 2, merchantY);

    // 标题
    this.renderer.drawTextCenter('旅行中...', 20, COLORS.WHITE, FONT_SIZE.LARGE);

    // 目的地
    const destTown = townsData.find((t) => t.id === this.destTownId);
    if (destTown) {
      this.renderer.drawTextCenter(`目的地: ${destTown.name}`, 50, COLORS.GOLD, FONT_SIZE.NORMAL);
    }
  }

  private renderBattleScene(ctx: CanvasRenderingContext2D): void {
    if (!this.battleSystem) return;

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

    const enemy = this.battleSystem.getEnemy();
    const player = this.battleSystem.getPlayer();

    // 绘制敌人（像素风怪物）
    const enemyShake = this.enemyShakeTime > 0 ? randomInt(-2, 2) : 0;
    this.drawEnemy(ctx, SCREEN_WIDTH / 2 + enemyShake, 200, enemy);

    // 绘制玩家
    const playerShake = this.playerShakeTime > 0 ? randomInt(-2, 2) : 0;
    this.drawPlayer(ctx, 80 + playerShake, 300, player);
  }

  private drawWalkingMerchant(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const s = PIXEL_SCALE;
    const bobY = Math.sin(this.animTime * 5) * 2;

    // 身体
    ctx.fillStyle = COLORS.BLUE;
    ctx.fillRect(x - 4 * s, y - 4 * s + bobY, 8 * s, 10 * s);
    // 头
    ctx.fillStyle = COLORS.SKIN;
    ctx.fillRect(x - 3 * s, y - 10 * s + bobY, 6 * s, 6 * s);
    // 帽子
    ctx.fillStyle = COLORS.BROWN;
    ctx.fillRect(x - 4 * s, y - 12 * s + bobY, 8 * s, 3 * s);
    // 腿（交替）
    const legOffset = Math.sin(this.animTime * 10) * 2;
    ctx.fillStyle = COLORS.DARK_GRAY;
    ctx.fillRect(x - 3 * s, y + 6 * s + bobY, 2 * s, 5 * s + legOffset);
    ctx.fillRect(x + 1 * s, y + 6 * s + bobY, 2 * s, 5 * s - legOffset);
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, enemy: any): void {
    const s = PIXEL_SCALE;
    const bob = Math.sin(this.animTime * 2) * 2;

    // 怪物身体（红色系）
    ctx.fillStyle = '#CC3333';
    ctx.fillRect(x - 8 * s, y - 6 * s + bob, 16 * s, 14 * s);
    // 眼睛
    ctx.fillStyle = COLORS.YELLOW;
    ctx.fillRect(x - 4 * s, y - 3 * s + bob, 3 * s, 3 * s);
    ctx.fillRect(x + 1 * s, y - 3 * s + bob, 3 * s, 3 * s);
    // 瞳孔
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x - 3 * s, y - 2 * s + bob, s, s);
    ctx.fillRect(x + 2 * s, y - 2 * s + bob, s, s);
    // 嘴
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x - 3 * s, y + 2 * s + bob, 6 * s, 2 * s);
    // 角
    ctx.fillStyle = '#880000';
    ctx.fillRect(x - 7 * s, y - 10 * s + bob, 3 * s, 5 * s);
    ctx.fillRect(x + 4 * s, y - 10 * s + bob, 3 * s, 5 * s);
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, player: any): void {
    const s = PIXEL_SCALE;

    // 身体
    ctx.fillStyle = '#3366CC';
    ctx.fillRect(x - 5 * s, y - 4 * s, 10 * s, 12 * s);
    // 头
    ctx.fillStyle = COLORS.SKIN;
    ctx.fillRect(x - 4 * s, y - 10 * s, 8 * s, 7 * s);
    // 头发
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(x - 4 * s, y - 12 * s, 8 * s, 3 * s);
    // 眼睛
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x - 2 * s, y - 7 * s, s, s);
    ctx.fillRect(x + 1 * s, y - 7 * s, s, s);
    // 剑
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 6 * s, y - 8 * s, 2 * s, 14 * s);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 5 * s, y - 2 * s, 4 * s, 2 * s);
    // 腿
    ctx.fillStyle = '#333366';
    ctx.fillRect(x - 4 * s, y + 8 * s, 3 * s, 6 * s);
    ctx.fillRect(x + 1 * s, y + 8 * s, 3 * s, 6 * s);
  }
}
