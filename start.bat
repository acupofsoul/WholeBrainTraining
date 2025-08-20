@echo off
echo 正在启动全脑训练工具项目...

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 您可以从 https://nodejs.org/ 下载并安装
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist node_modules (
    echo 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo 安装依赖失败，请检查网络连接或手动运行 npm install
        pause
        exit /b 1
    )
    echo 依赖安装完成！
)

REM 启动开发服务器
echo 正在启动开发服务器...
call npm run dev

pause