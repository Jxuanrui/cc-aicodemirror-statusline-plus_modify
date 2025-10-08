#!/usr/bin/env node
/**
 * Claude Code 积分状态栏脚本
 * 用途: 在状态栏显示 claudecode-cn.com 的积分余额
 * 版本: v3.0 (重构版)
 */

const { loadConfig, getCredits, isUsingClaudeCodeCN } = require('./lib/utils');
const { formatDisplay, getDisplayUrl, getCurrentModel } = require('./lib/display');

/**
 * 获取有效的 session
 * @returns {Object|null}
 */
function getValidSession() {
  const config = loadConfig();

  if (config.cookies) {
    return { cookies: config.cookies };
  }

  return null;
}

/**
 * 主函数
 */
async function main() {
  try {
    // 检查是否使用 claudecode-cn
    if (!isUsingClaudeCodeCN()) {
      const currentUrl = getDisplayUrl();
      const currentModel = getCurrentModel();
      console.log(`${currentModel} | ${currentUrl}`);
      return;
    }

    // 获取有效 session 和积分数据
    const session = getValidSession();
    let creditsData = null;

    if (session) {
      creditsData = await getCredits(session.cookies);
    }

    // 格式化并输出状态
    const statusText = formatDisplay(creditsData);
    console.log(statusText);

  } catch (error) {
    // 即使出错也显示基本信息
    const currentUrl = getDisplayUrl();
    const currentModel = getCurrentModel();
    console.log(`🔴 错误 | ${currentModel} | ${currentUrl}`);
  }
}

if (require.main === module) {
  main();
}
