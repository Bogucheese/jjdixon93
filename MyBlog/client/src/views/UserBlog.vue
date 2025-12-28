<template>
  <div class="island-layout">
    
    <aside class="nav-island">
      <div class="logo-area" @click="$router.push('/')" style="cursor: pointer;">
        <div class="logo-box">M</div><span class="logo-text">MySpace</span>
      </div>
      <nav class="menu-list">
        <div class="menu-item" @click="$router.push('/')">
          <div class="icon-box"><el-icon><Compass /></el-icon></div><span class="label">广场</span>
        </div>
        <div class="menu-item" v-if="isLogin" @click="$router.push('/dashboard')">
          <div class="icon-box"><el-icon><UserFilled /></el-icon></div><span class="label">我的</span>
        </div>
      </nav>
    </aside>

    <main class="feed-island">
      <div class="hero-island animate__animated animate__fadeIn">
        <div class="cover-bg"></div>
        <div class="hero-content">
          <el-avatar :size="100" :src="blogger.avatar" class="hero-avatar">
            {{ blogger.username ? blogger.username.charAt(0) : 'U' }}
          </el-avatar>
          
          <div class="hero-text">
            <h1>{{ blogger.username }}</h1>
            <p class="bio">{{ blogger.bio || '这个创作者很神秘，还没有写简介' }}</p>
            
            <div class="hero-stats">
              <span><b>{{ totalArticleCount }}</b> 文章</span>
              <span><b>{{ followStats.following }}</b> 关注</span>
              <span><b>{{ followStats.followers }}</b> 粉丝</span>
            </div>
          </div>

          <div class="hero-actions">
            <el-button v-if="isMe" round @click="$router.push('/settings')">编辑资料</el-button>
            
            <template v-else>
              <el-button 
                v-if="isFollowing" 
                class="followed-btn" 
                round 
                @mouseenter="hoverText='取消关注'" 
                @mouseleave="hoverText='已关注'"
                @click="toggleFollow"
              >
                {{ hoverText }}
              </el-button>
              <el-button 
                v-else 
                type="primary" 
                round 
                class="follow-btn" 
                @click="toggleFollow"
              >
                + 关注
              </el-button>
            </template>
          </div>
        </div>
      </div>

      <div class="carousel-island" v-if="carousels.length > 0">
        <el-carousel height="240px" :interval="4000" type="card">
          <el-carousel-item v-for="item in carousels" :key="item.id">
            <div class="carousel-wrapper">
              <img :src="item.url" class="c-img">
              <div class="c-title">{{ item.name }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="section-title">
        发布动态 
        <span v-if="isTruncated" style="font-size: 12px; color: #f56c6c; margin-left: 10px; font-weight: normal;">
          (数据量过大，仅显示最新 50 条)
        </span>
      </div>
      
      <div class="feed-stream">
        <el-empty v-if="displayArticles.length === 0" description="博主暂无公开文章" />
        
        <div v-for="item in displayArticles" :key="item.id" class="post-island animate__animated animate__fadeInUp" @click="$router.push(`/article/${item.id}`)">
          <div class="island-header">
            <span class="category-pill-small">{{ item.category }}</span>
            <span class="time-tag">{{ new Date(item.create_time).toLocaleDateString() }}</span>
          </div>
          <div class="island-body">
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary || '暂无摘要...' }}</p>
          </div>
          <div class="island-footer">
            <div class="stat-pill"><el-icon><View /></el-icon> {{ item.views }}</div>
            <div class="stat-pill"><el-icon><Pointer /></el-icon> {{ item.likes_count }}</div>
            <div class="stat-pill"><el-icon><ChatLineRound /></el-icon> {{ item.comments_count }}</div>
          </div>
        </div>
      </div>
    </main>

    <aside class="widget-island">
      <div class="widget-box">
        <div class="widget-title">创作领域</div>
        <div id="chart2" style="height: 200px; width: 100%;"></div>
      </div>
    </aside>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Compass, UserFilled, View, Pointer, ChatLineRound } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const blogger = ref({})
