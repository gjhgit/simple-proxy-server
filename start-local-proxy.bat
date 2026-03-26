@echo off
chcp 65001 >nul
echo ========================================
echo   启动本地代理服务
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js，请先安装
    echo 下载地址: https://nodejs.org
    pause
    exit /b 1
)

echo [2/2] 启动本地代理服务...
echo.
echo 代理地址: http://127.0.0.1:7890
echo.
echo 使用方式:
echo   1. 保持此窗口运行
echo   2. 设置系统代理为: http://127.0.0.1:7890
echo   3. 或在浏览器中配置代理
echo   4. 或使用命令行: curl -x http://127.0.0.1:7890 https://www.google.com
echo.
echo 按Ctrl+C停止服务
echo.
echo ========================================

node local-proxy.js

pause
