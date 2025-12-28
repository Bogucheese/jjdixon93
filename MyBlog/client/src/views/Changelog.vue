<template>
  <div class="island-layout">
    
    <aside class="nav-island">
      <div class="logo-area" @click="$router.push('/')" style="cursor: pointer;">
        <div class="logo-box">M</div><span class="logo-text">MySpace</span>
      </div>
      <div class="menu-list">
        <div class="menu-item" @click="$router.push('/')">
          <div class="icon-box"><el-icon><Back /></el-icon></div><span class="label">返回广场</span>
        </div>
      </div>
    </aside>

    <main class="feed-island">
      <div class="log-header animate__animated animate__fadeInDown">
        <h1>🚀 开发日志</h1>
        <p>记录 MySpace 的每一个脚印</p>
      </div>

      <div class="timeline-container">
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in logs"
            :key="log.id"
            :timestamp="new Date(log.create_time).toLocaleString()"
            placement="top"
            :type="index === 0 ? 'primary' : ''"
            :hollow="index === 0"
            size="large"
            class="animate__animated animate__fadeInLeft"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="log-card">
              <div class="log-meta">
                <el-tag :type="getTypeColor(log.type)" effect="dark" class="version-tag">{{ log.version }}</el-tag>
                <span class="commit-hash">Commit: {{ log.commit_hash }}</span>
              </div>
              <div class="log-content">{{ log.content }}</div>
              <div class="log-author">
                <el-avatar :size="20" class="mini-avatar">A</el-avatar>
                <span>{{ log.author }} 发布</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        
        <el-empty v-if="logs.length === 0" description="暂无日志记录" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { Back } from '@element-plus/icons-vue'

const logs = ref([])

const fetchLogs = async () => {
  try {
    const res = await api.get('/dev-logs')
    logs.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

const getTypeColor = (type) => {
  const map = {
    feat: 'success', // 新功能
    fix: 'warning',  // 修复
    perf: 'primary', // 优化
    refactor: 'info' // 重构
  }
  return map[type] || 'info'
}

onMounted(fetchLogs)
</script>

<style scoped>
.island-layout { display: flex; justify-content: center; gap: 30px; min-height: 100vh; background-color: #F2F4F7; padding: 30px; font-family: 'Plus Jakarta Sans', sans-serif; color: #2c3e50; }
.nav-island { width: 260px; display: flex; flex-direction: column; position: sticky; top: 30px; height: calc(100vh - 60px); }
.logo-area { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; padding-left: 10px; }
.logo-box { width: 48px; height: 48px; background: #2c3e50; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; }
.logo-text { font-size: 24px; font-weight: 800; letter-spacing: -1px; }
.menu-item { display: flex; align-items: center; gap: 15px; padding: 16px 20px; border-radius: 20px; background: white; color: #94a3b8; cursor: pointer; transition: 0.3s; }
.menu-item:hover { transform: translateX(5px); color: #2c3e50; }

.feed-island { width: 680px; }

.log-header { margin-bottom: 40px; text-align: center; }
.log-header h1 { font-size: 32px; font-weight: 800; margin: 0 0 10px; color: #2c3e50; }
.log-header p { color: #94a3b8; margin: 0; }

.timeline-container { padding: 20px; }

.log-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
.log-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
.version-tag { font-weight: bold; }
.commit-hash { font-family: monospace; font-size: 12px; color: #cbd5e1; background: #f8fafc; padding: 2px 6px; border-radius: 4px; }
.log-content { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 15px; white-space: pre-wrap; }
.log-author { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; border-top: 1px dashed #f1f5f9; padding-top: 10px; }
.mini-avatar { background: #cbd5e1; font-size: 10px; }

@media (max-width: 1000px) { .nav-island { display: none; } .feed-island { width: 100%; } }
</style>