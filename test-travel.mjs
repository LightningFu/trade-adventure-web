import { chromium } from 'playwright';

async function testGame() {
  console.log('🎮 旅行和战斗功能深度测试\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 加载游戏
    console.log('📍 加载游戏...');
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
      console.log('❌ 未找到Canvas!');
      return;
    }
    
    const gameToBrowser = (gameX, gameY) => ({
      x: canvasInfo.rectLeft + (gameX / canvasInfo.scaleX),
      y: canvasInfo.rectTop + (gameY / canvasInfo.scaleY)
    });
    
    const centerX = 187.5;
    
    // 开始游戏
    console.log('📍 点击"开始游戏"...');
    await page.mouse.click(...Object.values(gameToBrowser(centerX, 402)));
    await page.waitForTimeout(1500);
    
    // 打开旅行界面
    console.log('📍 打开旅行选择...');
    await page.mouse.click(...Object.values(gameToBrowser(centerX, 454)));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/workspace/test-results/travel-01-select.png' });
    console.log('✅ 已保存: travel-01-select.png');
    
    // 点击碧水城的"出发"按钮
    // 面板 x=20, width=335, 出发按钮在 contentArea.x + contentArea.width - 70
    // 按钮大约在 x=285, y≈138
    console.log('📍 点击"碧水城 - 出发"...');
    await page.mouse.click(...Object.values(gameToBrowser(285, 138)));
    await page.waitForTimeout(500);
    
    // 等待旅行动画
    console.log('📍 等待旅行动画...');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '/workspace/test-results/travel-02-animating.png' });
    console.log('✅ 已保存: travel-02-animating.png');
    
    // 继续等待，看是否触发战斗
    console.log('📍 等待事件触发...');
    await page.waitForTimeout(6000);
    await page.screenshot({ path: '/workspace/test-results/travel-03-event.png' });
    console.log('✅ 已保存: travel-03-event.png');
    
    // 检查页面内容
    const pageText = await page.evaluate(() => document.body.innerText);
    if (pageText.includes('战斗') || pageText.includes('遭遇')) {
      console.log('✅ 检测到战斗界面!');
    }
    
    // 继续等待更多时间
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/workspace/test-results/travel-04-result.png' });
    console.log('✅ 已保存: travel-04-result.png');
    
    console.log('\n✅ 旅行测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testGame();
