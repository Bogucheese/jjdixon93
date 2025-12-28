import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import nodemailer from 'nodemailer';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet'; // ✨✨✨ 新增：安全头防护
import db from './db.js';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================= 1. 全局安全与基础配置 =================

// 1.1 基础中间件
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));



// 1.2 ✨✨✨ CSP 安全策略 (防御 XSS) ✨✨✨
// 1.2 ✨✨✨ CSP Security Policy (Prevent XSS) ✨✨✨
// 禁止加载未授权的外部脚本，防止 token 被偷
// Ban unauthorized external scripts to prevent token theft
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      // ✨✨✨ 关键：ECharts 需要 'unsafe-eval' ✨✨✨
      // ✨✨✨ Key: ECharts requires 'unsafe-eval' ✨✨✨
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], 
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], 
      imgSrc: ["'self'", "data:", "blob:", "*"], 
      mediaSrc: ["'self'", "data:", "blob:", "*"], 
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"], 
      frameSrc: ["'self'"], 
      connectSrc: ["'self'", "http://localhost:3000", "ws://localhost:3000"], 
    },
  })
);

// 1.3 静态资源托管
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'dist')));

const SECRET_KEY = process.env.JWT_SECRET || 'my_secret_key_123456';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&.]{8,}$/; // 强密码正则 / Strong password regex

// ================= 2. 邮件服务与存储 =================

// ⚠️ 请确保邮箱配置正确
// ⚠️ Ensure email config is correct
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', port: 465, secure: true,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

// ✨✨✨ 升级后的验证码存储 (防暴力破解) ✨✨✨
// ✨✨✨ Upgraded Code Storage (Anti-Brute Force) ✨✨✨
// 结构: { email: { code, expire, errors, lastSent } }
// Structure: { email: { code, expire, errors, lastSent } }
let codeStore = {}; 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 解决中文文件名乱码
        // Fix Chinese filename encoding issues
        file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 500 * 1024 * 1024 } });

// ================= 3. 鉴权中间件 (修复封禁失效漏洞) =================
// ================= 3. Auth Middleware (Fix Ban Bypass) =================

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ code: 401, message: '未提供 Token' });
    
    const token = authHeader.split(' ')[1];
    
    try {
        // 1. 验签
        // 1. Verify Signature
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;

        // 2. ✨✨✨ 实时查库校验状态 (防止封禁后还能操作) ✨✨✨
        // 2. ✨✨✨ Real-time DB Status Check (Prevent Banned Actions) ✨✨✨
        const [rows] = await db.query('SELECT status, frozen_until FROM userinfo WHERE id = ?', [req.user.id]);
        
        if (rows.length === 0) return res.status(401).json({ code: 401, message: '用户不存在' });
        
        const user = rows[0];
        if (user.status === 0) {
            return res.status(403).json({ code: 403, message: '账号已被永久封禁，禁止操作。' });
        }
        if (user.frozen_until && new Date(user.frozen_until) > new Date()) {
            return res.status(403).json({ code: 403, message: '账号临时冻结中，禁止操作。' });
        }

        next();
    } catch (err) {
        return res.status(403).json({ code: 403, message: 'Token 无效或已过期' });
    }
};

const adminMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ code: 401, message: '未登录' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        const [rows] = await db.query('SELECT role FROM userinfo WHERE id = ?', [req.user.id]);
        if (rows.length > 0 && rows[0].role === 'admin') {
            next();
        } else {
            res.status(403).json({ code: 403, message: '无权访问管理后台' });
        }
    } catch (err) {
        return res.status(403).json({ code: 403, message: 'Token 无效' });
    }
};

// ================= 4. API 接口 =================

