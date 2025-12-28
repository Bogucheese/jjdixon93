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
- [☁️ 部署指南 (腾讯云 + Nginx)](#-部署指南-腾讯云--nginx)
- [🗄️ 数据库配置 (SQL)](#-数据库配置)
- [⚠️ 注意事项 (Notes)](#-注意事项)

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

---

## 📂 目录结构 (Directory Structure)

```text
/
├── client/              # 前端项目 (Vue 3 + Vite)
│   ├── src/             # 源代码 (页面、组件、路由) / Source code
│   └── public/          # 静态资源 / Static assets
├── server/              # 后端项目 (Express + Node.js)
│   ├── uploads/         # 用户上传的媒体文件 (图片/视频) / User uploads
│   ├── db.js            # 数据库连接池配置 / Database connection pool config
│   ├── app.js           # 服务端主入口 / Server entry point
│   ├── setup-db.js      # 数据库初始化脚本 / Database init script
│   └── move-dist.js     # 前后端集成工具 / Integration tool
├── scripts_win/         # Windows 自动化脚本 (.bat) / Windows automation scripts
│   ├── 一键环境配置.bat
│   └── 一键启动开发环境.bat
├── scripts_linux/       # Linux 自动化脚本 (.sh) / Linux automation scripts
│   ├── setup.sh
│   └── start_dev.sh
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
| **`一键环境配置.bat`** | **🔥 首次使用推荐**。自动安装前后端依赖，并引导初始化数据库。<br>**Recommended for first time**. Auto-installs dependencies and guides DB init. |
| **`一键启动开发环境.bat`** | 同时启动前端 (5173) 和后端 (3000)。<br>Starts both frontend (5173) and backend (3000). |
| **`初始化数据库.bat`** | 重置数据库 (⚠️ 会清空数据，需先配置 `.env`)。<br>Resets database (⚠️ clears data, requires .env config first). |
| **`一键体检.bat`** | 检查环境是否健康。<br>Checks environment health. |

### 🐧 Linux / Mac 用户 (Linux / Mac Users)
在终端运行 `scripts_linux` 下的脚本 (需先赋权 `chmod +x scripts_linux/*.sh`)：
Run scripts under `scripts_linux` in terminal (grant execution rights first):

```bash
# 1. 首次配置 (安装依赖 + 引导数据库设置) / First setup (Install deps + DB setup)
./scripts_linux/setup.sh

# 2. 启动服务 / Start services
./scripts_linux/start_dev.sh
```

---

## ⚙️ 手动安装 (Manual Installation)

如果你喜欢手动控制每一 步，请按照以下流程操作：
If you prefer manual control, follow these steps:

1.  **数据库准备 (Database Prep)**: 创建数据库 `myblog`. / Create database `myblog`.
2.  **后端配置 (Backend Config)**:
    ```bash
    cd server
    cp .env.example .env  # 复制配置文件 / Copy config file
    # ⚠️ 编辑 .env 文件，填入你的 MySQL 密码和 QQ 邮箱授权码
    # ⚠️ Edit .env file, fill in your MySQL password and QQ Email Auth Code
    npm install           # 安装依赖 / Install dependencies
    npm run db:init       # 初始化表结构 / Initialize table structure
    node app.js           # 启动服务 / Start server
    ```
3.  **前端配置 (Frontend Config)**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

---

## ☁️ 部署指南 (腾讯云 + Nginx) / Deployment Guide

### 1. 准备工作 (Preparation)
- 服务器：安装 Node.js, MySQL, Nginx, PM2。
- Server: Install Node.js, MySQL, Nginx, PM2.
- 修改 `server/.env` 中的 `DB_HOST` 为 `localhost`。
- Change `DB_HOST` in `server/.env` to `localhost`.

### 2. Nginx 配置 (Nginx Config)
编辑 Nginx 配置文件，添加反向代理：
Edit Nginx config file, add reverse proxy:

```nginx
server {
    listen 80;
    server_name 你的公网IP或域名; # Your Public IP or Domain

    # 1. 前端静态资源 / Frontend Static Assets
    location / {
        root /var/www/myblog/client/dist; # 修改为你的 dist 路径 / Change to your dist path
        index index.html;
        try_files $uri $uri/ /index.html; # 解决路由刷新 404 / Fix 404 on refresh
    }

    # 2. 后端 API 反向代理 / Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
    }
}
```

### 3. 启动服务 (Start Services)
```bash
# 后端 (使用 PM2 守护进程) / Backend (Use PM2 daemon)
cd /var/www/myblog/server
pm2 start app.js --name "myblog-server"

# 重启 Nginx / Restart Nginx
sudo nginx -s reload
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
```
</details>

---

## ⚠️ 注意事项 (Notes)

1.  **隐私安全 (Privacy)**: 项目根目录已配置 `.gitignore`，请确保不要将包含真实密码的 `.env` 文件上传到 GitHub。
    <br>`.gitignore` is configured. Do NOT upload `.env` with real passwords to GitHub.
2.  **邮件配置 (Email Config)**: 注册功能依赖 QQ 邮箱 SMTP 服务。请在 `.env` 文件中正确填写 `MAIL_USER` (你的QQ号) 和 `MAIL_PASS` (SMTP授权码)。
    <br>Registration requires QQ Mail SMTP. Fill in `MAIL_USER` and `MAIL_PASS` in `.env`.
3.  **云服务器安全组 (Cloud Firewall)**: 部署时请务必在腾讯云后台放行 **80** (Web) 和 **3306** (MySQL) 端口。
    <br>Ensure ports **80** (Web) and **3306** (MySQL) are open in your cloud firewall settings.

---

<div align="center">
  <sub>Made with ❤️ by MyBlog Team</sub>
</div>
