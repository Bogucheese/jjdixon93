@echo off
echo ==========================================
echo       🚀 MyBlog 开发环境启动中...
echo ==========================================

:: 1. 启动后端 (新窗口)
start "MyBlog Backend (Port 3000)" cmd /k "cd server && npm start"

:: 2. 等待 3 秒让后端先跑起来
timeout /t 3 /nobreak >nul

:: 3. 启动前端 (新窗口)
start "MyBlog Frontend (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo ✅ 服务已启动！
echo 后端: http://localhost:3000
echo 前端: http://localhost:5173
echo.
pause