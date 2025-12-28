# 📘 MyBlog Community System

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)

**一个现代化、功能完备的博客社区系统**  
*支持文章发布 · 互动评论 · 数据可视化 · 休闲游戏 · 权限管理*

**A modern, fully-featured blog community system**  
*Supports article publishing, interactive comments, data visualization, casual games, and permission management.*

[功能特性 (Features)](#-功能特性) • [快速开始 (Quick Start)](#-快速开始-懒人模式) • [部署指南 (Deployment)](#-部署指南-腾讯云--nginx) • [数据库 (Database)](#-数据库配置)

</div>

---

## 📖 目录 (Table of Contents)

- [✨ 功能特性 (Features)](#-功能特性)
- [🛠️ 技术栈 (Tech Stack)](#-技术栈)
- [📂 目录结构 (Structure)](#-目录结构)
- [🚀 快速开始 (懒人模式)](#-快速开始-懒人模式)
- [⚙️ 手动安装 (Manual)](#-手动安装)
- [📦 前端打包 (Build)](#-前端打包-build)
- [🖼️ 静态资源路径配置](#-静态资源路径配置)
- [☁️ 部署指南 (腾讯云 + Nginx)](#-部署指南-腾讯云--nginx)
- [🗄️ 数据库配置 (SQL)](#-数据库配置)
- [⚠️ 注意事项 (Notes)](#-注意事项)
- [🌍 环境区分 (Env)](#-环境区分-development--production)

---

## ✨ 功能特性 (Features)

| 模块 (Module) | 功能描述 (Description) |
| :--- | :--- |
| **🏠 社区大厅 (Hub)** | 热门文章流、推荐创作者、话题聚合、实时搜索、轮播图展示。<br>Hot article feed, recommended creators, topic aggregation, real-time search, carousel display. |
| **📝 文章系统 (Articles)** | Markdown 富文本编辑、草稿箱、文章分类、标签管理。<br>Markdown rich text editing, drafts, article categorization, tag management. |
| **💬 互动社交 (Social)** | 点赞、收藏、关注/取关、多级评论回复、**评论举报**（信誉分系统）。<br>Likes, favorites, follow/unfollow, multi-level comments, **comment reporting** (reputation score system). |
| **📊 数据可视化 (Visuals)** | **ECharts 大屏**：展示用户增长、访问热度、文章分类占比等实时数据。<br>**ECharts Dashboard**: Displays user growth, visit traffic, article category distribution, etc. |
| **👤 用户中心 (User)** | 个人主页、资料修改、**QQ邮箱验证码注册/找回密码**、安全设置。<br>Profile page, edit profile, **QQ email verification code for register/password reset**, security settings. |
| **🎮 休闲娱乐 (Games)** | 内置休闲小游戏（如贪吃蛇），支持分数上传与**全球排行榜**。<br>Built-in casual games (e.g., Snake), supports score upload and **global leaderboards**. |
| **🛡️ 后台管理 (Admin)** | (管理员) 用户封禁/解冻、内容强制下架、处理举报、系统日志监控。<br>(Admin only) User ban/unban, forced content removal, report handling, system log monitoring. |

---

## 🛠️ 技术栈 (Tech Stack)

- **前端 (Frontend)**: Vue 3, Vite, Vue Router, Pinia (State Management), Element Plus (UI), ECharts 5 (Data Viz), SCSS.
- **后端 (Backend)**: Node.js, Express, MySQL2, JWT (Auth), Bcrypt (Encryption), Nodemailer (Email), Multer (Uploads).
- **数据库 (Database)**: MySQL 5.7 / 8.0.
- **部署 (Deployment)**: Nginx (Reverse Proxy), PM2 (Process Manager), Tencent Cloud (Server).

---

## 📂 目录结构 (Directory Structure)

```text
/
├── client/              # 前端项目 (Vue 3 + Vite)
│   ├── src/             # 源代码 (页面、组件、路由) / Source code
│   │   ├── api/         # API请求封装 / API request wrapper
│   │   ├── assets/      # 本地静态资源 (图片/样式) / Local static assets
│   │   ├── components/  # 通用组件 / Common components
│   │   ├── pages/       # 页面组件 / Page components
│   │   ├── router/      # 路由配置 / Router config
│   │   ├── store/       # Pinia状态管理 / Pinia state management
│   │   └── utils/       # 工具函数 / Utility functions
│   ├── public/          # 公共静态资源 (不会被打包) / Public static assets
│   ├── .env.development # 开发环境配置 / Dev env config
│   ├── .env.production  # 生产环境配置 / Prod env config
│   └── vite.config.js   # Vite构建配置 / Vite build config
├── server/              # 后端项目 (Express + Node.js)
│   ├── controllers/     # 业务逻辑控制器 / Business logic controllers
│   ├── middlewares/     # 中间件 (鉴权/日志) / Middlewares (Auth/Log)
│   ├── routes/          # 接口路由 / API routes
│   ├── uploads/         # 用户上传的媒体文件 (图片/视频) / User uploads
│   ├── .env.example     # 环境变量示例 / Env var example
│   ├── db.js            # 数据库连接池配置 / Database connection pool config
│   ├── app.js           # 服务端主入口 / Server entry point
│   ├── setup-db.js      # 数据库初始化脚本 / Database init script
│   └── move-dist.js     # 前后端集成工具 (复制打包文件) / Integration tool
├── scripts_win/         # Windows 自动化脚本 (.bat) / Windows automation scripts
│   ├── 一键环境配置.bat
│   ├── 一键启动开发环境.bat
│   ├── 初始化数据库.bat
│   └── 一键体检.bat
├── scripts_linux/       # Linux 自动化脚本 (.sh) / Linux automation scripts
│   ├── setup.sh
│   ├── start_dev.sh
│   ├── build_frontend.sh
│   └── health_check.sh
├── package.json         # 根目录依赖与多项目管理脚本 / Root dependencies & scripts
└── README.md            # 项目自述文件 / Project documentation
```

---

## 🚀 快速开始 (懒人模式) / Quick Start (Lazy Mode)

为了方便开发，本项目提供了**一键自动化脚本**，位于 `scripts_win` (Windows) 和 `scripts_linux` (Linux) 文件夹中。

To facilitate development, this project provides **one-click automation scripts** located in `scripts_win` (Windows) and `scripts_linux` (Linux) folders.

### 🪟 Windows 用户 (Windows Users)
进入 `scripts_win` 文件夹，双击即可运行：
Enter the `scripts_win` folder and double-click to run:

| 脚本文件 (Script) | 作用 (Function) |
| :--- | :--- |
| **`一键环境配置.bat`** | **🔥 首次使用推荐**。自动安装Node.js依赖（前后端）、检查MySQL服务、引导创建数据库、复制.env示例文件并提示配置。<br>**Recommended for first time**. Auto-installs Node.js deps (frontend/backend), checks MySQL service, guides DB creation, copies .env example and prompts config. |
| **`一键启动开发环境.bat`** | 同时启动前端开发服务器 (http://localhost:5173) 和后端服务 (http://localhost:3000)，自动打开前端页面。<br>Starts frontend dev server (5173) and backend server (3000) simultaneously, auto-opens frontend page. |
| **`初始化数据库.bat`** | 清空`myblog`数据库并重新创建所有表结构（⚠️ 会删除所有数据，需先配置`server/.env`）。<br>Resets `myblog` DB and recreates tables (⚠️ deletes all data, requires `server/.env` config first). |
| **`一键体检.bat`** | 检查Node.js版本、MySQL连接、端口占用、依赖安装状态、.env配置完整性。<br>Checks Node.js version, MySQL connection, port occupancy, dependency status, .env config completeness. |

### 🐧 Linux / Mac 用户 (Linux / Mac Users)
在终端运行 `scripts_linux` 下的脚本 (需先赋权 `chmod +x scripts_linux/*.sh`)：
Run scripts under `scripts_linux` in terminal (grant execution rights first):

```bash
# 1. 首次配置 (安装依赖 + 检查环境 + 数据库设置) / First setup (Install deps + Env check + DB setup)
./scripts_linux/setup.sh

# 2. 启动开发环境 / Start development environment
./scripts_linux/start_dev.sh

# 3. 前端打包 (生产环境) / Build frontend (production)
./scripts_linux/build_frontend.sh

# 4. 环境体检 / Health check
./scripts_linux/health_check.sh
```

---

## ⚙️ 手动安装 (Manual Installation)

如果你喜欢手动控制每一步，请按照以下流程操作：
If you prefer manual control, follow these steps:

### 前置条件 (Prerequisites)
1. 安装Node.js (v16+ 推荐)：https://nodejs.org/
2. 安装MySQL (5.7/8.0) 并启动服务，确保可以通过root账号连接
3. 安装Git (可选，用于克隆项目)

### 1. 克隆项目 (Clone Project)
```bash
git clone <你的仓库地址> myblog-community
cd myblog-community
```

### 2. 数据库准备 (Database Preparation)
```bash
# 登录MySQL终端
mysql -u root -p

# 执行以下SQL命令
CREATE DATABASE IF NOT EXISTS myblog DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. 后端配置 (Backend Configuration)
```bash
# 进入后端目录
cd server

# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件 (必填配置项)
# 推荐使用vim/nano，Windows用户可用记事本
vim .env
```

`.env` 文件核心配置项说明 (Key Configs in .env):
```ini
# 数据库配置
DB_HOST=localhost       # 开发环境填localhost，生产环境填服务器内网IP
DB_PORT=3306            # MySQL端口
DB_USER=root            # MySQL用户名
DB_PASS=your_mysql_pwd  # MySQL密码 (必填！)
DB_NAME=myblog          # 数据库名 (固定为myblog)

# 服务器配置
SERVER_PORT=3000        # 后端端口
JWT_SECRET=your_jwt_key # JWT密钥 (自定义随机字符串)
JWT_EXPIRE=7d           # Token有效期

# 邮箱配置 (QQ邮箱SMTP)
MAIL_USER=your_qq@qq.com # QQ邮箱账号 (必填！)
MAIL_PASS=your_smtp_code # QQ邮箱SMTP授权码 (必填！)
MAIL_HOST=smtp.qq.com
MAIL_PORT=587

# 上传配置
UPLOAD_DIR=./uploads    # 上传文件存储目录
MAX_FILE_SIZE=5242880   # 最大文件大小 (5MB)
```

```bash
# 安装后端依赖
npm install

# 初始化数据库表结构
npm run db:init

# 启动后端开发服务 (监听3000端口)
node app.js
# 或使用nodemon热重载 (推荐开发环境)
npm install -g nodemon
nodemon app.js
```

### 4. 前端配置 (Frontend Configuration)
```bash
# 新开终端，进入前端目录
cd client

# 复制环境变量示例 (如果需要自定义)
# 开发环境：.env.development | 生产环境：.env.production
cp .env.example .env.development

# 编辑前端环境变量 (配置后端API地址)
vim .env.development
```

前端环境变量说明 (Frontend Env Config):
```ini
# 开发环境API地址 (指向后端服务)
VITE_API_BASE_URL=http://localhost:3000/api

# 生产环境API地址 (部署时修改为服务器IP/域名)
# VITE_API_BASE_URL=http://your_server_ip/api
```

```bash
# 安装前端依赖
npm install

# 启动前端开发服务器 (监听5173端口)
npm run dev
```

### 5. 访问项目 (Access Project)
- 前端页面：http://localhost:5173
- 后端API：http://localhost:3000/api
- 管理员账号：需手动在`userinfo`表中创建（设置`role='admin'`）

---

## 📦 前端打包 (Build)

### 开发环境打包 (Development Build)
用于测试打包后的前端代码，保留源码映射：
```bash
cd client
npm run build:dev
# 打包产物输出到 client/dist 目录
# Build output: client/dist (with source map)
```

### 生产环境打包 (Production Build)
用于服务器部署，代码压缩优化，无源码映射：
```bash
cd client
npm run build:prod
# 打包产物输出到 client/dist 目录 (优化后)
# Build output: client/dist (optimized, no source map)
```

### 打包后预览 (Preview Build)
```bash
# 安装预览工具
npm install -g serve

# 预览生产打包产物
serve -s client/dist
# 访问：http://localhost:3000
```

---

## 🖼️ 静态资源路径配置

### 1. 前端本地静态资源 (Frontend Local Assets)
- **`client/src/assets/`**: 项目内静态资源（图片/样式/字体），会被Vite打包处理
  - 使用方式：在组件中通过`import`引入
    ```vue
    <script setup>
    import logo from '@/assets/logo.png'
    </script>
    <template>
      <img :src="logo" alt="logo" />
    </template>
    ```
- **`client/public/`**: 公共静态资源（favicon/全局图片），不会被打包，直接复制到`dist`根目录
  - 使用方式：绝对路径引用
    ```vue
    <img src="/banner.png" alt="banner" />
    ```

### 2. 用户上传资源 (User Uploads)
- 后端接收的上传文件（图片/视频）存储在`server/uploads/`目录
- 前端访问上传资源的URL格式：`http://<服务器IP>:3000/uploads/<文件名>`
- Nginx部署时需配置静态资源访问：
  ```nginx
  # 配置用户上传文件的访问
  location /uploads/ {
      root /var/www/myblog/server;
      expires 7d; # 缓存7天
      add_header Cache-Control "public";
  }
  ```

### 3. 生产环境静态资源路径 (Production Asset Path)
修改`client/vite.config.js`中的`base`配置：
```javascript
export default defineConfig(({ mode }) => {
  return {
    // 开发环境：相对路径 | 生产环境：根据实际部署路径调整
    base: mode === 'production' ? '/' : './', 
    // 其他配置...
  }
})
```

---

## ☁️ 部署指南 (腾讯云 + Nginx) / Deployment Guide

### 1. 服务器环境准备 (Server Environment Preparation)
```bash
# 1. 安装依赖 (CentOS/Ubuntu)
# CentOS
yum install -y nodejs npm mysql nginx
npm install -g pm2

# Ubuntu
apt update && apt install -y nodejs npm mysql-server nginx
npm install -g pm2

# 2. 启动并设置开机自启
systemctl start mysqld nginx
systemctl enable mysqld nginx

# 3. 配置MySQL密码 (首次安装)
mysql_secure_installation
```

### 2. 项目部署 (Project Deployment)
```bash
# 1. 将项目上传到服务器 (推荐目录 /var/www/myblog)
mkdir -p /var/www/myblog
# 通过SFTP/Git克隆上传项目文件

# 2. 配置后端环境变量
cd /var/www/myblog/server
cp .env.example .env
# 编辑.env，修改：
# DB_HOST=localhost
# JWT_SECRET=随机字符串
# MAIL_USER和MAIL_PASS填写真实值

# 3. 安装依赖
cd /var/www/myblog
npm install # 根目录依赖
cd server && npm install
cd ../client && npm install

# 4. 前端生产打包
npm run build:prod

# 5. 初始化数据库
cd ../server
node setup-db.js
```

### 3. Nginx 详细配置 (Detailed Nginx Config)
```bash
# 编辑Nginx配置文件
vim /etc/nginx/conf.d/myblog.conf
```

配置内容 (Config Content):
```nginx
server {
    listen 80;
    server_name your_domain.com; # 替换为你的域名/公网IP
    charset utf-8;

    # 前端静态资源
    location / {
        root /var/www/myblog/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html; # 解决Vue路由刷新404
        expires 1d; # 静态资源缓存1天
    }

    # 后端API反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 用户上传文件访问
    location /uploads/ {
        root /var/www/myblog/server;
        expires 7d;
        add_header Cache-Control "public";
        # 限制文件类型 (仅允许图片/视频)
        if ($request_filename !~* ^.*\.(jpg|jpeg|png|gif|mp4|webp)$) {
            return 403;
        }
    }

    # 日志配置
    access_log /var/log/nginx/myblog_access.log;
    error_log /var/log/nginx/myblog_error.log;
}
```

```bash
# 检查Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

### 4. 后端服务守护 (Backend Process Management)
```bash
# 启动后端服务 (PM2守护)
cd /var/www/myblog/server
pm2 start app.js --name "myblog-server"

# 设置PM2开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status myblog-server

# 日志查看
pm2 logs myblog-server
```

### 5. 防火墙配置 (Firewall Configuration)
```bash
# 开放80端口 (HTTP)
firewall-cmd --add-port=80/tcp --permanent
# 开放3306端口 (MySQL，仅开发环境需要，生产环境建议关闭)
# firewall-cmd --add-port=3306/tcp --permanent
firewall-cmd --reload
```

---

## 🗄️ 数据库配置 (Database Config)

<details>
<summary>📋 <b>点击展开查看完整 SQL 初始化命令</b> (复制并在 MySQL 中执行) / <b>Click to expand full SQL commands</b></summary>

```sql
-- 1. 创建库 / Create Database
CREATE DATABASE IF NOT EXISTS myblog DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myblog;

-- 2. 用户表 / User Table
CREATE TABLE `userinfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user', -- user 或 admin / user or admin
  `status` int DEFAULT '1', -- 1:正常, 0:封禁 / 1:Normal, 0:Banned
  `credit_score` int DEFAULT '100', -- 信誉分 / Reputation Score
  `avatar` varchar(500) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `login_fail_count` int DEFAULT '0',
  `frozen_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);

-- 3. 文章表 / Articles Table
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `user_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'published',
  `views` int DEFAULT '0',
  `likes_count` int DEFAULT '0',
  `fav_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE
);

-- 4. 评论表 / Comments Table
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `article_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE
);

-- 5. 媒体库 / Media Library
CREATE TABLE `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `type` varchar(50) DEFAULT 'image',
  `size` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE
);

-- 6. 互动关系表 / Interaction Tables
CREATE TABLE `likes` (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`article_id`)
);
CREATE TABLE `favorites` (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`article_id`)
);
CREATE TABLE `follows` (
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL,
  PRIMARY KEY (`follower_id`,`followed_id`)
);

-- 7. 其他辅助表 / Other Helper Tables
CREATE TABLE `carousels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `game_scores` (
  `user_id` int NOT NULL,
  `score` int DEFAULT '0',
  PRIMARY KEY (`user_id`)
);
CREATE TABLE `site_visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(100) DEFAULT NULL,
  `visit_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
CREATE TABLE `comment_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
CREATE TABLE `dev_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `version` varchar(50) DEFAULT NULL,
  `content` text,
  `type` varchar(50) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `commit_hash` varchar(100) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 创建管理员账号示例 (密码: admin123) / Create admin user example (password: admin123)
INSERT INTO `userinfo` (`username`, `password`, `email`, `role`) 
VALUES ('admin', '$2a$10$89wM79y0Z7eS8b8K7X7d9e8R7t6Y5u4i3o2p1q0w9e8r7t6y5u4i', 'admin@example.com', 'admin');
```
</details>

---

## 🌍 环境区分 (Development & Production)

| 环境 (Environment) | 用途 (Purpose) | 前端地址 (Frontend URL) | 后端地址 (Backend URL) | 配置文件 (Config File) |
| :--- | :--- | :--- | :--- | :--- |
| **开发环境 (Development)** | 本地开发、调试 | http://localhost:5173 | http://localhost:3000 | `client/.env.development` + `server/.env` |
| **生产环境 (Production)** | 服务器部署、线上运行 | http://<域名/IP> | http://127.0.0.1:3000 | `client/.env.production` + `server/.env` |

### 环境差异说明 (Environment Differences)
1. **前端**:
   - 开发环境：热重载、源码映射、未压缩代码
   - 生产环境：代码压缩、Tree Shaking、静态资源缓存、移除console.log
2. **后端**:
   - 开发环境：详细日志、错误堆栈、跨域允许
   - 生产环境：精简日志、禁用跨域、接口限流、错误信息脱敏
3. **数据库**:
   - 开发环境：允许远程连接、测试数据
   - 生产环境：仅本地连接、定期备份、权限限制

---

## ⚠️ 注意事项 (Notes)

1. **隐私安全 (Privacy)**: 
   - 项目根目录已配置 `.gitignore`，请确保不要将包含真实密码/密钥的 `.env` 文件上传到GitHub/GitLab。
   - `.gitignore` is configured. DO NOT upload `.env` with real passwords/keys to GitHub/GitLab.
   - 生产环境务必修改JWT_SECRET为复杂随机字符串，定期更换。

2. **邮件配置 (Email Config)**:
   - 注册/找回密码功能依赖QQ邮箱SMTP服务，需先在QQ邮箱开启SMTP并获取授权码（不是登录密码）。
   - Registration/password reset requires QQ Mail SMTP. Enable SMTP in QQ Mail and get auth code (not login password).

3. **服务器安全 (Server Security)**:
   - 生产环境建议关闭MySQL的3306端口对外访问，仅允许本地连接。
   - 定期备份`server/uploads`目录和MySQL数据库。
   - 给Nginx配置HTTPS（Let's Encrypt免费证书）。

4. **性能优化 (Performance)**:
   - 生产环境可开启MySQL慢查询日志，优化SQL语句。
   - 前端打包后可开启Gzip压缩（Nginx配置）：
     ```nginx
     gzip on;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
     ```

5. **常见问题 (FAQ)**:
   - Q: 前端访问后端API跨域？A: 开发环境后端已配置CORS，生产环境通过Nginx代理无跨域问题。
   - Q: 上传图片无法访问？A: 检查Nginx的/uploads配置和文件权限（chmod 755 server/uploads）。
   - Q: 路由刷新404？A: Nginx配置中已添加`try_files $uri $uri/ /index.html`，确保配置生效。

---

<div align="center">
  <sub>Made with ❤️ by MyBlog Team</sub>
</div>
