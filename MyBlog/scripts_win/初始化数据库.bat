@echo off
chcp 65001 >nul
echo ==========================================
echo        🗄️ MyBlog 数据库初始化工具
echo ==========================================
echo.
echo 此脚本将连接到 MySQL 并重置数据库。
echo ⚠️  警告: 现有 'myblog' 数据库中的所有数据将被清空！
echo.

cd server

if not exist .env (
    echo ❌ 未找到 server/.env 配置文件！
    echo 正在从 .env.example 复制模板...
    copy .env.example .env
    echo.
    echo ✅ 已创建 .env 文件。
    echo ⚠️  请务必先编辑 server/.env 文件，填入你的数据库密码！
    echo    (右键点击 server/.env -> 打开方式 -> 记事本)
    echo.
    echo 修改完成后，请再次运行此脚本。
    pause
    exit /b
)

echo 正在启动数据库重置程序...
call npm run db:init

echo.
pause