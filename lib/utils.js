/**
 * 共享工具函数库
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./config');

/**
 * 配置文件路径
 */
const CONFIG_FILE = path.join(__dirname, '..', 'aicodemirror-config.json');

/**
 * 读取配置文件
 * @returns {Object} 配置对象
 */
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return {};
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[ERROR] 读取配置失败: ${error.message}`);
    return {};
  }
}

/**
 * 保存配置文件
 * @param {Object} configData 配置对象
 * @returns {boolean} 是否成功
 */
function saveConfig(configData) {
  try {
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
    return true;
  } catch (error) {
    console.error(`[ERROR] 保存配置失败: ${error.message}`);
    return false;
  }
}

/**
 * 通用 HTTPS GET 请求
 * @param {Object} options 请求选项
 * @returns {Promise<{statusCode: number, data: any}>}
 */
async function httpsGet(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = res.statusCode === 200 ? JSON.parse(data) : null;
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`JSON 解析失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

/**
 * 通用 HTTPS POST 请求
 * @param {Object} options 请求选项
 * @returns {Promise<{statusCode: number, data: any}>}
 */
async function httpsPost(options) {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, method: 'POST' }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          // POST 可能没有响应体
          resolve({ statusCode: res.statusCode, data: null });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

/**
 * 获取积分信息
 * @param {string} cookies Cookie字符串
 * @param {boolean} useCache 是否使用缓存
 * @returns {Promise<Object|null>} 积分数据
 */
async function getCredits(cookies, useCache = true) {
  if (!cookies) {
    return null;
  }

  // 检查缓存
  if (useCache) {
    const configData = loadConfig();
    const cacheKey = 'credits_cache';
    const currentTime = Date.now() / 1000;

    if (configData[cacheKey]) {
      const cacheData = configData[cacheKey];
      if (currentTime - (cacheData.timestamp || 0) < config.CACHE_DURATION) {
        return cacheData.data;
      }
    }
  }

  // 调用 API
  try {
    const options = {
      hostname: config.API_DOMAIN,
      path: config.API_PATH_CREDITS,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookies,
        'User-Agent': config.USER_AGENT
      },
      timeout: config.TIMEOUT_API
    };

    const { statusCode, data } = await httpsGet(options);

    if (statusCode === 200 && data) {
      // 保存到缓存
      const configData = loadConfig();
      configData.credits_cache = {
        data: data,
        timestamp: Date.now() / 1000
      };
      saveConfig(configData);

      return data;
    }

    return null;
  } catch (error) {
    console.error(`[ERROR] 获取积分失败: ${error.message}`);
    return null;
  }
}

/**
 * 触发积分重置
 * @param {string} cookies Cookie字符串
 * @returns {Promise<boolean>} 是否成功
 */
async function triggerCreditReset(cookies) {
  if (!cookies) {
    return false;
  }

  try {
    const options = {
      hostname: config.API_DOMAIN,
      path: config.API_PATH_RESET,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookies,
        'User-Agent': config.USER_AGENT,
        'priority': 'u=1, i'
      },
      timeout: config.TIMEOUT_RESET
    };

    const { statusCode } = await httpsPost(options);
    return statusCode === 200;
  } catch (error) {
    console.error(`[ERROR] 积分重置失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查是否需要触发积分重置
 * @param {Object} configData 配置对象
 * @param {Object} creditsData 积分数据
 */
async function checkAndTriggerReset(configData, creditsData) {
  // 初始化默认配置
  if (!configData.creditThreshold) {
    configData.creditThreshold = config.DEFAULT_CREDIT_THRESHOLD;
  }
  if (!configData.hasOwnProperty('autoResetEnabled')) {
    configData.autoResetEnabled = config.DEFAULT_AUTO_RESET_ENABLED;
  }

  // 检查是否启用自动重置
  if (!configData.autoResetEnabled) {
    return;
  }

  // 检查积分是否低于阈值
  const currentCredits = creditsData.credits || 0;
  if (currentCredits >= configData.creditThreshold) {
    return;
  }

  // 触发积分重置
  await triggerCreditReset(configData.cookies);
}

/**
 * 检查是否使用 claudecode-cn
 * @returns {boolean}
 */
function isUsingClaudeCodeCN() {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
  return baseUrl.includes(config.DOMAIN_CHECK);
}

module.exports = {
  CONFIG_FILE,
  loadConfig,
  saveConfig,
  httpsGet,
  httpsPost,
  getCredits,
  triggerCreditReset,
  checkAndTriggerReset,
  isUsingClaudeCodeCN
};
