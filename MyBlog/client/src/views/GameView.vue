<template>
  <div class="game-view-container animate__animated animate__fadeIn">
    <div class="game-card">
      <div class="game-header">
        <el-button @click="$router.push('/')" round icon="ArrowLeft">返回社区</el-button>
        <div class="game-title">
          <span class="rocket">🚀</span> SPACE JUMP
        </div>
        <div class="scores">
          <div class="score-item">
            <span class="label">SCORE</span>
            <span class="val">{{ score }}</span>
          </div>
          <div class="score-item best">
            <span class="label">BEST</span>
            <span class="val">{{ highScore }}</span>
          </div>
        </div>
      </div>

      <div class="canvas-wrapper" @mousedown="handleJump" @touchstart="handleJump">
        <canvas ref="gameCanvas" width="800" height="300"></canvas>
        
        <div v-if="!isStarted" class="game-overlay">
          <div v-if="!gameOver" class="overlay-content">
            <h2>灵感大冒险</h2>
            <p>跳过那些阻碍你前进的 Bug</p>
            <el-button type="primary" size="large" @click.stop="startGame">启动引擎</el-button>
            <div class="control-tip">点击或按 [ 空格键 ] 跳跃</div>
          </div>
          <div v-else class="overlay-content">
            <h2 class="game-over-title">MISSION FAILED</h2>
            <div class="final-score">{{ score }}</div>
            <p>分数已同步至社区榜单</p>
            <el-button type="danger" size="large" @click.stop="startGame">重新充能</el-button>
          </div>
        </div>
      </div>

      <div class="leaderboard-section">
        <div class="section-title">
          <el-icon><Trophy /></el-icon> 社区大神榜 (TOP 10)
        </div>
        <div class="rank-grid">
          <div v-for="(item, index) in rankData" :key="index" class="rank-card">
            <span class="rank-num" :class="'top-' + (index + 1)">{{ index + 1 }}</span>
            <el-avatar :size="32" :src="item.avatar">{{ item.username[0] }}</el-avatar>
            <span class="rank-name">{{ item.username }}</span>
            <span class="rank-score">{{ item.score }} <small>pts</small></span>
          </div>
          <div v-if="rankData.length === 0" class="rank-empty">暂无排名，快来占领高地！</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/utils/api';
import { ArrowLeft, Trophy } from '@element-plus/icons-vue';

// 游戏状态
const gameCanvas = ref(null);
const score = ref(0);
const highScore = ref(localStorage.getItem('game_high_score') || 0);
const isStarted = ref(false);
const gameOver = ref(false);
const rankData = ref([]);

// 角色数据 (头像)
const userAvatar = localStorage.getItem('avatar') || '';
const avatarImg = new Image();
const isAvatarLoaded = ref(false);

// 物理参数
let ctx, animationId;
let player = { x: 80, y: 200, w: 45, h: 45, dy: 0, jumpForce: 13, gravity: 0.7, grounded: false };
let obstacles = [];
let gameSpeed = 4.5;
let frameCount = 0;

// 1. 预加载头像并处理裁剪
const preloadAvatar = () => {
  const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  avatarImg.src = userAvatar || defaultAvatar;
  avatarImg.onload = () => { isAvatarLoaded.value = true; };
};

// 2. 获取排行榜
const fetchRank = async () => {
  try {
    const res = await api.get('/game/rank');
    if (res.data.code === 200) rankData.value = res.data.data;
  } catch (e) { console.error("排行拉取失败"); }
};

// 3. 开始游戏
const startGame = () => {
  isStarted.value = true;
  gameOver.value = false;
  score.value = 0;
  obstacles = [];
  gameSpeed = 4.5;
  player.y = 200;
  player.dy = 0;
  gameLoop();
};

// 4. 跳跃逻辑
const handleJump = (e) => {
  if (e) e.preventDefault();
  if (player.grounded && isStarted.value) {
    player.dy = -player.jumpForce;
    player.grounded = false;
  }
};

