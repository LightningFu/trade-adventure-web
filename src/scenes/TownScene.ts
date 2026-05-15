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
import { TradeSystem } from '../modules/trade/TradeSystem';
import { Inventory } from '../modules/trade/Inventory';
import { LevelSystem } from '../modules/rpg/LevelSystem';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, FONT_SIZE, PIXEL_SCALE } from '../constants/GameConfig';
import { TOWN_UNLOCK_LEVELS } from '../constants/TradeConfig';
import { formatNumber } from '../utils/MathUtils';
import townsData from '../data/tables/towns.json';
import routesData from '../data/tables/routes.json';
import { TravelScene } from './TravelScene';

/** 城镇配置 */
interface TownConfig {
  id: string;
  name: string;
  level: number;
  description: string;
}

/**
 * 城镇场景
 * 显示城镇名称、4个功能按钮(商店/背包/出发/状态)
 */
export class TownScene extends BaseScene {
  private game: Game;
  private renderer: Renderer;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private timer: Timer;
  private uiManager: UIManager;
  private tradeSystem: TradeSystem;
  private levelSystem: LevelSystem;
  private currentTown: TownConfig | null = null;
  private animTime: number = 0;
  private subScene: string = 'main'; // main, shop, inventory, status, travel
  private shopScrollY: number = 0;
  private inventoryScrollY: number = 0;
  private travelSelectedRoute: number = -1;
  private messageText: string = '';
  private messageTimer: number = 0;

  constructor(game: Game) {
    super();
    this.game = game;
    this.renderer = game.renderer;
    this.inputManager = game.inputManager;
    this.sceneManager = SceneManager.getInstance();
    this.timer = Timer.getInstance();
    this.uiManager = new UIManager(this.renderer, this.inputManager);
    this.tradeSystem = new TradeSystem(
      new Inventory(game.gameData.player.inventory)
    );
    this.levelSystem = new LevelSystem();
  }

  onEnter(): void {
    this.subScene = 'main';
    this.currentTown = townsData.find((t) => t.id === this.game.gameData.currentTownId) as TownConfig | null;
    this.inputManager.clearClickAreas();
    this.setupMainUI();
  }

  onExit(): void {
    this.uiManager.clear();
    this.inputManager.clearClickAreas();
    // 保存玩家背包数据
    this.game.gameData.player.inventory = this.tradeSystem.getInventory().toData();
  }

  onResume(): void {
    this.currentTown = townsData.find((t) => t.id === this.game.gameData.currentTownId) as TownConfig | null;
    this.inputManager.clearClickAreas();
    this.setupMainUI();
  }

  private setupMainUI(): void {
    this.uiManager.clear();
    this.subScene = 'main';

    const centerX = SCREEN_WIDTH / 2;
    const btnWidth = 160;
    const btnHeight = 44;
    const startY = 320;
    const gap = 56;

    // 商店按钮
    const shopBtn = new Button('town_shop', centerX - btnWidth / 2, startY, btnWidth, btnHeight, '商店', () => {
      this.openShop();
    });
    this.uiManager.addButton(shopBtn);

    // 背包按钮
    const bagBtn = new Button('town_bag', centerX - btnWidth / 2, startY + gap, btnWidth, btnHeight, '背包', () => {
      this.openInventory();
    });
    this.uiManager.addButton(bagBtn);

    // 出发按钮
    const travelBtn = new Button('town_travel', centerX - btnWidth / 2, startY + gap * 2, btnWidth, btnHeight, '出发', () => {
      this.openTravel();
    });
    this.uiManager.addButton(travelBtn);

    // 状态按钮
    const statusBtn = new Button('town_status', centerX - btnWidth / 2, startY + gap * 3, btnWidth, btnHeight, '状态', () => {
      this.openStatus();
    });
    this.uiManager.addButton(statusBtn);

    // 保存按钮
    const saveBtn = new Button('town_save', centerX - btnWidth / 2, startY + gap * 4, btnWidth, btnHeight, '保存游戏', () => {
      this.saveGame();
    });
    this.uiManager.addButton(saveBtn);
  }