const displayArticles = ref([]) // 用于页面渲染的列表（切片后）
const allArticlesData = ref([]) // 存储全部数据用于图表统计
const carousels = ref([])
const followStats = ref({ followers: 0, following: 0 }) 
const isFollowing = ref(false) 
const hoverText = ref('已关注') 
const isTruncated = ref(false) // 标记是否触发了防崩溃机制

const isLogin = !!localStorage.getItem('token')

// 即使切片显示，总数也要显示真实的
const totalArticleCount = computed(() => allArticlesData.value.length)

// 判断是否是自己
const isMe = computed(() => {
    return localStorage.getItem('username') === blogger.value.username
})

onMounted(async () => {
    const userId = route.params.id 
    try {
        // 1. 获取博主数据
        const resBlog = await api.get(`/blog/${userId}`)
        if (resBlog.data.code === 200) {
            blogger.value = resBlog.data.data.blogger
            
            // ✨✨✨ 核心修复：防崩溃处理 ✨✨✨
            const rawArticles = resBlog.data.data.articles || []
            allArticlesData.value = rawArticles // 保存全量数据给图表用
            
            if (rawArticles.length > 50) {
                // 如果文章超过50篇，只渲染前50篇，防止DOM爆炸
                displayArticles.value = rawArticles.slice(0, 50)
                isTruncated.value = true
                ElMessage.warning(`检测到数据量异常(${rawArticles.length}条)，已启动性能保护模式`)
            } else {
                displayArticles.value = rawArticles
                isTruncated.value = false
            }

            followStats.value = resBlog.data.data.stats || { followers: 0, following: 0 }
            
            // 初始化图表 (使用全量数据统计)
            initCharts(rawArticles)
        }

        // 2. 获取轮播
        const resCar = await api.get(`/blog/${userId}/carousels`)
        carousels.value = resCar.data.data

        // 3. 检查关注状态
        if (isLogin && !isMe.value) {
            const resFollow = await api.get(`/follow/status?targetId=${userId}`)
            isFollowing.value = resFollow.data.isFollowing
        }

    } catch (err) { console.error(err) }
})

const toggleFollow = async () => {
    if (!isLogin) return router.push('/login')
    // 防止自己关注自己
    if (isMe.value) return ElMessage.warning('不能关注自己')
    
    try {
        if (isFollowing.value) {
            // 取关
            await api.post('/unfollow', { targetId: route.params.id })
            isFollowing.value = false
            followStats.value.followers = Math.max(0, followStats.value.followers - 1)
            ElMessage.success('已取消关注')
        } else {
            // 关注
            await api.post('/follow', { targetId: route.params.id })
            isFollowing.value = true
            followStats.value.followers++ 
            ElMessage.success('关注成功')
        }
    } catch (err) {
        ElMessage.error(err.response?.data?.message || '操作失败')
    }
}

const initCharts = (articlesData) => {
    // 统计文章分类数据 (使用全量数据)
    const categoryMap = {}
    articlesData.forEach(art => {
        const cat = art.category || '其他'
        categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })
    const chartData = Object.keys(categoryMap).map(k => ({ value: categoryMap[k], name: k }))

    nextTick(() => {
        const chart2Dom = document.getElementById('chart2'); 
        if (!chart2Dom) return
        // 销毁旧实例防止内存泄漏
        if (echarts.getInstanceByDom(chart2Dom)) {
            echarts.dispose(chart2Dom)
        }
        const myChart2 = echarts.init(chart2Dom)
        myChart2.setOption({
            tooltip: { trigger: 'item' },
            series: [{ 
                type: 'pie', 
                radius: ['40%', '70%'], 
                itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 }, 
                data: chartData.length ? chartData : [{value:0, name:'暂无数据'}] 
            }] 
        })
    })
}
</script>

