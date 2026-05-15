import { chromium } from 'playwright';

async function testGame() {
  console.log('🎮 开始游戏自动化测试...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📍 步骤1: 加载游戏页面...');
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
        rectWidth: rect.width,
        rectHeight: rect.height,
        scaleX: canvas.width / rect.width,
        scaleY: canvas.height / rect.height
      };
    });
    
    if (!canvasInfo) {
      console.log('❌ 未找到Canvas元素!');
      return;
    }
    
    console.log(`✅ Canvas信息: ${canvasInfo.width}x${canvasInfo.height}`);
    console.log(`   显示尺寸: ${canvasInfo.rectWidth.toFixed(0)}x${canvasInfo.rectHeight.toFixed(0)}`);
    console.log(`   缩放比例: ${canvasInfo.scaleX.toFixed(2)}x, ${canvasInfo.scaleY.toFixed(2)}y`);
    
    // 点击"开始游戏"按钮 - 游戏坐标 (187.5, 402) -> 浏览器坐标
    const gameX = 187.5;
    const gameY = 402;
    const browserX = canvasInfo.rectLeft + (gameX / canvasInfo.scaleX);
    const browserY = canvasInfo.rectTop + (gameY / canvasInfo.scaleY);
    
    console.log(`\n📍 步骤2: 点击"开始游戏"按钮...`);
    console.log(`   游戏坐标: (${gameX}, ${gameY})`);
    console.log(`   浏览器坐标: (${browserX.toFixed(1)}, ${browserY.toFixed(1)})`);
    
    await page.mouse.click(browserX, browserY);
    await page.waitForTimeout(2000);
    
    // 截图保存
    await page.screenshot({ path: '/workspace/test-results/step1-main-menu.png' });
    console.log('   📸 已保存: step1-main-menu.png');
    
    // 检查游戏状态
    const gameState = await page.evaluate(() => {
      // 尝试从游戏对象获取状态
      if (typeof window.gameInstance !== 'undefined') {
        return window.gameInstance.getGameState?.();
      }
      return 'unknown';
    });
    console.log(`   游戏状态: ${gameState}`);
    
    // 点击"继续游戏"按钮 - 坐标 (187.5, 452)
    const gameY2 = 452;
    const browserY2 = canvasInfo.rectTop + (gameY2 / canvasInfo.scaleY);
    
    console.log(`\n📍 步骤3: 点击"继续游戏"按钮...`);
    await page.mouse.click(browserX, browserY2);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/workspace/test-results/step2-after-continue.png' });
    console.log('   📸 已保存: step2-after-continue.png');
    
    // 测试城镇界面 - 点击"商店"按钮 (187.5, 150)
    console.log(`\n📍 步骤4: 测试城镇界面 - 点击"商店"按钮...`);
    const shopY = 150;
    const browserShopY = canvasInfo.rectTop + (shopY / canvasInfo.scaleY);
    await page.mouse.click(browserX, browserShopY);
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/workspace/test-results/step3-shop.png' });
    console.log('   📸 已保存: step3-shop.png');
    
    // 点击返回
    console.log(`\n📍 步骤5: 返回城镇...`);
    const backX = canvasInfo.rectLeft + (20 / canvasInfo.scaleX);
    const backY = canvasInfo.rectTop + ((667 - 32) / canvasInfo.scaleY);
    await page.mouse.click(backX, backY);
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/workspace/test-results/step4-back.png' });
    console.log('   📸 已保存: step4-back.png');
    
    // 测试"出发"按钮
    console.log(`\n📍 步骤6: 测试旅行功能 - 点击"出发"按钮...`);
    const travelY = 198;
    const browserTravelY = canvasInfo.rectTop + (travelY / canvasInfo.scaleY);
    await page.mouse.click(browserX, browserTravelY);
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/workspace/test-results/step5-travel.png' });
    console.log('   📸 已保存: step5-travel.png');
    
    console.log('\n✅ 自动化测试完成!');
    console.log('📁 所有截图已保存到 /workspace/test-results/');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testGame();
