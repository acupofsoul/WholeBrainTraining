@echo off
echo 正在启动本地HTTP服务器...
echo 请在浏览器中访问: http://localhost:8080
echo 按 Ctrl+C 停止服务器
echo.
python -m http.server 8080 2>nul || (
    echo Python未安装或不在PATH中，尝试使用Node.js...
    npx serve -s . -l 8080 2>nul || (
        echo 请安装Python或Node.js来运行本地服务器
        echo 或者使用以下在线工具:
        echo 1. 安装Python: https://www.python.org/downloads/
        echo 2. 安装Node.js: https://nodejs.org/
        pause
    )
)