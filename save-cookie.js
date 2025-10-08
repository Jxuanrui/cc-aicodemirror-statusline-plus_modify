#!/usr/bin/env node
/**
 * Cookie 保存工具
 * 版本: v3.0 (重构版)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { loadConfig, saveConfig } = require('./lib/utils');

/**
 * 打印使用说明
 */
function printUsage() {
  console.log("使用方法: node save-cookie.js '你的Cookie字符串'");
  console.log();
  console.log("📝 步骤：");
  console.log("1. 浏览器登录 https://www.claudecode-cn.com/dashboard");
  console.log("2. F12 -> Network -> 刷新页面 -> 找到 /api/user/credits");
  console.log("3. 复制Cookie值");
  console.log("4. node save-cookie.js 'Cookie内容'");
}

/**
 * 测试 Cookie 有效性
 * @param {string} scriptPath 测试脚本路径
 * @returns {Promise<void>}
 */
function testCookie(scriptPath) {
  return new Promise((resolve) => {
    const testProcess = spawn('node', [scriptPath], {
      stdio: 'pipe',
      timeout: 10000
    });

    let output = '';
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    testProcess.on('close', (code) => {
      const result = output.trim();
      console.log(`测试结果: ${result}`);

      if (result.includes('🍪')) {
        console.log("❌ Cookie无效，请重新获取");
      } else if (['👑', '⭐', '💎', '🆓'].some(emoji => result.includes(emoji))) {
        console.log("✅ 测试成功！");
        console.log("🎉 现在重启Claude Code即可看到状态栏积分显示");
      } else {
        console.log("⚠️ 输出异常，但Cookie已保存");
      }

      resolve();
    });

    testProcess.on('error', (error) => {
      console.log(`⚠️ 测试执行失败: ${error.message}`);
      console.log("但Cookie已成功保存");
      resolve();
    });
  });
}

/**
 * 保存 Cookie
 * @returns {Promise<boolean>}
 */
async function saveCookie() {
  if (process.argv.length !== 3) {
    printUsage();
    return false;
  }

  const cookie = process.argv[2].trim();

  if (!cookie) {
    console.log("❌ Cookie不能为空");
    return false;
  }

  try {
    // 读取现有配置
    const config = loadConfig();

    // 更新 Cookie
    config.cookies = cookie;

    // 保存配置
    const configFile = path.join(__dirname, 'aicodemirror-config.json');
    saveConfig(config);

    console.log(`✅ Cookie已保存到: ${configFile}`);
    console.log(`📏 Cookie长度: ${cookie.length} 字符`);

    // 测试 Cookie
    console.log("\n🧪 正在测试...");

    const scriptPath = path.join(__dirname, 'credit-status.js');
    if (fs.existsSync(scriptPath)) {
      await testCookie(scriptPath);
    } else {
      console.log("⚠️ 测试脚本不存在，跳过测试");
    }

    return true;
  } catch (error) {
    console.log(`❌ 保存失败: ${error.message}`);
    return false;
  }
}

if (require.main === module) {
  saveCookie();
}
