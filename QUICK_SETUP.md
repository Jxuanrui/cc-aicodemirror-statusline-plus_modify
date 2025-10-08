# ⚡ 快速安装指南

Claude Code 状态栏插件 - 5 分钟完成安装配置

---

## 🚀 一键安装（推荐）

### 步骤 1：克隆项目

```bash
# 克隆到任意目录
git clone https://github.com/your-repo/cc-aicodemirror-statusline-plus.git
cd cc-aicodemirror-statusline-plus
```

### 步骤 2：运行安装向导

```bash
node setup.js
```

### 步骤 3：按照向导提示操作

安装向导会自动完成：
- ✅ 检查 Node.js 环境
- ✅ 创建必要的目录
- ✅ 复制插件文件到 `~/.claude/statusline/`
- ✅ 自动配置 `~/.claude/settings.json`
- ✅ 引导你获取并保存 Cookie
- ✅ 自动测试连接

### 步骤 4：获取 Cookie

当向导提示时，按照以下步骤获取 Cookie：

1. 打开浏览器访问 https://www.claudecode-cn.com/dashboard
2. 登录你的账号
3. 按 `F12` 打开开发者工具
4. 切换到 **Network** 标签
5. 刷新页面（`F5` 或 `Ctrl+R`）
6. 找到任意 `aicodemirror` 请求
7. 点击该请求，在右侧找到 **Request Headers**
8. 复制完整的 **Cookie** 值
9. 粘贴到终端并回车

### 步骤 5：重启 Claude Code

```bash
# 重启 Claude Code CLI
# 现在状态栏应该显示积分信息了！
```

---

## 📊 状态栏显示效果

安装成功后，状态栏会显示：

```
👑 12345(opus) | default | 💰/cost | main(2) | /path/to/project
```

**说明：**
- 👑 - 计划类型（ULTRA/MAX/PRO/FREE）
- 12345 - 当前积分余额
- (opus) - 使用的模型
- default - 输出风格
- 💰/cost - 输入此命令查看详细费用
- main(2) - Git 分支和修改文件数
- /path/to/project - 当前工作目录

---

## 🔧 手动安装（高级用户）

如果你想手动控制每一步，请参考 [README.md](./README.md) 中的详细安装步骤。

---

## 🔄 更新 Cookie

当 Cookie 过期时，运行：

```bash
node ~/.claude/statusline/save-cookie.js "你的新Cookie"
```

---

## ❓ 故障排除

### 状态栏不显示积分

1. 确认 `ANTHROPIC_BASE_URL` 包含 `claudecode-cn.com`
2. 检查 Cookie 是否有效（重新获取）
3. 运行测试：`node ~/.claude/statusline/credit-status.js`

### Cookie 无效

1. 确保已登录 claudecode-cn.com
2. Cookie 中必须包含 `__Secure-authjs.session-token`
3. 重新获取 Cookie 并配置

### 显示"🍪 需要Cookie"

说明 Cookie 未配置或已失效，请重新获取并配置。

---

## 📚 更多信息

- 完整文档：[README.md](./README.md)
- 问题反馈：https://github.com/your-repo/issues

---

## ✨ 功能特性

- 💎 实时显示积分余额和计划类型
- 🤖 显示当前 Claude 模型版本
- 🎨 显示输出风格配置
- 🌿 Git 分支和文件修改状态
- 💰 快速查看费用（/cost 命令）
- ⚡ 30秒智能缓存，避免频繁 API 调用
- 🔄 会话结束自动刷新积分
- 🎯 积分不足自动触发重置（可配置）

---

## 🎨 自定义配置

编辑 `~/.claude/statusline/aicodemirror-config.json`：

```json
{
  "cookies": "你的Cookie",
  "creditThreshold": 1000,      // 积分重置阈值
  "autoResetEnabled": true      // 是否启用自动重置
}
```

---

**开始使用吧！** 🚀
