/** 游戏画面尺寸 */
export const SCREEN_WIDTH = 375;
export const SCREEN_HEIGHT = 667;

/** 像素缩放倍数 */
export const PIXEL_SCALE = 2;

/** 游戏帧率 */
export const FPS = 30;

/** 每帧时间（毫秒） */
export const FRAME_TIME = 1000 / FPS;

/** 游戏状态枚举 */
export enum GAME_STATE {
  MENU = 'MENU',
  TOWN = 'TOWN',
  TRAVEL = 'TRAVEL',
  BATTLE = 'BATTLE',
  GAME_OVER = 'GAME_OVER',
}

/** 颜色常量 */
export const COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY: '#808080',
  DARK_GRAY: '#404040',
  LIGHT_GRAY: '#C0C0C0',
  RED: '#FF0000',
  DARK_RED: '#8B0000',
  GREEN: '#00FF00',
  DARK_GREEN: '#006400',
  BLUE: '#0000FF',
  DARK_BLUE: '#00008B',
  YELLOW: '#FFFF00',
  GOLD: '#FFD700',
  ORANGE: '#FFA500',
  BROWN: '#8B4513',
  SKIN: '#FFDAB9',
  SKY_BLUE: '#87CEEB',
  GRASS_GREEN: '#228B22',
  WATER_BLUE: '#4169E1',
  SAND: '#F4A460',
  PANEL_BG: '#2C2C2C',
  PANEL_BORDER: '#5A5A5A',
  BUTTON_BG: '#4A4A4A',
  BUTTON_HOVER: '#6A6A6A',
  BUTTON_TEXT: '#FFFFFF',
  HP_BAR: '#FF4444',
  HP_BAR_BG: '#440000',
  MP_BAR: '#4444FF',
  MP_BAR_BG: '#000044',
  EXP_BAR: '#44FF44',
  EXP_BAR_BG: '#004400',
  GOLD_COLOR: '#FFD700',
};

/** 像素字体大小 */
export const FONT_SIZE = {
  SMALL: 10,
  NORMAL: 14,
  LARGE: 18,
  TITLE: 24,
  HUGE: 32,
};
