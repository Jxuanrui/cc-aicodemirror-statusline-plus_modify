# 🔒 安全指南

## ⚠️ 重要安全提示

### Cookie 安全

**Cookie 包含你的认证信息，泄露后他人可以冒用你的账号！**

#### ❌ 绝对不要做的事情：

1. **不要** 将 `aicodemirror-config.json` 提交到 Git 仓库
2. **不要** 在公开场合分享你的 Cookie
3. **不要** 在截图中暴露 Cookie 内容
4. **不要** 将配置文件发送给他人
5. **不要** 在日志或调试输出中打印 Cookie

#### ✅ 应该做的事情：

1. **定期更新** Cookie（建议每隔一段时间重新获取）
2. **及时删除** 不再使用的 Cookie
3. **使用** `aicodemirror-config.example.json` 作为模板
4. **检查** `.gitignore` 确保敏感文件被忽略
5. **使用** 环境变量（如果需要自动化部署）

---

## 🛡️ 配置文件保护

### 文件权限

确保配置文件只有你能访问：

```bash
# Linux/macOS
chmod 600 ~/.claude/statusline/aicodemirror-config.json

# Windows
icacls %USERPROFILE%\.claude\statusline\aicodemirror-config.json /inheritance:r /grant:r "%USERNAME%:F"
```

### Git 保护

确认 `.gitignore` 正确配置：

```bash
# 检查 .gitignore
cat .gitignore | grep aicodemirror-config.json

# 应该输出：
# aicodemirror-config.json
```

验证配置文件未被跟踪：

```bash
# 运行此命令
git status

# aicodemirror-config.json 不应该出现在输出中
```

---

## 🔐 Cookie 管理

### 获取新 Cookie

1. 浏览器访问 https://www.claudecode-cn.com/dashboard
2. 登录你的账号
3. 按 `F12` 打开开发者工具
4. 切换到 **Network** 标签
5. 刷新页面
6. 找到任意请求，复制 **Cookie** 值
7. 使用 `save-cookie.js` 保存

### Cookie 过期

Cookie 会定期过期，当状态栏显示 "🍪 需要Cookie" 时：

```bash
node ~/.claude/statusline/save-cookie.js "新的Cookie"
```

### Cookie 泄露怎么办

如果怀疑 Cookie 泄露：

1. **立即** 前往 https://www.claudecode-cn.com
2. **登出** 当前会话
3. **重新登录** （这会使旧 Cookie 失效）
4. **获取新 Cookie** 并更新配置

---

## 📋 安全检查清单

在提交代码或分享项目前，请确认：

- [ ] `aicodemirror-config.json` 已添加到 `.gitignore`
- [ ] `aicodemirror-config.json` 不包含真实 Cookie
- [ ] 所有文档中的示例数据已脱敏
- [ ] 运行 `git status` 确认没有敏感文件被跟踪
- [ ] 检查 `git log` 确认历史提交中没有敏感信息

---

## 🚨 紧急情况

### 如果意外提交了敏感信息

1. **不要 panic！** 但需要立即行动
2. **重写 Git 历史** 删除敏感提交：
   ```bash
   # 警告：这会改写历史，谨慎操作
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch aicodemirror-config.json" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **强制推送** （如果已推送到远程）：
   ```bash
   git push origin --force --all
   ```
4. **立即更换 Cookie**（按照上述 "Cookie 泄露" 流程）

### 使用 BFG Repo-Cleaner（推荐）

```bash
# 下载 BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# 清理敏感文件
bfg --delete-files aicodemirror-config.json

# 清理历史
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 📞 报告安全问题

如果你发现本项目的安全漏洞，请：

1. **不要** 公开披露
2. **发送邮件** 到维护者（私密通知）
3. 提供详细的漏洞描述和复现步骤

我们会尽快响应并修复问题。

---

## 🔗 相关资源

- [GitHub 安全最佳实践](https://docs.github.com/en/code-security)
- [OWASP 安全指南](https://owasp.org/)
- [Claude Code 官方文档](https://docs.claude.com/claude-code)

---

**记住：安全永远是第一位！** 🔒
