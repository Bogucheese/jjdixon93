const fs = require('fs-extra');
const path = require('path');

const src = path.join(__dirname, '../client', 'dist');
const dest = path.join(__dirname, 'dist');

async function move() {
    try {
        // 清理旧文件 / Cleaning old files
        console.log('🧹 正在清理旧文件...');
        await fs.remove(dest);
        
        // 移动前端打包文件 / Moving frontend build files
        console.log('🚚 正在移动前端打包文件...');
        await fs.copy(src, dest);
        
        // 成功 / Success
        console.log('✅ 成功！前端已集成到后端。现在可以运行 server/app.js 了。');
    } catch (err) {
        console.error(err);
    }
}
move();