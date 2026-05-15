import { chromium } from 'playwright';

async function testGame() {
  console.log('🎮 游戏功能全面测试\n');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 加载游戏
    console.log('📍 [1/10] 加载游戏页面...');
    await page.goto('https://lightningfu.github.io/trade-adventure-web/');
    await page.waitForTimeout(2000);
    
    // 获取画布信息
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        width: canvas.width,
        height: canvas.height,
        rectLeft: rect.left,
        rectTop: rect.top,
        scaleX: canvas.width / rect.width,
        scaleY: canvas.height / rect.height
      };
    });
    
    if (!canvasInfo) {
      console.log('❌ 未找到Canvas元素!');
      return;
    }
    
    console.log(`✅ Canvas: ${canvasInfo.width}x${canvasInfo.height}`);
    
    // 辅助函数：将游戏坐标转换为浏览器坐标
    const gameToBrowser = (gameX, gameY) => ({
      x: canvasInfo.rectLeft + (gameX / canvasInfo.scaleX),
      y: canvasInfo.rectTop + (gameY / canvasInfo.scaleY)
    });
    
    let centerX = 187.5; // SCREEN_WIDTH / 2
    
    // ===== 测试1: 主菜单 - 开始游戏 =====
    console.log('\n📍 [2/10] 测试主菜单 - 点击"开始游戏"...');
    let pos = gameToBrowser(centerX, 402); // 开始游戏按钮
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/workspace/test-results/01-main-menu.png' });
    console.log('✅ 已保存: 01-main-menu.png');
    
    // ===== 测试2: 城镇界面 - 测试商店按钮 =====
    console.log('\n📍 [3/10] 测试城镇界面 - 点击"商店"...');
    pos = gameToBrowser(centerX, 342); // 商店按钮 (y=320 + 22)
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/workspace/test-results/02-shop.png' });
    console.log('✅ 已保存: 02-shop.png');
    
    // ===== 测试3: 商店界面 - 购买货物 =====
    console.log('\n📍 [4/10] 测试商店界面 - 尝试购买货物...');
    // 点击第一个买入按钮
    pos = gameToBrowser(280, 150);
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/workspace/test-results/03-shop-buy.png' });
    console.log('✅ 已保存: 03-shop-buy.png');
    
    // ===== 测试4: 返回城镇 =====
    console.log('\n📍 [5/10] 返回城镇...');
    pos = gameToBrowser(60, 651); // 返回按钮
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/workspace/test-results/04-back-to-town.png' });
    console.log('✅ 已保存: 04-back-to-town.png');
    
    // ===== 测试5: 背包功能 =====
    console.log('\n📍 [6/10] 测试背包功能...');
    pos = gameToBrowser(centerX, 398); // 背包按钮 (y=376 + 22)
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/workspace/test-results/05-inventory.png' });
    console.log('✅ 已保存: 05-inventory.png');
    
    // 返回
    pos = gameToBrowser(60, 651);
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(500);
    
    // ===== 测试6: 状态功能 =====
    console.log('\n📍 [7/10] 测试状态功能...');
    pos = gameToBrowser(centerX, 510); // 状态按钮 (y=488 + 22)
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/workspace/test-results/06-status.png' });
    console.log('✅ 已保存: 06-status.png');
    
    // 返回
    pos = gameToBrowser(60, 651);
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(500);
    
    // ===== 测试7: 保存游戏 =====
    console.log('\n📍 [8/10] 测试保存游戏...');
    pos = gameToBrowser(centerX, 566); // 保存游戏按钮 (y=544 + 22)
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/workspace/test-results/07-save-game.png' });
    console.log('✅ 已保存: 07-save-game.png');
    
    // ===== 测试8: 出发/旅行功能 =====
    console.log('\n📍 [9/10] 测试旅行功能...');
    pos = gameToBrowser(centerX, 454); // 出发按钮 (y=432 + 22)
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/workspace/test-results/08-travel-select.png' });
    console.log('✅ 已保存: 08-travel-select.png');
    
    // 点击"出发"前往碧水城
    pos = gameToBrowser(centerX + 50, 320); // 第一个目的地的出发按钮
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/workspace/test-results/09-traveling.png' });
    console.log('✅ 已保存: 09-traveling.png');
    
    // ===== 测试9: 继续等待旅行完成/遭遇战斗 =====
    console.log('\n📍 [10/10] 等待旅行事件...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/workspace/test-results/10-travel-result.png' });
    console.log('✅ 已保存: 10-travel-result.png');
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ 所有测试步骤完成!');
    console.log('📁 截图已保存到 /workspace/test-results/');
    console.log('\n请查看截图验证各功能是否正常。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testGame();
