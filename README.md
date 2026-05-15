# 商路风云 (Trade Adventure)

一款像素复古风格的经营类冒险微信小游戏，支持纯 Web 运行。

![Game Banner](https://img.shields.io/badge/Game-Trade%20Adventure-brightgreen)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 游戏介绍

**商路风云** 是一款经营 + 战斗类休闲游戏。玩家扮演一位行商，在不同城镇之间贩运货物赚取利润。旅途中需要穿越各种危险地带，遭遇敌人时进入回合制战斗。

### 核心玩法

- 🏪 **城镇经营**: 在不同城镇之间买卖货物，赚取差价
- 💰 **价格波动**: 各城镇物价随时间波动，需要把握时机
- ⚔️ **回合制战斗**: 旅途中遭遇敌人，通过技能战斗
- 📈 **角色成长**: 积累经验升级，提升战斗实力
- 🗺️ **探索世界**: 解锁更多城镇，发现更赚钱的贸易路线

## 🕹️ 操作说明

### 触摸操作
- **点击**: 与 UI 元素交互
- **滑动**: 滚动列表

### 鼠标操作 (桌面端)
- **单击**: 与 UI 元素交互
- **滚轮**: 滚动列表

## 🏗️ 技术架构

| 技术 | 用途 |
|------|------|
| TypeScript | 开发语言 |
| HTML5 Canvas | 2D 渲染引擎 |
| Vite | 构建工具 |
| GitHub Pages | 静态托管 |

## 📦 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看游戏。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 🚀 部署

### GitHub Pages (自动部署)

1. Fork 本仓库或点击 "Use this template" 创建新仓库
2. 在仓库 Settings → Pages 中：
   - Source: GitHub Actions
3. 推送代码到 `main` 分支，自动部署

### 手动部署

```bash
npm run build
```

将 `dist/` 目录内容部署到任意静态服务器。

## 📁 项目结构

```
trade-adventure-web/
├── index.html              # Web 入口页面
├── src/
│   ├── main.ts             # Web 版主入口
│   ├── core/               # 游戏引擎核心
│   │   ├── Game.ts         # 游戏主类
│   │   ├── GameLoop.ts     # 游戏循环
│   │   ├── Renderer.ts     # Canvas 渲染器
│   │   ├── InputManager.ts # 输入管理
│   │   ├── AudioManager.ts # 音频管理
│   │   └── ...
│   ├── scenes/             # 游戏场景
│   │   ├── MainMenuScene.ts   # 主菜单
│   │   ├── TownScene.ts       # 城镇
│   │   ├── TravelScene.ts     # 旅行
│   │   ├── BattleScene.ts     # 战斗
│   │   └── GameOverScene.ts   # 游戏结束
│   ├── modules/            # 游戏模块
│   │   ├── battle/         # 战斗系统
│   │   ├── trade/          # 交易系统
│   │   └── rpg/            # RPG 成长
│   ├── ui/                 # UI 组件
│   ├── data/               # 数据管理
│   ├── constants/          # 配置常量
│   └── utils/              # 工具函数
├── assets/
│   └── sprites/            # 游戏素材
└── dist/                   # 构建输出
```

## 🎨 游戏素材

所有游戏素材均为 AI 生成或开源素材。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 微信小游戏开发文档
- TypeScript 团队
- Vite 构建工具
