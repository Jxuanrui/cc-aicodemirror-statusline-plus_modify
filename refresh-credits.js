#!/usr/bin/env node
/**
 * 积分刷新脚本 - 用于 Stop Hook
 * 强制刷新积分缓存，不显示输出（避免干扰状态栏）
 * 版本: v3.0 (重构版)
 */

const { loadConfig, saveConfig, getCredits, checkAndTriggerReset, isUsingClaudeCodeCN } = require('./lib/utils');

/**
 * 刷新积分缓存
 * @returns {Promise<boolean>} 是否成功
 */
async function refreshCreditsCache() {
  try {
    // 检查是否使用 claudecode-cn
    if (!isUsingClaudeCodeCN()) {
      return true; // 不是 claudecode-cn，不需要刷新
    }

    const config = loadConfig();
    const cookies = config.cookies;

    if (!cookies) {
      return false;
    }

    // 强制刷新积分（不使用缓存）
    const creditsData = await getCredits(cookies, false);

    if (!creditsData) {
      return false;
    }

    // 更新缓存
    config.credits_cache = {
      data: creditsData,
      timestamp: Date.now() / 1000
    };

    // 检查是否需要自动重置积分
    await checkAndTriggerReset(config, creditsData);

    // 保存配置
    saveConfig(config);

    return true;
  } catch (error) {
    // 静默处理错误
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  // 静默执行，不输出任何内容
  await refreshCreditsCache();
}

if (require.main === module) {
  main();
}