// 5. 核心循环
const gameLoop = () => {
  if (!isStarted.value) return;
  ctx.clearRect(0, 0, 800, 300);

  // 绘制背景线条 (科技感装饰)
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for(let i=0; i<800; i+=40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 300); ctx.stroke();
  }

  // 绘制地面
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 250); ctx.lineTo(800, 250); ctx.stroke();

  // 玩家物理更新
  player.dy += player.gravity;
  player.y += player.dy;
  if (player.y + player.h > 250) {
    player.y = 250 - player.h;
    player.dy = 0;
    player.grounded = true;
  }

  // ✨ 绘制玩家头像 (带圆角和裁剪)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.w, player.h, 12);
  ctx.clip();
  if (isAvatarLoaded.value) {
    ctx.drawImage(avatarImg, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle = '#409EFF';
    ctx.fill();
  }
  ctx.restore();
  
  // 玩家外框
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.strokeRect(player.x, player.y, player.w, player.h);

  // 障碍物逻辑
  frameCount++;
  if (frameCount % 90 === 0) {
    const h = 30 + Math.random() * 30;
    obstacles.push({ x: 800, y: 250 - h, w: 30, h: h, color: '#FF6B6B' });
  }

  obstacles.forEach((obs, i) => {
    obs.x -= gameSpeed;
    
    // 绘制障碍物 (红色 Bug 块)
    ctx.fillStyle = obs.color;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 4);
    ctx.fill();

    // 碰撞检测
    if (
      player.x < obs.x + obs.w &&
      player.x + player.w > obs.x &&
      player.y < obs.y + obs.h &&
      player.y + player.h > obs.y
    ) {
      endGame();
    }

    // 计分
    if (obs.x + obs.w < 0) {
      obstacles.splice(i, 1);
      score.value++;
      if (score.value % 10 === 0) gameSpeed += 0.2; // 逐渐提速
    }
  });

  animationId = requestAnimationFrame(gameLoop);
};

// 6. 结束游戏
const endGame = async () => {
  isStarted.value = false;
  gameOver.value = true;
  cancelAnimationFrame(animationId);
  
  // 更新最高分
  if (score.value > highScore.value) {
    highScore.value = score.value;
    localStorage.setItem('game_high_score', score.value);
  }

  // 提交分数
  if (localStorage.getItem('token')) {
    try {
      await api.post('/game/score', { score: score.value });
      fetchRank(); // 刷新榜单
    } catch (e) { console.error("分数上传失败"); }
  }
};

// 监听键盘
const handleKey = (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    handleJump();
  }
};

onMounted(() => {
  ctx = gameCanvas.value.getContext('2d');
  preloadAvatar();
  fetchRank();
  window.addEventListener('keydown', handleKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
  cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.game-view-container {
  min-height: 100vh;
  background-color: #f2f4f7;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.game-card {
  width: 100%;
  max-width: 840px;
  background: white;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.game-title {
  font-size: 20px;
  font-weight: 900;
  color: #2c3e50;
  letter-spacing: 2px;
}

.scores {
  display: flex;
  gap: 20px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.score-item .label {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
}

.score-item .val {
  font-size: 24px;
  font-weight: 900;
  font-family: monospace;
  color: #2c3e50;
}

.best .val {
  color: #E6A23C;
}

.canvas-wrapper {
  position: relative;
  background: #fcfdfe;
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
}

.game-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.overlay-content {
  text-align: center;
}

.overlay-content h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
}

.game-over-title {
  color: #FF6B6B;
}

.final-score {
  font-size: 64px;
  font-weight: 900;
  color: #2c3e50;
  margin: 10px 0;
}

.control-tip {
  margin-top: 20px;
  font-size: 13px;
  color: #94a3b8;
}

/* 排行榜样式 */
.leaderboard-section {
  margin-top: 35px;
}

.section-title {
  font-weight: 800;
  margin-bottom: 15px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.rank-card {
  background: #f8fafc;
  padding: 12px 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-num {
  font-weight: 900;
  width: 24px;
  color: #cbd5e1;
}

.top-1 { color: #FFD700; }
.top-2 { color: #C0C0C0; }
.top-3 { color: #CD7F32; }

.rank-name {
  flex: 1;
  font-weight: 700;
  font-size: 14px;
  color: #475569;
}

.rank-score {
  font-weight: 800;
  color: #409EFF;
}

.rank-empty {
  grid-column: span 2;
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-style: italic;
}

@media (max-width: 768px) {
  .rank-grid { grid-template-columns: 1fr; }
  .game-card { padding: 20px; }
}
</style>