/**
 * 配置常量
 */

module.exports = {
  // API 配置
  API_DOMAIN: 'www.claudecode-cn.com',
  API_PATH_CREDITS: '/api/user/credits',
  API_PATH_RESET: '/api/user/credit-reset',
  DOMAIN_CHECK: 'claudecode-cn.com',

  // 缓存配置
  CACHE_DURATION: 30, // 秒

  // 超时配置
  TIMEOUT_API: 3000,       // API 请求超时
  TIMEOUT_GIT: 2000,       // Git 命令超时
  TIMEOUT_RESET: 5000,     // 积分重置超时

  // 积分重置配置
  DEFAULT_CREDIT_THRESHOLD: 1000,
  DEFAULT_AUTO_RESET_ENABLED: true,

  // 状态栏配置
  SHOW_COST_HINT: true,          // 是否显示 /cost 命令提示

  // 用户代理
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',

  // 计划图标映射
  PLAN_ICONS: {
    'ULTRA': '👑',
    'MAX': '💎',
    'PRO': '⭐',
    'FREE': '🆓'
  },

  // ANSI 颜色
  ANSI_COLORS: {
    PURPLE: '\x1b[35m',  // 紫色，更易读
    RESET: '\x1b[0m'
  }
};
