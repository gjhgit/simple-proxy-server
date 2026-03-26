# 部署指南

## 📋 一键命令清单

### 1. 推送到GitHub

```bash
# 在GitHub网页创建仓库后，运行以下命令：

git remote add origin https://github.com/gjhgit/simple-proxy-server.git
git branch -M main
git push -u origin main
```

### 2. Railway部署

#### 方式A：通过Railway CLI（推荐）

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录Railway（会打开浏览器授权）
railway login

# 关联项目
cd /path/to/simple-proxy-server
railway link

# 部署
railway up

# 获取域名
railway domain
```

#### 方式B：通过GitHub自动部署

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `simple-proxy-server` 仓库
5. Railway会自动检测 `railway.json` 配置并部署

---

## 🔧 详细步骤

### 第一步：创建GitHub仓库

1. 访问 https://github.com/new
2. 填写信息：
   - **Repository name**: `simple-proxy-server`
   - **Description**: 简单的HTTP/HTTPS代理服务器
   - **Visibility**: Public
   - ✅ 勾选 "Add a README file"（可选）
3. 点击 "Create repository"

### 第二步：推送本地代码

```bash
cd c:/Users/Administrator/WorkBuddy/20260326185351

# 添加远程仓库
git remote add origin https://github.com/gjhgit/simple-proxy-server.git

# 重命名分支为main
git branch -M main

# 推送代码
git push -u origin main
```

### 第三步：部署到Railway

#### 方法1：GitHub集成（最简单）

1. 登录 https://railway.app（使用GitHub账号）
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择 `gjhgit/simple-proxy-server`
4. Railway会自动：
   - 读取 `railway.json` 配置
   - 构建Docker镜像
   - 部署服务
   - 分配域名

#### 方法2：Railway CLI

```bash
# 安装CLI
npm install -g @railway/cli

# 登录
railway login

# 进入项目目录
cd c:/Users/Administrator/WorkBuddy/20260326185351

# 创建新项目
railway init

# 部署
railway up

# 查看部署状态
railway status

# 获取域名
railway domain
```

---

## 🌐 部署后使用

部署成功后，Railway会分配一个域名，例如：
```
https://simple-proxy-server-production.up.railway.app
```

### 使用代理

```bash
# GET请求
curl "https://simple-proxy-server-production.up.railway.app/?target=https://api.github.com/users/github"

# POST请求
curl -X POST "https://simple-proxy-server-production.up.railway.app/?target=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 🔒 环境变量配置

在Railway Dashboard中可以设置环境变量：

| 变量名 | 说明 | 建议值 |
|--------|------|--------|
| `PORT` | 监听端口 | `3000` |
| `ALLOWED_ORIGINS` | 允许的跨域来源 | 你的前端域名 |

---

## 📝 常用命令速查

```bash
# Git操作
git add .
git commit -m "更新说明"
git push origin main

# Railway CLI
railway login          # 登录
railway link           # 关联项目
railway up             # 部署
railway logs           # 查看日志
railway status         # 查看状态
railway domain         # 获取域名
railway variables      # 管理环境变量
railway disconnect     # 断开项目关联
```

---

## ❓ 常见问题

### Q1: 推送代码时提示权限不足？
**A**: 需要配置GitHub认证：
```bash
# 使用HTTPS + Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/gjhgit/simple-proxy-server.git
```

### Q2: Railway部署失败？
**A**: 检查以下几点：
1. Dockerfile是否正确
2. `railway.json` 配置是否有效
3. 查看Railway Dashboard中的构建日志

### Q3: 如何更新部署？
**A**: 只需推送代码到GitHub，Railway会自动重新部署：
```bash
git add .
git commit -m "更新内容"
git push origin main
```

---

## 📞 获取帮助

- **Railway文档**: https://docs.railway.app
- **GitHub文档**: https://docs.github.com
- **项目Issues**: https://github.com/gjhgit/simple-proxy-server/issues
