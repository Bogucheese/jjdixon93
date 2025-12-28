// server/check-health.js
import db from './db.js';
import net from 'net';

const GREEN = '\x1b[32m%s\x1b[0m';
const RED = '\x1b[31m%s\x1b[0m';

console.log('🔍 开始系统自检...');

// 1. 检查数据库连接
async function checkDB() {
    try {
        console.log('⏳ 正在尝试连接数据库...');
        const conn = await db.getConnection();
        const [rows] = await conn.query('SELECT 1');
        conn.release();
        console.log(GREEN, '✅ [数据库] 连接成功！');
    } catch (err) {
        console.log(RED, '❌ [数据库] 连接失败！');
        console.error('   原因:', err.message);
        console.error('   提示: 请检查 server/db.js 中的密码和IP是否正确。');
    }
}

// 2. 检查端口占用
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(RED, `❌ [端口] ${port} 被占用！这可能导致服务启动失败。`);
            } else {
                console.log(RED, `❌ [端口] ${port} 检测出错: ${err.message}`);
            }
            resolve();
        });
        server.once('listening', () => {
            console.log(GREEN, `✅ [端口] ${port} 空闲可用。`);
            server.close();
            resolve();
        });
        server.listen(port);
    });
}

async function run() {
    await checkDB();
    await checkPort(3000); // 后端端口
    process.exit();
}

run();