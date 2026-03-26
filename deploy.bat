@echo off
chcp 65001 >nul
echo ========================================
echo   简单代理服务器 - 一键部署脚本
echo ========================================
echo.

REM 检查Git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Git，请先安装Git
    echo 下载地址: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/4] 检查GitHub仓库...
echo.
echo 请确保已在GitHub创建仓库: https://github.com/new
echo 仓库名称: simple-proxy-server
echo.
pause

echo.
echo [2/4] 配置GitHub认证...
echo.
echo 如果推送时提示输入密码，请使用GitHub Personal Access Token
echo 创建Token: https://github.com/settings/tokens
echo 需要勾选 'repo' 权限
echo.

echo.
echo [3/4] 推送代码到GitHub...
cd /d "%~dp0"

git remote remove origin 2>nul
git remote add origin https://github.com/gjhgit/simple-proxy-server.git
git branch -M main

echo.
echo 正在推送代码...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [错误] 推送失败，请检查：
    echo 1. GitHub仓库是否已创建
    echo 2. 用户名和密码(Token)是否正确
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] 代码推送成功！
echo.
echo ========================================
echo   下一步：部署到Railway
echo ========================================
echo.
echo 方式1 - Railway网页部署：
echo   1. 访问 https://railway.app
echo   2. 点击 "Login with GitHub" 登录
echo   3. 点击 "New Project" ^> "Deploy from GitHub repo"
echo   4. 选择 simple-proxy-server 仓库
echo.
echo 方式2 - Railway CLI部署：
echo   1. 安装Node.js: https://nodejs.org
echo   2. 运行: npm install -g @railway/cli
echo   3. 运行: railway login
echo   4. 运行: railway init ^&^& railway up
echo.
echo ========================================
pause
