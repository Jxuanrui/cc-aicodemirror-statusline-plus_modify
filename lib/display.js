/**
 * 显示格式化工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const config = require('./config');

/**
 * 获取当前显示的 URL
 * @returns {string}
 */
function getDisplayUrl() {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
  if (baseUrl) {
    if (baseUrl.includes('claudecode-cn.com')) {
      return 'claudecode-cn.com';
    } else {
      const match = baseUrl.match(/https?:\/\/([^\/]+)/);
      if (match) {
        return match[1];
      }
    }
  }
  return 'anthropic.com';
}

/**
 * 获取当前模型
 * @returns {string}
 */
function getCurrentModel() {
  // 优先使用环境变量
  let model = process.env.ANTHROPIC_MODEL || '';

  // 如果环境变量没有，检查 settings.json
  if (!model) {
    try {
      const settingsFile = path.join(os.homedir(), '.claude', 'settings.json');
      if (fs.existsSync(settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        model = settings.model || '';
      }
    } catch (error) {
      // 忽略错误
    }
  }

  if (model) {
    // 简化模型名称
    if (model.toLowerCase().includes('claude-3')) {
      if (model.toLowerCase().includes('haiku')) {
        return 'Claude 3 Haiku';
      } else if (model.toLowerCase().includes('sonnet')) {
        return 'Claude 3 Sonnet';
      } else if (model.toLowerCase().includes('opus')) {
        return 'Claude 3 Opus';
      }
    } else if (model.toLowerCase().includes('claude-4') || model.toLowerCase().includes('sonnet-4')) {
      return 'Claude 4 Sonnet';
    } else if (model.toLowerCase().includes('opus-4')) {
      return 'Claude 4 Opus';
    } else if (model.length > 20) {
      return model.substring(0, 20) + '...';
    }
    return model;
  }

  // 根据当前环境推断默认模型
  const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
  if (baseUrl.includes('claudecode-cn.com')) {
    return 'Claude 4 Sonnet';
  }
  return 'Claude (Auto)';
}

/**
 * 获取当前输出风格
 * @returns {string}
 */
function getCurrentOutputStyle() {
  try {
    // 优先检查环境变量
    if (process.env.CLAUDE_OUTPUT_STYLE) {
      return process.env.CLAUDE_OUTPUT_STYLE;
    }

    // 检查多个可能的配置文件位置 (按优先级排序)
    const configPaths = [
      path.join(process.cwd(), '.claude', 'settings.local.json'),
      path.join(os.homedir(), '.claude', 'settings.local.json'),
      path.join(process.cwd(), '.claude', 'settings.json'),
      path.join(os.homedir(), '.claude', 'settings.json')
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (settings.outputStyle) {
          return settings.outputStyle;
        }
      }
    }

    return 'default';
  } catch (error) {
    return 'default';
  }
}

/**
 * 获取当前 Git 分支
 * @returns {string|null}
 */
function getCurrentBranch() {
  try {
    const branch = execSync('git branch --show-current', {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: config.TIMEOUT_GIT
    }).trim();
    return branch || null;
  } catch (error) {
    return null;
  }
}

/**
 * 获取修改文件数量
 * @returns {number}
 */
function getModifiedFilesCount() {
  try {
    const statusOutput = execSync('git status --porcelain', {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: config.TIMEOUT_GIT
    }).trim();

    if (!statusOutput) {
      return 0;
    }

    const files = statusOutput.split('\n').filter(line => line.trim());
    return files.length;
  } catch (error) {
    return 0;
  }
}

/**
 * 获取当前工作区
 * @returns {string}
 */
function getCurrentWorkspace() {
  try {
    return process.cwd();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * 格式化积分显示
 * @param {number} credits 积分数
 * @returns {string}
 */
function formatCredits(credits) {
  return credits.toString();
}

/**
 * 获取计划图标
 * @param {string} plan 计划类型
 * @returns {string}
 */
function getPlanIcon(plan) {
  return config.PLAN_ICONS[plan] || '❓';
}

/**
 * 格式化状态栏显示
 * @param {Object|null} creditsData 积分数据
 * @returns {string}
 */
function formatDisplay(creditsData) {
  const currentBranch = getCurrentBranch();
  const modifiedFilesCount = getModifiedFilesCount();
  const currentWorkspace = getCurrentWorkspace();
  const currentOutputStyle = getCurrentOutputStyle();
  const currentModel = getCurrentModel();

  // ANSI 颜色代码：紫色
  const { PURPLE, RESET } = config.ANSI_COLORS;

  // 构建基础部分（风格、费用提示、分支和路径）
  const stylePart = ` | ${currentOutputStyle}`;
  const costHint = config.SHOW_COST_HINT ? ' | 💰/cost' : '';
  const branchPart = currentBranch ? ` | ${currentBranch}(${modifiedFilesCount})` : '';
  const workspacePart = ` | ${currentWorkspace}`;

  if (!creditsData) {
    return `${PURPLE}🍪 需要Cookie(${currentModel})${stylePart}${costHint}${branchPart}${workspacePart}${RESET}`;
  }

  try {
    const credits = creditsData.credits || 0;
    const plan = creditsData.plan || 'FREE';
    const creditsText = formatCredits(credits);
    const planIcon = getPlanIcon(plan);

    return `${PURPLE}${planIcon} ${creditsText}(${currentModel})${stylePart}${costHint}${branchPart}${workspacePart}${RESET}`;
  } catch (error) {
    return `${PURPLE}🔴 数据解析失败(${currentModel})${stylePart}${costHint}${branchPart}${workspacePart}${RESET}`;
  }
}

module.exports = {
  getDisplayUrl,
  getCurrentModel,
  getCurrentOutputStyle,
  getCurrentBranch,
  getModifiedFilesCount,
  getCurrentWorkspace,
  formatCredits,
  getPlanIcon,
  formatDisplay
};
