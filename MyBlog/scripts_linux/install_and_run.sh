#!/bin/bash

echo "=========================================="
echo "   🚀 MyBlog 云服务器一键部署工具"
echo "=========================================="

# 1. 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "⚠️  未检测到 Node.js，正在自动安装 (需要 sudo 权限)..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 2. 检查是否安装了 PM2 (用于后台运行)
if ! command -v pm2 &> /dev/null; then
    echo "📦 正在安装 PM2 (进程守护工具)..."
    sudo npm install -g pm2
fi

# 3. 进入 Server 目录安装依赖
echo "📦 正在安装/更新后端依赖..."
cd server
npm install

# 4. 启动服务
echo "🔥 正在启动服务..."
# 停止旧进程 (如果有)
pm2 delete myblog-server 2>/dev/null
# 启动新进程
NODE_ENV=production pm2 start app.js --name "myblog-server"

# 5. 保存当前进程列表，以便重启服务器后自动启动
pm2 save
pm2 startup | tail -n 1 > /dev/null # 这一步通常需要手动执行显示的命令，但这里先尝试静默执行

echo "=========================================="
echo "✅ 部署完成！"
echo "后端运行在: http://localhost:3000 (通过 Nginx 或 公网IP访问)"
echo "查看日志请运行: pm2 logs"
echo "=========================================="