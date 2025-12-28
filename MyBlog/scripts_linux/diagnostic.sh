#!/bin/bash

echo "=========================================="
echo "   🩺 MyBlog 服务器体检报告"
echo "=========================================="

# 1. 检查 PM2 进程状态
echo "[1/4] 服务运行状态 (PM2):"
pm2 list

# 2. 检查 3000 端口占用
echo ""
echo "[2/4] 端口占用情况 (Port 3000):"
netstat -tulpn | grep :3000 || echo "⚠️  警告: 3000 端口未被监听 (服务可能挂了)"

# 3. 检查数据库连接 (简单的 Ping)
echo ""
echo "[3/4] 数据库服务状态 (MySQL):"
systemctl status mysql | grep Active || echo "⚠️  警告: MySQL 服务似乎未运行"

# 4. 显示最近的错误日志
echo ""
echo "[4/4] 最近 10 条错误日志:"
echo "--------------------------------"
pm2 logs myblog-server --lines 10 --err --nostream
echo "--------------------------------"

echo ""
echo "诊断结束。"