  private openShop(): void {
    this.subScene = 'shop';
    this.shopScrollY = 0;
    this.inputManager.clearClickAreas();
    this.uiManager.clear();

    if (!this.currentTown) return;

    const goods = this.tradeSystem.getTownGoods(this.currentTown.id);
    const inventory = this.tradeSystem.getInventory();
    const inventoryItems = inventory.getItems();

    // 商店面板
    const shopPanel = new Panel(20, 80, SCREEN_WIDTH - 40, 480, `${this.currentTown.name} - 商店`);
    this.uiManager.addPanel('shop_panel', shopPanel);

    // 返回按钮
    const backBtn = new Button('shop_back', 20, SCREEN_HEIGHT - 50, 80, 36, '返回', () => {
      this.setupMainUI();
    });
    this.uiManager.addButton(backBtn);

    const contentArea = shopPanel.getContentArea();
    let y = contentArea.y + 10;
    
    // 显示城镇可购买的商品（买入区域）
    const buySectionLabel = new Label('【可购买】', contentArea.x + 10, y, COLORS.GOLD_COLOR, FONT_SIZE.SMALL);
    this.uiManager.addLabel('shop_buy_section', buySectionLabel);
    y += 20;
    
    goods.forEach((goodsInfo, index) => {
      // 货物名称和价格
      const nameLabel = new Label(
        `${goodsInfo.name}`,
        contentArea.x + 10,
        y,
        goodsInfo.priceColor,
        FONT_SIZE.NORMAL
      );
      this.uiManager.addLabel(`shop_name_${index}`, nameLabel);

      const priceLabel = new Label(
        `${goodsInfo.currentPrice}G (${goodsInfo.priceDescription})`,
        contentArea.x + 10,
        y + FONT_SIZE.NORMAL * PIXEL_SCALE + 4,
        goodsInfo.priceColor,
        FONT_SIZE.SMALL
      );
      this.uiManager.addLabel(`shop_price_${index}`, priceLabel);

      // 买入按钮
      const buyBtn = new Button(
        `shop_buy_${index}`,
        contentArea.x + contentArea.width - 70,
        y + 4,
        56,
        30,
        '买入',
        () => {
          this.buyGoods(goodsInfo.goodsId, 1);
        }
      );
      this.uiManager.addButton(buyBtn);
      
      y += 55;
    });
    
    // 显示背包中的物品（卖出区域）
    y += 10;
    const sellSectionLabel = new Label('【背包物品】', contentArea.x + 10, y, COLORS.GOLD_COLOR, FONT_SIZE.SMALL);
    this.uiManager.addLabel('shop_sell_section', sellSectionLabel);
    y += 20;
    
    if (inventoryItems.length === 0) {
      const emptyLabel = new Label('背包是空的', contentArea.x + 10, y, COLORS.GRAY, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('shop_empty_inv', emptyLabel);
    } else {
      inventoryItems.forEach((item, index) => {
        const goodsInfo = this.tradeSystem.getGoodsInfo(item.goodsId);
        if (!goodsInfo) return;
        
        // 获取当前城镇该物品的卖出价格（如果城镇有该商品，用城镇价格；否则用基础价格）
        const townGoods = goods.find(g => g.goodsId === item.goodsId);
        const sellPrice = townGoods ? townGoods.currentPrice : Math.floor(goodsInfo.basePrice * 0.8);
        
        // 物品名称和数量
        const nameLabel = new Label(
          `${goodsInfo.name} x${item.quantity}`,
          contentArea.x + 10,
          y,
          COLORS.WHITE,
          FONT_SIZE.NORMAL
        );
        this.uiManager.addLabel(`inv_name_${index}`, nameLabel);

        const priceLabel = new Label(
          `卖出价: ${sellPrice}G`,
          contentArea.x + 10,
          y + FONT_SIZE.NORMAL * PIXEL_SCALE + 4,
          COLORS.LIGHT_GRAY,
          FONT_SIZE.SMALL
        );
        this.uiManager.addLabel(`inv_price_${index}`, priceLabel);

        // 卖出按钮
        const sellBtn = new Button(
          `shop_sell_${index}`,
          contentArea.x + contentArea.width - 70,
          y + 4,
          56,
          30,
          '卖出',
          () => {
            this.sellGoods(item.goodsId, 1);
          }
        );
        this.uiManager.addButton(sellBtn);
        
        y += 55;
      });
    }
  }

  private buyGoods(goodsId: string, quantity: number): void {
    if (!this.currentTown) return;
    const result = this.tradeSystem.buy(goodsId, quantity, this.currentTown.id, this.game.gameData.player.gold);
    if (result.success) {
      this.game.gameData.player.gold += result.goldChange;
      this.game.gameData.totalTrades++;
      this.showMessage(result.message);
      this.openShop(); // 刷新商店
    } else {
      this.showMessage(result.message);
    }
  }

  private sellGoods(goodsId: string, quantity: number): void {
    if (!this.currentTown) return;
    const result = this.tradeSystem.sell(goodsId, quantity, this.currentTown.id);
    if (result.success) {
      this.game.gameData.player.gold += result.goldChange;
      this.game.gameData.totalTrades++;
      this.showMessage(result.message);
      this.openShop(); // 刷新商店
    } else {
      this.showMessage(result.message);
    }
  }

  private openInventory(): void {
    this.subScene = 'inventory';
    this.inputManager.clearClickAreas();
    this.uiManager.clear();

    const inventory = this.tradeSystem.getInventory();
    const items = inventory.getItems();

    // 背包面板
    const invPanel = new Panel(20, 80, SCREEN_WIDTH - 40, 480, `背包 (${inventory.getUsedSlots()}/${20})`);
    this.uiManager.addPanel('inv_panel', invPanel);

    // 返回按钮
    const backBtn = new Button('inv_back', 20, SCREEN_HEIGHT - 50, 80, 36, '返回', () => {
      this.setupMainUI();
    });
    this.uiManager.addButton(backBtn);

    const contentArea = invPanel.getContentArea();

    if (items.length === 0) {
      const emptyLabel = new Label('背包是空的', contentArea.x + 10, contentArea.y + 20, COLORS.GRAY, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('inv_empty', emptyLabel);
    } else {
      items.forEach((item, index) => {
        const y = contentArea.y + 10 + index * 40;
        const goodsInfo = this.tradeSystem.getGoodsInfo(item.goodsId);
        const name = goodsInfo ? goodsInfo.name : item.goodsId;

        const nameLabel = new Label(
          `${name} x${item.quantity}`,
          contentArea.x + 10,
          y,
          COLORS.WHITE,
          FONT_SIZE.NORMAL
        );
        this.uiManager.addLabel(`inv_item_${index}`, nameLabel);

        const priceLabel = new Label(
          `买入价: ${item.buyPrice}G`,
          contentArea.x + 10,
          y + FONT_SIZE.NORMAL * PIXEL_SCALE + 2,
          COLORS.GRAY,
          FONT_SIZE.SMALL
        );
        this.uiManager.addLabel(`inv_price_${index}`, priceLabel);
      });
    }
  }

  private openTravel(): void {
    this.subScene = 'travel';
    this.travelSelectedRoute = -1;
    this.inputManager.clearClickAreas();
    this.uiManager.clear();

    if (!this.currentTown) return;

    // 获取从当前城镇出发的路线
    const availableRoutes = routesData.filter(
      (r) => r.from === this.currentTown!.id || r.to === this.currentTown!.id
    );

    // 旅行面板
    const travelPanel = new Panel(20, 80, SCREEN_WIDTH - 40, 480, '选择目的地');
    this.uiManager.addPanel('travel_panel', travelPanel);

    // 返回按钮
    const backBtn = new Button('travel_back', 20, SCREEN_HEIGHT - 50, 80, 36, '返回', () => {
      this.setupMainUI();
    });
    this.uiManager.addButton(backBtn);

    const contentArea = travelPanel.getContentArea();

    if (availableRoutes.length === 0) {
      const noRouteLabel = new Label('没有可用的路线', contentArea.x + 10, contentArea.y + 20, COLORS.GRAY, FONT_SIZE.NORMAL);
      this.uiManager.addLabel('travel_noroute', noRouteLabel);
    } else {
      availableRoutes.forEach((route, index) => {
        const destId = route.from === this.currentTown!.id ? route.to : route.from;
        const destTown = townsData.find((t) => t.id === destId);
        if (!destTown) return;

        const requiredLevel = TOWN_UNLOCK_LEVELS[destId] || 1;
        const unlocked = this.game.gameData.player.level >= requiredLevel;

        const y = contentArea.y + 10 + index * 70;

        // 目的地名称
        const nameLabel = new Label(
          `${destTown.name} (Lv.${destTown.level})`,
          contentArea.x + 10,
          y,
          unlocked ? COLORS.WHITE : COLORS.GRAY,
          FONT_SIZE.NORMAL
        );
        this.uiManager.addLabel(`travel_dest_${index}`, nameLabel);

        // 路线信息
        const infoLabel = new Label(
          `距离:${route.distance} 危险:${'★'.repeat(route.dangerLevel)}${'☆'.repeat(5 - route.dangerLevel)}`,
          contentArea.x + 10,
          y + FONT_SIZE.NORMAL * PIXEL_SCALE + 4,
          COLORS.LIGHT_GRAY,
          FONT_SIZE.SMALL
        );
        this.uiManager.addLabel(`travel_info_${index}`, infoLabel);

        // 出发按钮
        const goBtn = new Button(
          `travel_go_${index}`,
          contentArea.x + contentArea.width - 70,
          y + 8,
          60,
          30,
          unlocked ? '出发' : '未解锁',
          () => {
            if (unlocked) {
              this.startTravel(route.id, destId);
            }
          }
        );
        goBtn.setEnabled(unlocked);
        this.uiManager.addButton(goBtn);
      });
    }
  }

  private startTravel(routeId: string, destTownId: string): void {
    this.game.gameData.visitTown(destTownId);
    const route = routesData.find((r) => r.id === routeId);
    if (route) {
      this.game.gameData.totalDistance += route.distance;
      this.tradeSystem.advanceTime(Math.ceil(route.travelTime / 3));
    }
    this.sceneManager.replace(new TravelScene(this.game, destTownId));
  }

  private openStatus(): void {
    this.subScene = 'status';
    this.inputManager.clearClickAreas();
    this.uiManager.clear();

    const player = this.game.gameData.player;

    // 状态面板
    const statusPanel = new Panel(20, 80, SCREEN_WIDTH - 40, 480, '角色状态');
    this.uiManager.addPanel('status_panel', statusPanel);

    // 返回按钮
    const backBtn = new Button('status_back', 20, SCREEN_HEIGHT - 50, 80, 36, '返回', () => {
      this.setupMainUI();
    });
    this.uiManager.addButton(backBtn);

    const contentArea = statusPanel.getContentArea();
    let y = contentArea.y + 10;
    const lineH = FONT_SIZE.NORMAL * PIXEL_SCALE + 8;

    // 角色信息
    const nameInfo = new Label(`${player.name}  Lv.${player.level}`, contentArea.x + 10, y, COLORS.GOLD, FONT_SIZE.NORMAL);
    this.uiManager.addLabel('status_name', nameInfo);
    y += lineH;

    // HP条
    const hpBar = new ProgressBar(contentArea.x + 10, y, contentArea.width - 20, 16, COLORS.HP_BAR, COLORS.HP_BAR_BG);
    hpBar.setValue(player.hp, player.maxHp);
    hpBar.setLabelText(`HP: ${player.hp}/${player.maxHp}`);
    this.uiManager.addProgressBar('status_hp', hpBar);
    y += 28;

    // MP条
    const mpBar = new ProgressBar(contentArea.x + 10, y, contentArea.width - 20, 16, COLORS.MP_BAR, COLORS.MP_BAR_BG);
    mpBar.setValue(player.mp, player.maxMp);
    mpBar.setLabelText(`MP: ${player.mp}/${player.maxMp}`);
    this.uiManager.addProgressBar('status_mp', mpBar);
    y += 28;

    // 经验条
    const nextExp = this.levelSystem.getNextLevelExp(player.level);
    const currentExp = this.levelSystem.getExpRequired(player.level);
    const expBar = new ProgressBar(contentArea.x + 10, y, contentArea.width - 20, 16, COLORS.EXP_BAR, COLORS.EXP_BAR_BG);
    expBar.setValue(player.exp - currentExp, nextExp - currentExp);
    expBar.setLabelText(`EXP: ${player.exp}/${nextExp}`);
    this.uiManager.addProgressBar('status_exp', expBar);
    y += 36;

    // 属性信息
    const stats = [
      `攻击力: ${player.atk}`,
      `防御力: ${player.def}`,
      `金币: ${formatNumber(player.gold)}`,
      `背包: ${player.inventory.length}/20`,
      `总战斗: ${this.game.gameData.totalBattles}`,
      `总交易: ${this.game.gameData.totalTrades}`,
      `总路程: ${this.game.gameData.totalDistance}`,
    ];

    stats.forEach((stat, index) => {
      const label = new Label(stat, contentArea.x + 10, y + index * lineH, COLORS.WHITE, FONT_SIZE.NORMAL);
      this.uiManager.addLabel(`status_stat_${index}`, label);
    });
  }

  private saveGame(): void {
    this.game.gameData.player.inventory = this.tradeSystem.getInventory().toData();
    const success = this.game.saveManager.save(this.game.gameData.toSaveData());
    this.showMessage(success ? '游戏已保存！' : '保存失败！');
  }

  private showMessage(text: string): void {
    this.messageText = text;
    this.messageTimer = 2.0;
  }

  update(dt: number): void {
    this.animTime += dt;
    this.uiManager.update(dt);

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }
  }

  render(): void {
    const ctx = this.renderer.getContext();

    // 背景
    this.drawTownBackground(ctx);

    // 城镇信息
    if (this.currentTown) {
      // 城镇名称
      this.renderer.drawTextCenter(
        this.currentTown.name,
        20,
        COLORS.GOLD,
        FONT_SIZE.LARGE
      );

      // 城镇描述
      this.renderer.drawTextCenter(
        this.currentTown.description,
        56,
        COLORS.LIGHT_GRAY,
        FONT_SIZE.SMALL
      );

      // 金币显示
      this.renderer.drawText(
        `金币: ${formatNumber(this.game.gameData.player.gold)}`,
        SCREEN_WIDTH - 10,
        10,
        COLORS.GOLD_COLOR,
        FONT_SIZE.SMALL,
        'right'
      );

      // 等级显示
      this.renderer.drawText(
        `Lv.${this.game.gameData.player.level}`,
        10,
        10,
        COLORS.WHITE,
        FONT_SIZE.SMALL
      );
    }

    // 像素风城镇建筑
    this.drawTownBuildings(ctx);

    // 渲染UI
    this.uiManager.render();

    // 消息提示
    if (this.messageTimer > 0 && this.messageText) {
      const alpha = Math.min(1, this.messageTimer);
      ctx.globalAlpha = alpha;
      this.renderer.drawPixelRect(
        SCREEN_WIDTH / 2 - 120,
        SCREEN_HEIGHT / 2 - 20,
        240,
        40,
        COLORS.PANEL_BG,
        COLORS.GOLD
      );
      this.renderer.drawTextCenter(this.messageText, SCREEN_HEIGHT / 2 - 12, COLORS.WHITE, FONT_SIZE.NORMAL);
      ctx.globalAlpha = 1.0;
    }
  }

  private drawTownBackground(ctx: CanvasRenderingContext2D): void {
    // 天空
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#E0F0FF');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 地面
    ctx.fillStyle = '#4a7c3f';
    ctx.fillRect(0, SCREEN_HEIGHT * 0.7, SCREEN_WIDTH, SCREEN_HEIGHT * 0.3);

    // 道路
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(SCREEN_WIDTH / 2 - 20, SCREEN_HEIGHT * 0.7, 40, SCREEN_HEIGHT * 0.3);
  }

  private drawTownBuildings(ctx: CanvasRenderingContext2D): void {
    const s = PIXEL_SCALE;
    const baseY = SCREEN_HEIGHT * 0.7;

    // 左侧建筑（商店）
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(30, baseY - 60 * s, 50 * s, 60 * s);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(32 * s, baseY - 58 * s, 46 * s, 56 * s);
    // 屋顶
    ctx.fillStyle = '#CC3333';
    ctx.beginPath();
    ctx.moveTo(25 * s, baseY - 60 * s);
    ctx.lineTo(55 * s, baseY - 80 * s);
    ctx.lineTo(85 * s, baseY - 60 * s);
    ctx.fill();
    // 门
    ctx.fillStyle = '#654321';
    ctx.fillRect(45 * s, baseY - 25 * s, 12 * s, 25 * s);
    // 窗户
    ctx.fillStyle = '#FFFF99';
    ctx.fillRect(35 * s, baseY - 50 * s, 10 * s, 10 * s);
    ctx.fillRect(60 * s, baseY - 50 * s, 10 * s, 10 * s);

    // 右侧建筑（仓库）
    ctx.fillStyle = '#696969';
    ctx.fillRect(SCREEN_WIDTH - 100, baseY - 50 * s, 60 * s, 50 * s);
    ctx.fillStyle = '#808080';
    ctx.fillRect(SCREEN_WIDTH - 98, baseY - 48 * s, 56 * s, 48 * s);
    // 屋顶
    ctx.fillStyle = '#555555';
    ctx.fillRect(SCREEN_WIDTH - 105, baseY - 55 * s, 70 * s, 8 * s);
    // 门
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(SCREEN_WIDTH - 70, baseY - 22 * s, 14 * s, 22 * s);
  }
}