<style scoped>
/* 保持原样式，这里省略重复的 CSS 以节省篇幅，直接复用之前的 UserBlog.vue CSS 即可 */
.island-layout { display: flex; justify-content: center; gap: 30px; min-height: 100vh; background-color: #F2F4F7; padding: 30px; font-family: 'Plus Jakarta Sans', sans-serif; color: #2c3e50; }
.nav-island { width: 260px; display: flex; flex-direction: column; position: sticky; top: 30px; height: calc(100vh - 60px); }
.logo-area { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; padding-left: 10px; }
.logo-box { width: 48px; height: 48px; background: #2c3e50; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; box-shadow: 0 10px 20px rgba(44,62,80,0.3); }
.logo-text { font-size: 24px; font-weight: 800; letter-spacing: -1px; }
.menu-list { flex: 1; display: flex; flex-direction: column; gap: 15px; }
.menu-item { display: flex; align-items: center; gap: 15px; padding: 16px 20px; border-radius: 20px; background: white; color: #94a3b8; cursor: pointer; transition: 0.3s; }
.menu-item:hover { transform: translateX(5px); color: #2c3e50; }
.icon-box { font-size: 22px; } .label { font-weight: 600; font-size: 16px; }

.feed-island { width: 600px; display: flex; flex-direction: column; gap: 25px; }
.hero-island { background: white; border-radius: 24px; overflow: hidden; position: relative; padding-bottom: 20px; }
.cover-bg { height: 120px; background: linear-gradient(120deg, #a18cd1, #fbc2eb); }
.hero-content { padding: 0 30px; margin-top: -50px; position: relative; }
.hero-avatar { border: 5px solid white; background: #2c3e50; font-size: 40px; }
.hero-text { margin-top: 15px; }
.hero-text h1 { margin: 0; font-size: 28px; }
.hero-text .bio { color: #94a3b8; margin: 5px 0 15px; }
.hero-stats { display: flex; gap: 20px; font-size: 14px; color: #64748b; }
.hero-stats b { color: #2c3e50; }
.hero-actions { position: absolute; top: 60px; right: 30px; }

.follow-btn { width: 100px; font-weight: bold; background: #2c3e50; border-color: #2c3e50; transition: 0.2s; }
.follow-btn:hover { background: #404b57; }
.followed-btn { width: 100px; font-weight: bold; border: 1px solid #ddd; color: #2c3e50; }
.followed-btn:hover { border-color: #f56c6c; color: #f56c6c; background: #fef0f0; }

.carousel-island { background: white; border-radius: 24px; padding: 20px; }
.carousel-wrapper { position: relative; height: 100%; border-radius: 12px; overflow: hidden; }
.c-img { width: 100%; height: 100%; object-fit: cover; }
.c-title { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.5); color: white; padding: 8px; text-align: center; }

.section-title { font-weight: 800; margin-left: 10px; font-size: 18px; }
.feed-stream { display: flex; flex-direction: column; gap: 15px; }
.post-island { background: white; border-radius: 24px; padding: 25px; cursor: pointer; transition: 0.3s; border: 1px solid rgba(0,0,0,0.03); }
.post-island:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.06); }
.island-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.category-pill-small { background: #ecf5ff; color: #409EFF; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
.time-tag { font-size: 12px; color: #cbd5e1; }
.island-body h3 { font-size: 20px; margin: 0 0 10px; }
.island-body p { font-size: 15px; color: #64748b; }
.island-footer { margin-top: 15px; display: flex; gap: 10px; }
.stat-pill { background: #F8FAFC; padding: 6px 12px; border-radius: 12px; font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 5px; }

.widget-island { width: 300px; display: flex; flex-direction: column; gap: 25px; }
.widget-box { background: white; border-radius: 24px; padding: 25px; }
.widget-title { font-weight: 800; margin-bottom: 20px; }

@media (max-width: 1000px) { .nav-island, .widget-island { display: none; } .feed-island { width: 100%; } }
</style>