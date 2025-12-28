<template>
  <div class="visual-container">
    <header class="visual-header">
      <div class="logo-box" @click="$router.push('/')">
        <span class="back-arrow">←</span>
        <span>MySpace 数据视界</span>
      </div>
      <div class="header-right">
        <span class="live-tag">● 实时数据</span>
      </div>
    </header>

    <main class="dashboard-grid">
      <section class="hero-carousel animate__animated animate__fadeInDown">
        <el-carousel :interval="4000" type="card" height="300px">
          <el-carousel-item v-for="item in carousels" :key="item.id">
            <div class="carousel-card" :style="{ backgroundImage: `url(${item.url})` }">
              <div class="carousel-content">
                <h3>{{ item.name || '精选内容' }}</h3>
              </div>
            </div>
          </el-carousel-item>
          <el-carousel-item v-if="carousels.length === 0">
             <div class="carousel-card default-bg">
                <h3>暂无轮播图</h3>
             </div>
          </el-carousel-item>
        </el-carousel>
      </section>

      <section class="stats-row animate__animated animate__fadeInUp">
        <div class="stat-card blue">
          <div class="icon-bg"><el-icon><View /></el-icon></div>
          <div class="stat-num">{{ formatNum(overview.visitorCount) }}</div>
          <div class="stat-label">游客浏览人次 (估)</div>
        </div>
        <div class="stat-card purple">
          <div class="icon-bg"><el-icon><UserFilled /></el-icon></div>
          <div class="stat-num">{{ formatNum(overview.totalUsers) }}</div>
          <div class="stat-label">注册用户总数</div>
        </div>
        <div class="stat-card orange">
          <div class="icon-bg"><el-icon><Reading /></el-icon></div>
          <div class="stat-num">{{ formatNum(overview.totalViews) }}</div>
          <div class="stat-label">全站内容阅读量</div>
        </div>
      </section>

      <section class="charts-row animate__animated animate__fadeInUp" style="animation-delay: 0.2s">
        <div class="chart-card">
          <div class="card-title">灵感分布 (Topics)</div>
          <div ref="pieChartRef" class="chart-box"></div>
        </div>
        
        <div class="chart-card wide">
          <div class="card-title">近7天创作活力</div>
          <div ref="lineChartRef" class="chart-box"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import * as echarts from 'echarts'
import { View, UserFilled, Reading } from '@element-plus/icons-vue'

const router = useRouter()
const carousels = ref([])
const overview = ref({ totalViews: 0, totalUsers: 0, visitorCount: 0 })

// 图表 DOM 引用
const pieChartRef = ref(null)
const lineChartRef = ref(null)

const formatNum = (num) => {
  return num ? num.toLocaleString() : '0'
}

const initCharts = (chartData) => {
  // 1. 初始化饼图
  const pieChart = echarts.init(pieChartRef.value)
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: '文章分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        data: chartData.categories.map(c => ({ value: c.value, name: c.category }))
      }
    ]
  }
  pieChart.setOption(pieOption)

  // 2. 初始化折线图
  const lineChart = echarts.init(lineChartRef.value)
  const lineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: chartData.trend.map(t => t.date) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新增文章',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: { opacity: 0.3, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#409EFF'}, {offset: 1, color: '#fff'}]) },
        itemStyle: { color: '#409EFF' },
        data: chartData.trend.map(t => t.count)
      }
    ]
  }
  lineChart.setOption(lineOption)

  // 窗口大小改变时自适应
  window.addEventListener('resize', () => {
    pieChart.resize()
    lineChart.resize()
  })
}

onMounted(async () => {
  try {
    const res = await api.get('/visual/center')
    if (res.data.code === 200) {
      const data = res.data.data
      carousels.value = data.carousels || []
      overview.value = data.stats
      
      // 确保 DOM 渲染后再画图
      nextTick(() => {
        initCharts(data.charts)
      })
    }
  } catch (e) {
    console.error('获取可视化数据失败', e)
  }
})
</script>

<style scoped>
.visual-container {
  min-height: 100vh;
  background: #F2F4F7;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #2c3e50;
}

.visual-header {
  height: 60px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-box {
  font-weight: 800;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: color 0.3s;
}
.logo-box:hover { color: #409EFF; }
.back-arrow { font-size: 24px; }

.live-tag {
  color: #FF6B6B;
  font-weight: bold;
  font-size: 14px;
  animation: pulse 2s infinite;
}

.dashboard-grid {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 轮播图样式 */
.carousel-card {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.default-bg { background-color: #2c3e50; display: flex; align-items: center; justify-content: center; color: white; }
.carousel-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}
.carousel-content h3 { margin: 0; font-size: 20px; }

/* 统计卡片样式 */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s;
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }

/* 装饰背景 */
.stat-card::after { content: ''; position: absolute; width: 100px; height: 100px; border-radius: 50%; top: -30px; right: -30px; opacity: 0.1; }
.stat-card.blue::after { background: #409EFF; }
.stat-card.purple::after { background: #8B5CF6; }
.stat-card.orange::after { background: #FF9F43; }

.icon-bg { font-size: 30px; margin-bottom: 10px; color: #2c3e50; }
.stat-num { font-size: 32px; font-weight: 900; margin-bottom: 5px; color: #2c3e50; }
.stat-label { color: #94a3b8; font-size: 14px; font-weight: 600; }

/* 图表样式 */
.charts-row { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; min-height: 400px; }
.chart-card { background: white; border-radius: 24px; padding: 25px; display: flex; flex-direction: column; }
.card-title { font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #2c3e50; }
.chart-box { flex: 1; min-height: 300px; width: 100%; }

@media (max-width: 768px) {
  .stats-row, .charts-row { grid-template-columns: 1fr; }
}
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>