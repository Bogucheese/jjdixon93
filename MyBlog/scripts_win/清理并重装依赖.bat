@echo off
echo ⚠️  警告：这将删除 node_modules 并重新安装，可能需要几分钟。
pause

echo.
echo [1/4] 清理后端依赖...
cd server
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [2/4] 清理前端依赖...
cd ../client
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [3/4] 重装后端依赖...
cd ../server
call npm install

echo.
echo [4/4] 重装前端依赖...
cd ../client
call npm install

echo.
echo ✅ 所有依赖已重置完成！
pause