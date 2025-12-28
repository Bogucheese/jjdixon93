import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    // ✨ 本地开发时：填你云服务器的公网 IP (例如 129.28.35.152)
    // ✨ Local Dev: Use public IP of your cloud server (e.g., 129.28.35.152)
    // ✨ 部署到云服务器后：改成 'localhost' (因为代码和数据库都在同一台机器上)
    // ✨ Production: Change to 'localhost' (since code and DB are on the same machine)
    host: process.env.DB_HOST || 'localhost', 

    user: process.env.DB_USER || 'root',            // 你的数据库用户名 / Your DB username
    password: process.env.DB_PASSWORD, // ⚠️ 替换为你的真实密码 / Replace with real password
    database: process.env.DB_NAME || 'myblog',      // ✅ 这里对应你发给我的数据库名 / Matches your DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试连接
pool.getConnection()
    .then(conn => {
        console.log('✅ 成功连接到 myblog 数据库');
        conn.release();
    })
    .catch(err => {
        console.error('❌ 数据库连接失败:', err.message);
        console.error('   -> 请检查 IP 是否正确，或云服务器防火墙是否放行了 3306 端口');
    });

export default pool;
