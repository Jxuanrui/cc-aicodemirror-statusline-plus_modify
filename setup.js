#!/usr/bin/env node
/**
 * Claude Code 状态栏插件 - 一键安装配置脚本
 * 版本: v1.0
 *
 * 使用方法：
 *   node setup.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const readline = require('readline');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 打印带颜色的消息
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 打印标题
function printTitle() {
  log('\n' + '='.repeat(60), 'cyan');
  log('    Claude Code 状态栏插件 - 一键安装向导', 'bright');
  log('='.repeat(60) + '\n', 'cyan');
}

// 打印步骤
function printStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, 'blue');
}

// 检查 Node.js 版本
function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);

  if (majorVersion < 14) {
    log(`❌ Node.js 版本过低 (当前: ${version})`, 'red');
    log('   需要 Node.js 14.0 或更高版本', 'yellow');
    return false;
  }

  log(`✅ Node.js 版本: ${version}`, 'green');
  return true;
}

// 获取 Claude 配置目录
function getClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

// 获取目标安装目录
function getInstallDir() {
  return path.join(getClaudeDir(), 'statusline');
}

// 检查并创建目录
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✅ 创建目录: ${dir}`, 'green');
  } else {
    log(`✅ 目录已存在: ${dir}`, 'green');
  }
}

// 复制文件
function copyFiles() {
  const installDir = getInstallDir();
  const sourceDir = __dirname;

  const filesToCopy = [
    'credit-status.js',
    'refresh-credits.js',
    'save-cookie.js',
    'aicodemirror-config.json'
  ];

  const dirsToCopy = ['lib'];

  log('正在复制文件...', 'cyan');

  // 复制文件
  filesToCopy.forEach(file => {
    const source = path.join(sourceDir, file);
    const dest = path.join(installDir, file);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
      log(`  ✓ ${file}`, 'green');
    }
  });

  // 复制目录
  dirsToCopy.forEach(dir => {
    const source = path.join(sourceDir, dir);
    const dest = path.join(installDir, dir);

    if (fs.existsSync(source)) {
      copyDirRecursive(source, dest);
      log(`  ✓ ${dir}/`, 'green');
    }
  });
}

// 递归复制目录
function copyDirRecursive(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// 配置 settings.json
function configureSettings() {
  const settingsPath = path.join(getClaudeDir(), 'settings.json');
  const installDir = getInstallDir();

  let settings = {};

  // 读取现有配置
  if (fs.existsSync(settingsPath)) {
    log('检测到现有配置文件，正在备份...', 'yellow');
    const backupPath = settingsPath + '.backup.' + Date.now();
    fs.copyFileSync(settingsPath, backupPath);
    log(`✅ 备份保存至: ${backupPath}`, 'green');

    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }

  // 生成配置
  const isWindows = os.platform() === 'win32';
  const statusLineScript = path.join(installDir, 'credit-status.js');
  const refreshScript = path.join(installDir, 'refresh-credits.js');

  // 配置状态栏
  settings.statusLine = {
    type: 'command',
    command: isWindows
      ? `node "${statusLineScript}"`
      : `node ${statusLineScript}`,
    padding: 0
  };

  // 配置 Hook
  if (!settings.hooks) {
    settings.hooks = {};
  }

  settings.hooks.Stop = [{
    hooks: [{
      type: 'command',
      command: isWindows
        ? `node "${refreshScript}"`
        : `node ${refreshScript}`
    }]
  }];

  // 保存配置
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  log('✅ settings.json 配置完成', 'green');
}

// 获取 Cookie 向导
async function getCookieWizard() {
  log('\n' + '-'.repeat(60), 'cyan');
  log('📝 Cookie 获取步骤：', 'bright');
  log('-'.repeat(60), 'cyan');
  log('1. 打开浏览器，访问 https://www.claudecode-cn.com/dashboard');
  log('2. 登录你的账号');
  log('3. 按 F12 打开开发者工具');
  log('4. 切换到 Network 标签页');
  log('5. 刷新页面 (F5 或 Ctrl+R)');
  log('6. 找到任意 aicodemirror 请求');
  log('7. 点击该请求，在右侧找到 Request Headers');
  log('8. 复制完整的 Cookie 值');
  log('-'.repeat(60) + '\n', 'cyan');

  const cookie = await prompt('请粘贴你的 Cookie（回车继续）: ');

  if (!cookie) {
    log('❌ Cookie 不能为空', 'red');
    return null;
  }

  log(`✅ Cookie 长度: ${cookie.length} 字符`, 'green');
  return cookie;
}

// 保存 Cookie 到配置
function saveCookie(cookie) {
  const configPath = path.join(getInstallDir(), 'aicodemirror-config.json');

  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  config.cookies = cookie;

  // 设置默认值
  if (!config.creditThreshold) {
    config.creditThreshold = 1000;
  }
  if (!config.hasOwnProperty('autoResetEnabled')) {
    config.autoResetEnabled = true;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log('✅ Cookie 保存成功', 'green');
}

// 测试配置
function testConfiguration() {
  return new Promise((resolve) => {
    log('\n正在测试配置...', 'cyan');

    const scriptPath = path.join(getInstallDir(), 'credit-status.js');

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

      log('\n测试结果:', 'blue');
      console.log(result);

      if (result.includes('🍪')) {
        log('\n⚠️ Cookie 可能无效，请重新获取', 'yellow');
        resolve(false);
      } else if (['👑', '⭐', '💎', '🆓'].some(emoji => result.includes(emoji))) {
        log('\n✅ 测试成功！配置完成', 'green');
        resolve(true);
      } else {
        log('\n⚠️ 输出异常，但配置已保存', 'yellow');
        resolve(true);
      }
    });

    testProcess.on('error', (error) => {
      log(`\n❌ 测试失败: ${error.message}`, 'red');
      resolve(false);
    });
  });
}

// 打印完成信息
function printCompletion(success) {
  log('\n' + '='.repeat(60), 'cyan');

  if (success) {
    log('🎉 安装配置完成！', 'green');
    log('='.repeat(60) + '\n', 'cyan');
    log('📌 后续步骤:', 'bright');
    log('  1. 重启 Claude Code CLI');
    log('  2. 查看状态栏，应该能看到积分信息');
    log('  3. 使用 /cost 命令查看详细费用\n');
    log('💡 提示:', 'blue');
    log('  - 配置文件位置: ' + path.join(getClaudeDir(), 'settings.json'));
    log('  - 插件安装位置: ' + getInstallDir());
    log('  - Cookie 管理: node ' + path.join(getInstallDir(), 'save-cookie.js') + ' "新Cookie"\n');
  } else {
    log('⚠️ 安装完成但测试未通过', 'yellow');
    log('='.repeat(60) + '\n', 'cyan');
    log('请检查:', 'yellow');
    log('  1. Cookie 是否正确');
    log('  2. 网络连接是否正常');
    log('  3. claudecode-cn.com 是否可访问\n');
    log('重新配置 Cookie:', 'blue');
    log('  node ' + path.join(getInstallDir(), 'save-cookie.js') + ' "新Cookie"\n');
  }

  log('如有问题，请访问: https://github.com/your-repo/issues\n', 'cyan');
}

// 主函数
async function main() {
  try {
    printTitle();

    // 步骤 1: 检查环境
    printStep(1, 5, '检查运行环境');
    if (!checkNodeVersion()) {
      process.exit(1);
    }

    // 步骤 2: 创建目录
    printStep(2, 5, '创建安装目录');
    const installDir = getInstallDir();
    ensureDir(getClaudeDir());
    ensureDir(installDir);

    // 步骤 3: 复制文件
    printStep(3, 5, '复制插件文件');
    copyFiles();
    log('✅ 所有文件已复制', 'green');

    // 步骤 4: 配置 settings.json
    printStep(4, 5, '配置 Claude Code settings.json');
    configureSettings();

    // 步骤 5: 配置 Cookie
    printStep(5, 5, '配置 Cookie');
    const cookie = await getCookieWizard();

    if (cookie) {
      saveCookie(cookie);

      // 测试配置
      const success = await testConfiguration();

      // 打印完成信息
      printCompletion(success);
    } else {
      log('\n❌ 安装中止：Cookie 配置失败', 'red');
      log('提示：你可以稍后运行以下命令配置 Cookie:', 'yellow');
      log(`  node ${path.join(installDir, 'save-cookie.js')} "你的Cookie"\n`, 'cyan');
    }

  } catch (error) {
    log(`\n❌ 安装失败: ${error.message}`, 'red');
    console.error(error);
  } finally {
    rl.close();
  }
}

// 运行
if (require.main === module) {
  main();
}