// [Auth: 发送验证码] (修复邮件轰炸)
// [Auth: Send Code] (Fix Email Bombing)
app.post('/api/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.endsWith('@qq.com')) return res.json({ code: 400, message: '仅支持QQ邮箱' });

    const now = Date.now();
    // 1. 频率限制 (60秒)
    // 1. Rate Limit (60s)
    if (codeStore[email] && (now - codeStore[email].lastSent < 60 * 1000)) {
        return res.json({ code: 429, message: '发送太频繁，请稍后再试' });
    }

    const code = String(Math.floor(Math.random() * 900000 + 100000));
    
    try {
        await transporter.sendMail({ 
            from: `"MyBlog Security" <${process.env.MAIL_USER}>`, 
            to: email, 
            subject: '【MySpace】安全验证码', 
            text: `您的验证码是：${code}。5分钟内有效。若非本人操作请忽略。` 
        });
        
        codeStore[email] = { 
            code, 
            expire: now + 5 * 60 * 1000, 
            errors: 0, 
            lastSent: now 
        };
        res.json({ code: 200, message: '验证码已发送' });
    } catch (e) { 
        console.error(e); 
        res.status(500).json({ message: '邮件服务异常' }); 
    }
});

// [Auth: 注册] (强密码校验)
// [Auth: Register] (Strong Password Check)
app.post('/api/register', async (req, res) => {
    const { username, password, email, code } = req.body;
    
    const record = codeStore[email];
    if (!record || record.code !== code) return res.json({ code: 400, message: '验证码错误' });
    if (Date.now() > record.expire) return res.json({ code: 400, message: '验证码已过期' });

    // ✨ 强密码校验
    // ✨ Strong Password Validation
    if (!PASSWORD_REGEX.test(password)) {
        return res.json({ code: 400, message: '密码需含大小写字母及数字，至少8位' });
    }

    const hash = bcrypt.hashSync(password, 10);
    try {
        await db.query('INSERT INTO userinfo (username, password, email, role, status, credit_score) VALUES (?, ?, ?, "user", 1, 100)', [username, hash, email]);
        delete codeStore[email];
        res.json({ code: 200, message: '注册成功' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// [Auth: 登录]
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM userinfo WHERE username = ?', [username]);

        if (rows.length === 0) return res.json({ code: 401, message: '用户不存在' });

        const user = rows[0];
        const conn = await db.getConnection(); 

        try {
            await conn.beginTransaction();
            if (user.status === 0) return res.json({ code: 403, message: '账号已被管理员永久封禁。' });
            if (user.frozen_until && new Date(user.frozen_until) > new Date()) {
                return res.json({ code: 403, message: `账号临时冻结中，解封时间：${new Date(user.frozen_until).toLocaleString()}` });
            }
            
            const isValid = bcrypt.compareSync(password, user.password);

            if (isValid) {
                await conn.query('UPDATE userinfo SET login_fail_count = 0, frozen_until = NULL WHERE id = ?', [user.id]);
                await conn.commit();
                const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
                return res.json({ code: 200, message: '登录成功', token });
            } else {
                const newCount = user.login_fail_count + 1;
                let updateSql = 'UPDATE userinfo SET login_fail_count = ?';
                let params = [newCount, user.id];
                let message = '密码错误';
                
                if (newCount >= 5) {
                    const frozenUntil = new Date();
                    frozenUntil.setHours(frozenUntil.getHours() + 24); 
                    updateSql += ', frozen_until = ?';
                    params.splice(1, 0, frozenUntil);
                    message = `错误次数过多，账号已冻结24小时。`;
                } else {
                    message = `密码错误。剩余尝试次数：${5 - newCount}`;
                }

                await conn.query(updateSql + ' WHERE id = ?', params);
                await conn.commit();
                return res.json({ code: 401, message });
            }
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// [Auth: 重置密码] (防暴力破解)
// [Auth: Reset Password] (Anti-Brute Force)
app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    const record = codeStore[email];

    if (!record) return res.json({ code: 400, message: '请先获取验证码' });
    if (Date.now() > record.expire) {
        delete codeStore[email];
        return res.json({ code: 400, message: '验证码已过期' });
    }

    // ✨ 错误熔断机制 (防暴力破解)
    // ✨ Error Circuit Breaker (Anti-Brute Force)
    if (record.errors >= 5) {
        delete codeStore[email];
        return res.json({ code: 403, message: '验证码错误次数过多，已失效' });
    }

    if (record.code !== code) {
        record.errors++;
        return res.json({ code: 400, message: `验证码错误 (剩余${5 - record.errors}次)` });
    }

    // ✨ 强密码校验
    // ✨ Strong Password Check
    if (!PASSWORD_REGEX.test(newPassword)) {
        return res.json({ code: 400, message: '密码需含大小写字母及数字，至少8位' });
    }

    try {
        const hash = bcrypt.hashSync(newPassword, 10);
        await db.query('UPDATE userinfo SET password = ? WHERE email = ?', [hash, email]);
        delete codeStore[email];
        res.json({ code: 200, message: '密码重置成功' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// [上传接口]
// [Upload API]
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ code: 400, message: '请选择文件' });
        const protocol = req.headers['x-forwarded-proto'] || req.protocol; 
        const host = req.get('host');
        res.json({ code: 200, message: '上传成功', url: `${protocol}://${host}/uploads/${req.file.filename}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// [媒体库上传]
// [Media Library Upload]
app.post('/api/media/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ code: 400, message: '请选择文件' });
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}/uploads/${req.file.filename}`;
        const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        await db.query('INSERT INTO media (user_id, filename, original_name, url, type, size) VALUES (?, ?, ?, ?, ?, ?)', 
            [req.user.id, req.file.filename, req.file.originalname, url, type, req.file.size]);
        
        res.json({ code: 200, message: '上传成功', url, id: req.file.filename });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// [媒体库删除]
// [Media Library Delete]
app.delete('/api/media/:filename', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM media WHERE filename = ? AND user_id = ?', [req.params.filename, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: '文件不存在或无权删除' });
        
        const filePath = path.join(__dirname, 'uploads', rows[0].filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query('DELETE FROM media WHERE id = ?', [rows[0].id]);
        res.json({ code: 200, message: '已删除' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/media', authMiddleware, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM media WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ code: 200, data: rows });
});

// [用户信息]
// [User Info]
app.get('/api/user/info', authMiddleware, async (req, res) => {
    const userId = req.query.id || req.user.id;
    try {
        const [rows] = await db.query('SELECT id, username, email, avatar, bio, role, credit_score FROM userinfo WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ code: 404, message: '未找到' });
        const user = rows[0];
        const [f1] = await db.query('SELECT COUNT(*) as total FROM follows WHERE follower_id = ?', [userId]);
        const [f2] = await db.query('SELECT COUNT(*) as total FROM follows WHERE followed_id = ?', [userId]);
        user.followingCount = f1[0].total || 0;
        user.followersCount = f2[0].total || 0;
        res.json({ code: 200, data: user });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/user/info', authMiddleware, async (req, res) => {
    const { username, avatar, bio } = req.body;
    await db.query('UPDATE userinfo SET username = ?, avatar = ?, bio = ? WHERE id = ?', [username, avatar, bio, req.user.id]);
    res.json({ code: 200, message: '保存成功' });
});

// [关注系统] (修复刷粉漏洞)
// [Follow System] (Fix Fake Followers Exploit)
app.post('/api/follow', authMiddleware, async (req, res) => {
    const targetId = req.body.targetId;
    // 1. 禁止自关注
    // 1. Disable Self-Following
    if (parseInt(targetId) === parseInt(req.user.id)) return res.json({ code: 400, message: '不能关注自己' });
    try {
        // 2. 防止重复 (需配合数据库唯一索引)
        // 2. Prevent Duplicates (Requires DB Unique Index)
        await db.query('INSERT IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)', [req.user.id, targetId]);
        res.json({ code: 200, message: '已关注' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/unfollow', authMiddleware, async (req, res) => {
    await db.query('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?', [req.user.id, req.body.targetId]);
    res.json({ code: 200, message: '已取消' });
});

app.get('/api/follow/status', authMiddleware, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?', [req.user.id, req.query.targetId]);
    res.json({ code: 200, isFollowing: rows.length > 0 });
});

app.get('/api/user/following_list', authMiddleware, async (req, res) => {
    const userId = req.query.id;
    const sql = `SELECT u.id, u.username, u.avatar, u.bio FROM follows f JOIN userinfo u ON f.followed_id = u.id WHERE f.follower_id = ?`;
    const [rows] = await db.query(sql, [userId]);
    res.json({ code: 200, data: rows });
});
app.get('/api/user/follower_list', authMiddleware, async (req, res) => {
    const userId = req.query.id;
    const sql = `SELECT u.id, u.username, u.avatar, u.bio FROM follows f JOIN userinfo u ON f.follower_id = u.id WHERE f.followed_id = ?`;
    const [rows] = await db.query(sql, [userId]);
    res.json({ code: 200, data: rows });
});

// [文章系统]
// [Article System]
app.get('/api/my-drafts', authMiddleware, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM articles WHERE user_id = ? AND status = "draft" ORDER BY create_time DESC', [req.user.id]);
    res.json({ code: 200, data: rows });
});
app.get('/api/my-articles', authMiddleware, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM articles WHERE user_id = ? ORDER BY create_time DESC', [req.user.id]);
    res.json({ code: 200, data: rows });
});
app.get('/api/my-favorites', authMiddleware, async (req, res) => {
    const sql = `SELECT a.id, a.title, a.summary, a.category, a.views, a.create_time, u.username, u.avatar, u.id as author_id FROM favorites f JOIN articles a ON f.article_id = a.id JOIN userinfo u ON a.user_id = u.id WHERE f.user_id = ? ORDER BY f.create_time DESC`;
    const [rows] = await db.query(sql, [req.user.id]);
    res.json({ code: 200, data: rows });
});

app.post('/api/articles/add', authMiddleware, async (req, res) => {
    const { title, content, category, summary, is_public, status = 'published' } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO articles (title, content, category, summary, is_public, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [title, content, category, summary, is_public, req.user.id, status]
        );
        res.json({ code: 200, message: '保存成功', articleId: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/articles/:id', authMiddleware, async (req, res) => {
    const { title, content, category, summary, is_public, status } = req.body;
    let sql = 'UPDATE articles SET title=?, content=?, category=?, summary=?, is_public=?';
    let params = [title, content, category, summary, is_public];
    if (status) { sql += ', status=?'; params.push(status); }
    sql += ' WHERE id=? AND user_id=?';
    params.push(req.params.id, req.user.id);
    await db.query(sql, params);
    res.json({ code: 200, message: '保存成功' });
});

app.delete('/api/articles/:id', authMiddleware, async (req, res) => {
    await db.query('DELETE FROM articles WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ code: 200, message: '删除成功' });
});

app.get('/api/articles/:id', async (req, res) => {
    const [rows] = await db.query('SELECT articles.*, userinfo.username, userinfo.avatar, userinfo.id as user_id FROM articles JOIN userinfo ON articles.user_id = userinfo.id WHERE articles.id = ?', [req.params.id]);
    if (rows.length > 0) {
        await db.query('UPDATE articles SET views = views + 1 WHERE id = ?', [req.params.id]);
        res.json({ code: 200, data: rows[0] });
    } else res.status(404).json({ message: '未找到' });
});

// [评论系统]
// [Comment System]
app.get('/api/comments/:articleId', async (req, res) => {
    const sql = `
        SELECT c.*, u.username, u.avatar, p.username as reply_to_user
        FROM comments c
        JOIN userinfo u ON c.user_id = u.id
        LEFT JOIN comments parent ON c.parent_id = parent.id
        LEFT JOIN userinfo p ON parent.user_id = p.id
        WHERE c.article_id = ? ORDER BY c.create_time DESC`;
    const [rows] = await db.query(sql, [req.params.articleId]);
    res.json({ code: 200, data: rows });
});

app.post('/api/comments', authMiddleware, async (req, res) => {
    const { articleId, content, parentId } = req.body;
    const [user] = await db.query('SELECT credit_score FROM userinfo WHERE id = ?', [req.user.id]);
    if (user[0].credit_score < 60) return res.json({ code: 403, message: '信誉分过低，禁止评论' });

    await db.query('INSERT INTO comments (content, article_id, user_id, parent_id) VALUES (?, ?, ?, ?)', [content, articleId, req.user.id, parentId || null]);
    await db.query('UPDATE articles SET comments_count = comments_count + 1 WHERE id = ?', [articleId]);
    res.json({ code: 200, message: '评论成功' });
});

app.delete('/api/comments/:id', authMiddleware, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '评论不存在' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '无权删除' });

    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    await db.query('UPDATE articles SET comments_count = comments_count - 1 WHERE id = ?', [rows[0].article_id]);
    res.json({ code: 200, message: '已删除' });
});

app.post('/api/comments/report', authMiddleware, async (req, res) => {
    await db.query('INSERT INTO comment_reports (comment_id, reporter_id, reason) VALUES (?, ?, ?)', [req.body.commentId, req.user.id, req.body.reason]);
    res.json({ code: 200, message: '举报成功' });
});

// [互动]
// [Interactions]
// [游戏接口] 提交分数 (需登录)
// [Game API] Submit Score (Auth Required)
app.post('/api/game/score', authMiddleware, async (req, res) => {
    const { score } = req.body;
    try {
        // 使用 ON DUPLICATE KEY UPDATE，如果分数更高则更新
        // Use ON DUPLICATE KEY UPDATE, update if score is higher
        await db.query(`
            INSERT INTO game_scores (user_id, score) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score))
        `, [req.user.id, score]);
        res.json({ code: 200, message: '分数同步成功' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// [游戏接口] 获取排行榜 (公开)
// [Game API] Get Leaderboard (Public)
app.get('/api/game/rank', async (req, res) => {
    const sql = `
        SELECT s.score, u.username, u.avatar 
        FROM game_scores s 
        JOIN userinfo u ON s.user_id = u.id 
        ORDER BY s.score DESC LIMIT 10
    `;
    try {
        const [rows] = await db.query(sql);
        res.json({ code: 200, data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/likes/toggle', authMiddleware, async (req, res) => {
    const { articleId } = req.body;
    const [rows] = await db.query('SELECT * FROM likes WHERE user_id = ? AND article_id = ?', [req.user.id, articleId]);
    if (rows.length > 0) {
        await db.query('DELETE FROM likes WHERE user_id = ? AND article_id = ?', [req.user.id, articleId]);
        await db.query('UPDATE articles SET likes_count = likes_count - 1 WHERE id = ?', [articleId]);
        res.json({ code: 200, message: '取消点赞', isLiked: false });
    } else {
        await db.query('INSERT INTO likes (user_id, article_id) VALUES (?, ?)', [req.user.id, articleId]);
        await db.query('UPDATE articles SET likes_count = likes_count + 1 WHERE id = ?', [articleId]);
        res.json({ code: 200, message: '点赞成功', isLiked: true });
    }
});
app.post('/api/favorites/toggle', authMiddleware, async (req, res) => {
    const { articleId } = req.body;
    const [rows] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND article_id = ?', [req.user.id, articleId]);
    if (rows.length > 0) {
        await db.query('DELETE FROM favorites WHERE user_id = ? AND article_id = ?', [req.user.id, articleId]);
        await db.query('UPDATE articles SET fav_count = fav_count - 1 WHERE id = ?', [articleId]);
        res.json({ code: 200, message: '取消收藏', isFavorited: false });
    } else {
        await db.query('INSERT INTO favorites (user_id, article_id) VALUES (?, ?)', [req.user.id, articleId]);
        await db.query('UPDATE articles SET fav_count = fav_count + 1 WHERE id = ?', [articleId]);
        res.json({ code: 200, message: '收藏成功', isFavorited: true });
    }
});
app.get('/api/interactions/status', authMiddleware, async (req, res) => {
    const [likes] = await db.query('SELECT * FROM likes WHERE user_id = ? AND article_id = ?', [req.user.id, req.query.articleId]);
    const [favs] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND article_id = ?', [req.user.id, req.query.articleId]);
    res.json({ code: 200, isLiked: likes.length > 0, isFavorited: favs.length > 0 });
});

// [公开接口]
// [Public API]
// [埋点] 记录一次真实访问
// [Tracking] Log a real visit
app.post('/api/log-visit', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // 插入记录到数据库
        // Insert record into database
        await db.query('INSERT INTO site_visits (ip_address) VALUES (?)', [ip]);
        res.json({ code: 200, message: 'Visit logged' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/hub/articles', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * pageSize;
    let currentUserId = 0;
    if (req.headers.authorization) {
        try { currentUserId = jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY).id; } catch (e) {}
    }
    const sql = `
        SELECT a.*, u.username, u.avatar,
            (SELECT COUNT(*) FROM likes WHERE user_id = ? AND article_id = a.id) as is_liked,
            (SELECT COUNT(*) FROM favorites WHERE user_id = ? AND article_id = a.id) as is_favorited
        FROM articles a JOIN userinfo u ON a.user_id = u.id 
        WHERE a.is_public = 1 AND a.status != 'draft'
        ORDER BY a.create_time DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(sql, [currentUserId, currentUserId, pageSize, offset]);
    const result = rows.map(item => ({ ...item, is_liked: item.is_liked > 0, is_favorited: item.is_favorited > 0 }));
    res.json({ code: 200, data: result });
});

// app.js - 添加在 [公开接口] 区域

// [数据可视化中心] 聚合统计接口
// [Data Viz Center] Aggregated Stats API
app.get('/api/visual/center', async (req, res) => {
    try {
        // 1. 获取轮播图 (来自 carousels 表)
        // 1. Get Carousels
        const [carousels] = await db.query('SELECT * FROM carousels LIMIT 5');

        // 2. 统计数据
        // 2. Stats Data
        // 注意：因为没有专门的 "Hub页面浏览量" 表，我们这里用 "全站文章总阅读量" 作为 "内容浏览热度"
        // Note: Using "Total Article Views" as "Content Heat" since there is no specific Hub View table.
        // 如果你需要精确记录 Hub 页面访问，需要建新表。这里先用现有数据聚合。
        // If precise Hub tracking is needed, create a new table. Using aggregated data for now.
        const [viewStats] = await db.query('SELECT SUM(views) as totalViews FROM articles');
        const [userStats] = await db.query('SELECT COUNT(*) as totalUsers FROM userinfo');
        const [visitStats] = await db.query('SELECT COUNT(*) as total FROM site_visits');

        // 3. 分类分布 (饼图数据)
        // 3. Category Distribution (Pie Chart)
        const [categoryStats] = await db.query('SELECT category, COUNT(*) as value FROM articles WHERE is_public = 1 GROUP BY category');

        // 4. 最近活跃趋势 (近7天文章发布量 - 折线图数据)
        // 4. Recent Activity Trend (Last 7 days article count - Line Chart)
        const [trendStats] = await db.query(`
            SELECT DATE_FORMAT(create_time, '%m-%d') as date, COUNT(*) as count 
            FROM articles 
            WHERE create_time > DATE_SUB(NOW(), INTERVAL 7 DAY) 
            GROUP BY date 
            ORDER BY date ASC
        `);

        res.json({
            code: 200,
            data: {
               carousels,
                stats: {
                    totalViews: viewStats[0].totalViews || 0,
                    totalUsers: userStats[0].totalUsers || 0,
                    visitorCount: visitStats[0].total // ✨ 替换为真实数据
                },
                charts: { categories: categoryStats, trend: trendStats }
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// app.js - 请将这段代码添加到 [公开接口] 区域

// 1. 获取推荐创作者
// 1. Get Recommended Creators
app.get('/api/hub/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, avatar, bio FROM userinfo LIMIT 10');
        res.json({ code: 200, data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. 获取热门话题
// 2. Get Trending Topics
app.get('/api/hub/topics', async (req, res) => {
    try {
        const sql = `SELECT category, COUNT(*) as count FROM articles WHERE is_public = 1 AND status != 'draft' GROUP BY category ORDER BY count DESC LIMIT 10`;
        const [rows] = await db.query(sql);
        res.json({ code: 200, data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. 获取排行榜 (影响力榜 & 热门文章)
// 3. Get Rankings (Influencers & Hot Articles)
app.get('/api/hub/ranks', async (req, res) => {
    try {
        // 作者榜：按粉丝数排序
        // Author Rank: Sort by followers
        const sqlAuthors = `SELECT u.id, u.username, u.avatar, u.bio, COUNT(f.follower_id) as fansCount FROM userinfo u LEFT JOIN follows f ON u.id = f.followed_id GROUP BY u.id ORDER BY fansCount DESC LIMIT 10`;
        // 文章榜：按阅读量排序
        // Article Rank: Sort by views
        const sqlArticles = `SELECT a.id, a.title, a.views, a.create_time, u.username, u.avatar FROM articles a JOIN userinfo u ON a.user_id = u.id WHERE a.is_public = 1 AND a.status != 'draft' ORDER BY a.views DESC LIMIT 10`;
        
        const [authors] = await db.query(sqlAuthors);
        const [articles] = await db.query(sqlArticles);
        res.json({ code: 200, data: { authors, articles } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. 用户搜索接口
// 4. User Search API
app.get('/api/search/users', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ code: 200, data: [] });
    const sql = `SELECT id, username, avatar, bio FROM userinfo WHERE username LIKE ? LIMIT 20`;
    try { 
        const [rows] = await db.query(sql, [`%${q}%`]); 
        res.json({ code: 200, data: rows }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/blog/:userId', async (req, res) => {
    const userId = req.params.userId;
    const [u] = await db.query('SELECT id, username, avatar, bio FROM userinfo WHERE id = ?', [userId]);
    const [a] = await db.query('SELECT * FROM articles WHERE user_id = ? AND is_public = 1 AND status != "draft" ORDER BY create_time DESC', [userId]);
    const [f1] = await db.query('SELECT COUNT(*) as total FROM follows WHERE followed_id = ?', [userId]); 
    const [f2] = await db.query('SELECT COUNT(*) as total FROM follows WHERE follower_id = ?', [userId]); 
    res.json({ code: 200, data: { blogger: u[0], articles: a, stats: { followers: f1[0].total, following: f2[0].total } } });
});
app.get('/api/blog/:userId/carousels', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM carousels WHERE user_id = ?', [req.params.userId]);
    res.json({ code: 200, data: rows });
});

// [管理员接口]
// [Admin API]

// ================= [管理员-轮播图管理接口] =================
// ================= [Admin - Carousel Management] =================

// 1. 获取所有轮播图列表 (用于 Admin.vue 管理)
// 1. Get All Carousels (For Admin.vue)
app.get('/api/admin/carousels', adminMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM carousels ORDER BY id DESC');
        res.json({ code: 200, data: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. 添加新轮播图
app.post('/api/admin/carousels', adminMiddleware, async (req, res) => {
    const { name, url } = req.body;
    if (!url) return res.json({ code: 400, message: '图片地址不能为空' });
    try {
        // 记录操作管理员的 id
        await db.query('INSERT INTO carousels (name, url, user_id) VALUES (?, ?, ?)', 
            [name || '未命名', url, req.user.id]);
        res.json({ code: 200, message: '添加成功' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. 删除轮播图
app.delete('/api/admin/carousels/:id', adminMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM carousels WHERE id = ?', [req.params.id]);
        res.json({ code: 200, message: '删除成功' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ✨✨✨ 聚合统计接口 ✨✨✨
// ✨✨✨ Aggregated Stats API ✨✨✨
app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
    try {
        // 卡片数据
        // Card Data
        const [users] = await db.query('SELECT COUNT(*) as total FROM userinfo');
        const [articles] = await db.query('SELECT COUNT(*) as total FROM articles');
        const [views] = await db.query('SELECT SUM(views) as total FROM articles');
        const [comments] = await db.query('SELECT COUNT(*) as total FROM comments');

        // 图表数据
        // Chart Data
        const [userTrend] = await db.query("SELECT DATE_FORMAT(create_time, '%m-%d') as date, COUNT(*) as count FROM userinfo WHERE create_time > DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY date ORDER BY date ASC");
        const [categoryDist] = await db.query("SELECT category, COUNT(*) as count FROM articles GROUP BY category");
        const [statusDist] = await db.query("SELECT status, COUNT(*) as count FROM articles GROUP BY status");
        const [topAuthors] = await db.query("SELECT u.username, SUM(a.views) as total_views FROM articles a JOIN userinfo u ON a.user_id = u.id GROUP BY u.id ORDER BY total_views DESC LIMIT 5");
        const [commentTrend] = await db.query("SELECT DATE_FORMAT(create_time, '%m-%d') as date, COUNT(*) as count FROM comments WHERE create_time > DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY date ORDER BY date ASC");
        const [visitors] = await db.query('SELECT COUNT(*) as total FROM site_visits');

        res.json({ code: 200, data: {
            cards: { 
                userCount: users[0].total, 
                articleCount: articles[0].total, 
                viewCount: views[0].total || 0, 
                commentCount: comments[0].total || 0,
                visitorCount: visitors[0].total // ✨ 这里把真实数据传给 Admin.vue / ✨ Passing real data to Admin.vue
            },
            charts: { userTrend, categoryDist, statusDist, topAuthors, commentTrend }
        }});
    } catch(e) { res.status(500).json({ error: e.message }) }
});

app.get('/api/admin/users', adminMiddleware, async (req, res) => {
    const { q } = req.query;
    let sql = 'SELECT id, username, email, avatar, role, status, credit_score, create_time FROM userinfo';
    let params = [];
    if(q) { sql += ' WHERE username LIKE ?'; params.push(`%${q}%`); }
    sql += ' ORDER BY id DESC LIMIT 50';
    const [rows] = await db.query(sql, params);
    res.json({ code: 200, data: rows });
});
app.put('/api/admin/users/:id/status', adminMiddleware, async (req, res) => {
    await db.query('UPDATE userinfo SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ code: 200, message: '操作成功' });
});
app.put('/api/admin/users/:id/unfreeze', adminMiddleware, async (req, res) => {
    await db.query('UPDATE userinfo SET frozen_until = NULL, login_fail_count = 0 WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '已解冻' });
});
app.get('/api/admin/articles', adminMiddleware, async (req, res) => {
    const { q } = req.query;
    let sql = `SELECT a.id, a.title, a.category, a.views, a.create_time, u.username FROM articles a JOIN userinfo u ON a.user_id = u.id`;
    let params = [];
    if(q) { sql += ' WHERE a.title LIKE ?'; params.push(`%${q}%`); }
    sql += ' ORDER BY a.create_time DESC LIMIT 50';
    const [rows] = await db.query(sql, params);
    res.json({ code: 200, data: rows });
});
app.delete('/api/admin/articles/:id', adminMiddleware, async (req, res) => {
    await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '文章已强制下架' });
});
app.get('/api/admin/reports', adminMiddleware, async (req, res) => {
    const sql = `SELECT r.id, r.reason, r.create_time, c.content as comment_content, c.user_id as offender_id, u.username as offender_name, u.credit_score, c.id as comment_id FROM comment_reports r JOIN comments c ON r.comment_id = c.id JOIN userinfo u ON c.user_id = u.id WHERE r.status = 0`;
    const [rows] = await db.query(sql);
    res.json({ code: 200, data: rows });
});
app.post('/api/admin/reports/handle', adminMiddleware, async (req, res) => {
    const { reportId, commentId, offenderId, deductScore } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM comments WHERE id = ?', [commentId]); 
        if (deductScore) await conn.query('UPDATE userinfo SET credit_score = credit_score - 10 WHERE id = ?', [offenderId]); 
        await conn.query('UPDATE comment_reports SET status = 1 WHERE id = ?', [reportId]);
        await conn.commit();
        res.json({ code: 200, message: '处理完成' });
    } catch (e) { await conn.rollback(); res.status(500).json({ error: e.message }); } finally { conn.release(); }
});
app.get('/api/dev-logs', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM dev_logs ORDER BY create_time DESC');
    res.json({ code: 200, data: rows });
});
app.post('/api/admin/dev-logs', adminMiddleware, async (req, res) => {
    await db.query('INSERT INTO dev_logs (version, content, type, author, commit_hash) VALUES (?, ?, ?, ?, ?)', [req.body.version, req.body.content, req.body.type, req.body.author, 'HEAD']);
    res.json({ code: 200, message: '发布成功' });
});
app.delete('/api/admin/dev-logs/:id', adminMiddleware, async (req, res) => {
    await db.query('DELETE FROM dev_logs WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
});

// Vue Router FallbackFGF
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => { console.log('✅ 服务运行端口 3000 (安全加固版) / Service running on port 3000 (Secured)'); });