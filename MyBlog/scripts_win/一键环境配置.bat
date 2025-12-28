@echo off
chcp 65001 >nul
echo ==========================================
echo    🛠️  MyBlog Windows 一键环境配置
echo ==========================================
echo.

:: 1. 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js！
    echo 请先去 https://nodejs.org/ 下载并安装 Node.js。
    pause
    exit /b
)
echo ✅ Node.js 已安装。

:: 2. 安装依赖
echo.
echo 📦 [1/3] 正在安装后端依赖...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败。
    pause
    exit /b
)

echo.
echo 📦 [2/3] 正在安装前端依赖...
cd ../client
call npm install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败。
    pause
    exit /b
)

:: 3. 数据库初始化引导
echo.
echo 🗄️  [3/3] 数据库设置
set /p confirm_db="是否需要现在初始化数据库？(输入 y 确认，直接回车跳过): "

if /i "%confirm_db%"=="y" (
    cd ../server
    if not exist .env (
        echo.
        echo ⚠️  未找到 .env 文件。正在从 .env.example 创建...
        copy .env.example .env
        echo.
        echo ⚠️  重要提示：
        echo    请现在去 server 文件夹，用记事本打开 .env 文件。
        echo    填入你的 MySQL 数据库密码 (DB_PASSWORD)。
        echo.
        echo    配置好后，请双击运行根目录下的 [初始化数据库.bat]。
    ) else (
        call npm run db:init
    )
) else (
    echo ⏩ 已跳过数据库初始化。
)

echo.
echo ==========================================
echo 🎉 环境配置完成！
echo.
echo 你现在可以点击 [一键启动开发环境.bat] 来运行项目了。
echo ==========================================
pause