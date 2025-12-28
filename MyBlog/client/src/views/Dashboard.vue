<template>
  <div class="island-layout">
    
    <aside class="nav-island">
      <div class="logo-area">
        <div class="logo-box">M</div>
        <span class="logo-text">MySpace</span>
      </div>
      <nav class="menu-list">
        <div class="menu-item" @click="$router.push('/')">
          <div class="icon-box"><el-icon><Compass /></el-icon></div><span class="label">广场</span>
        </div>
        <div class="menu-item active">
          <div class="icon-box"><el-icon><UserFilled /></el-icon></div><span class="label">我的</span>
        </div>
        <div class="menu-item" @click="$router.push('/settings')">
          <div class="icon-box"><el-icon><Setting /></el-icon></div><span class="label">设置</span>
        </div>
      </nav>
      <div class="action-area">
        <div class="logout-btn" @click="logout">
          <el-icon><SwitchButton /></el-icon> 退出
        </div>
      </div>
    </aside>

    <main class="feed-island">
      <div class="dashboard-header">
        <div class="welcome-island">
          <h1>早安，{{ username }} ☀️</h1>
          <p>准备好开始今天的创作了吗？</p>
        </div>
        <div class="create-island" @click="$router.push('/editor')">
          <div class="create-icon"><el-icon><EditPen /></el-icon></div>
          <span>发动态</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-island purple">
          <div class="stat-num">{{ filteredArticles.length }}</div>
          <div class="stat-label">文章总数</div>
          <el-icon class="stat-bg-icon"><Document /></el-icon>
        </div>
        <div class="stat-island blue">
          <div class="stat-num">{{ totalViews }}</div>
          <div class="stat-label">全站阅读</div>
          <el-icon class="stat-bg-icon"><View /></el-icon>
        </div>
        <div class="stat-island orange">
          <div class="stat-num">{{ mediaList.length }}</div>
          <div class="stat-label">媒体素材</div>
          <el-icon class="stat-bg-icon"><Picture /></el-icon>
        </div>
      </div>

      <div class="section-header">
        <div class="tab-switch">
          <span :class="{ active: activeTab === 'my_post' }" @click="activeTab = 'my_post'">📄 我的发布</span>
          <span :class="{ active: activeTab === 'my_fav' }" @click="activeTab = 'my_fav'">⭐ 我的收藏</span>
        </div>
        <el-input v-model="searchKey" placeholder="搜索..." prefix-icon="Search" class="mini-search" />
      </div>

      <div class="feed-stream">
        <template v-if="activeTab === 'my_post'">
          <el-empty v-if="filteredArticles.length === 0" description="暂无动态，去发一条吧！" />
          <div v-for="article in filteredArticles" :key="article.id" class="manage-card">
            <div class="card-status" :class="article.is_public ? 'public' : 'private'"></div>
            <div class="card-content" @click="$router.push(`/article/${article.id}`)">
              <h4>{{ article.title || '无标题动态' }}</h4>
              <div class="meta-row">
                <span class="tag">{{ article.category }}</span>
                <span class="date">{{ new Date(article.create_time).toLocaleDateString() }}</span>
                <span class="views"><el-icon><View /></el-icon> {{ article.views }}</span>
                <span v-if="!article.is_public" class="private-lock"><el-icon><Lock /></el-icon> 私密</span>
              </div>
            </div>
            <div class="card-actions">
              <div class="action-btn delete" @click="deleteArticle(article.id)"><el-icon><Delete /></el-icon></div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-empty v-if="filteredFavorites.length === 0" description="还没收藏任何内容哦" />
          <div v-for="fav in filteredFavorites" :key="fav.id" class="manage-card fav-style">
            <div class="card-content" @click="$router.push(`/article/${fav.id}`)">
              <h4>{{ fav.title }}</h4>
              <div class="meta-row">
                <div class="author-mini">
                  <el-avatar :size="18" :src="fav.avatar">{{ fav.username ? fav.username.charAt(0) : 'U' }}</el-avatar>
                  {{ fav.username }}
                </div>
                <span class="tag">{{ fav.category }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-tooltip content="取消收藏" placement="top">
                <div class="action-btn unfav" @click="removeFavorite(fav.id)"><el-icon><StarFilled /></el-icon></div>
              </el-tooltip>
            </div>
          </div>
        </template>
      </div>
    </main>

    <aside class="widget-island">
      <div class="profile-island">
        <el-avatar :size="70" :src="userAvatar" class="sidebar-avatar">{{ username ? username.charAt(0) : 'U' }}</el-avatar>
        <h3>{{ username }}</h3>
        <p>{{ userBio || 'Code is Poetry.' }}</p>
        <div class="stats-row">
          <div class="s-item clickable" @click="openUserList('following')">
            <div class="num">{{ userStats.following }}</div><div class="txt">关注</div>
          </div>
          <div class="divider"></div>
          <div class="s-item clickable" @click="openUserList('followers')">
            <div class="num">{{ userStats.followers }}</div><div class="txt">粉丝</div>
          </div>
        </div>
      </div>

      <div class="widget-box">
        <div class="widget-title">
          <span>个人媒体库</span>
          <div class="add-icon" @click="dialogUploadVisible = true"><el-icon><Plus /></el-icon></div>
        </div>
        
        <div class="gallery-grid">
          <div class="gallery-add" @click="dialogUploadVisible = true">
            <el-icon><UploadFilled /></el-icon>
            <span>上传</span>
          </div>
          <div v-for="item in (mediaList || []).slice(0, 5)" :key="item.id" class="gallery-item">
            <img v-if="item.type === 'image'" :src="item.url">
            <video v-else :src="item.url"></video>
            <div class="del-layer" @click="delMedia(item.filename)"><el-icon><Delete /></el-icon></div>
          </div>
          <div v-if="mediaList && mediaList.length > 5" class="gallery-more" @click="showAllMedia">
            +{{ mediaList.length - 5 }}
          </div>
        </div>
        <div class="widget-footer-tip" v-if="mediaList.length === 0">支持 JPG, PNG, MP4</div>
      </div>
    </aside>

    <el-dialog v-model="dialogUploadVisible" title="上传到媒体库" width="400px" style="border-radius: 20px;">
      <el-upload
        class="upload-dragger"
        drag
        action="#"
        :http-request="uploadFile"
        :show-file-list="false"
        accept="image/*,video/*"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽或点击上传 <br><span style="font-size:12px;color:#999">支持图片和视频</span></div>
      </el-upload>
    </el-dialog>
    
    <el-dialog v-model="listDialogVisible" :title="listTitle" width="400px" style="border-radius: 20px;">
      <div class="user-list-container">
        <el-empty v-if="userList.length === 0" description="这里空空如也" :image-size="80" />
        <div v-for="user in userList" :key="user.id" class="user-list-item" @click="visitUser(user.id)">
          <el-avatar :size="40" :src="user.avatar" class="list-avatar">{{ user.username ? user.username.charAt(0) : 'U' }}</el-avatar>
          <div class="list-info">
            <div class="list-name">{{ user.username }}</div>
            <div class="list-bio">{{ user.bio || '这个人很懒，什么都没写' }}</div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Compass, UserFilled, Setting, SwitchButton, EditPen, Document, View, Picture, Search, Lock, Delete, Plus, UploadFilled, ArrowRight, StarFilled } from '@element-plus/icons-vue'

const router = useRouter()
// 基础数据
const articles = ref([]); 
const mediaList = ref([]); 
const username = localStorage.getItem('username'); 
const userAvatar = ref(''); 
const userBio = ref(''); 
const searchKey = ref(''); 
const dialogUploadVisible = ref(false); 
const userStats = ref({ followers: 0, following: 0 })

// 列表弹窗
const listDialogVisible = ref(false)
const listTitle = ref('')
const userList = ref([])
const activeTab = ref('my_post')
const favorites = ref([])

const totalViews = computed(() => (articles.value || []).reduce((sum, art) => sum + (art.views || 0), 0))
const filteredArticles = computed(() => (articles.value || []).filter(item => (item.title || '').toLowerCase().includes(searchKey.value.toLowerCase())))
const filteredFavorites = computed(() => (favorites.value || []).filter(item => (item.title || '').toLowerCase().includes(searchKey.value.toLowerCase())))

// ✨✨✨ 修复核心：数据获取时赋空数组兜底 ✨✨✨
const fetchData = async () => {
    try {
        const resArts = await api.get('/my-articles')
        articles.value = resArts.data.data || [] // 兜底
        
        const resMedia = await api.get('/media')
        mediaList.value = resMedia.data.data || [] // 兜底，防止 .slice 报错
        
        const resFav = await api.get('/my-favorites')
        favorites.value = resFav.data.data || [] // 兜底
        
        fetchUserInfo()
    } catch (err) { console.error(err) }
}

const fetchUserInfo = async () => {
    try {
        const res = await api.get('/user/info')
        if(res.data.code === 200) {
            const data = res.data.data
            userAvatar.value = data.avatar
            userBio.value = data.bio
            localStorage.setItem('username', data.username)
            userStats.value.following = data.followingCount || 0
            userStats.value.followers = data.followersCount || 0
        }
    } catch(e) {}
}

const uploadFile = async (param) => { 
    const formData = new FormData(); 
    formData.append('file', param.file); 
    const loading = ElMessage.info({ message: '上传中...', duration: 0 })
    try {
        const res = await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        loading.close()
        if(res.data.code===200) {
            ElMessage.success('上传成功')
            dialogUploadVisible.value = false
            fetchData() 
        }
    } catch(e) { 
        loading.close()
        ElMessage.error('上传失败') 
    }
}

const delMedia = async (filename) => { 
    try {
        await ElMessageBox.confirm('确定永久删除这个素材吗?')
        await api.delete(`/media/${filename}`)
        ElMessage.success('已删除')
        fetchData()
    } catch(e) {}
}

const deleteArticle = async (id) => { await ElMessageBox.confirm('确定删除?'); await api.delete(`/articles/${id}`); fetchData() }
const removeFavorite = async (id) => { await api.post('/favorites/toggle', { articleId: id }); fetchData() }
const logout = () => { localStorage.clear(); location.reload() }

const openUserList = async (type) => {
    listTitle.value = type === 'following' ? '我的关注' : '我的粉丝'
    const endpoint = type === 'following' ? '/user/following_list' : '/user/follower_list'
    try {
        const infoRes = await api.get('/user/info')
        const myId = infoRes.data.data.id
        const res = await api.get(endpoint, { params: { id: myId } })
        if(res.data.code === 200) { userList.value = res.data.data || []; listDialogVisible.value = true }
    } catch(e) { console.error(e) }
}
const visitUser = (id) => { listDialogVisible.value = false; router.push(`/blog/${id}`) }
const showAllMedia = () => { router.push('/editor') } 

onMounted(fetchData)
</script>

<style scoped>
/* Dashboard 样式保持不变 (见之前) */
.island-layout { display: flex; justify-content: center; gap: 30px; min-height: 100vh; background-color: #F2F4F7; padding: 30px; font-family: 'Plus Jakarta Sans', sans-serif; color: #2c3e50; }
.nav-island { width: 260px; display: flex; flex-direction: column; position: sticky; top: 30px; height: calc(100vh - 60px); }
.logo-area { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; padding-left: 10px; }
.logo-box { width: 48px; height: 48px; background: #2c3e50; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; box-shadow: 0 10px 20px rgba(44,62,80,0.3); }
.logo-text { font-size: 24px; font-weight: 800; letter-spacing: -1px; }
.menu-list { flex: 1; display: flex; flex-direction: column; gap: 15px; }
.menu-item { display: flex; align-items: center; gap: 15px; padding: 16px 20px; border-radius: 20px; background: white; color: #94a3b8; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.menu-item:hover { transform: translateX(5px); color: #2c3e50; }
.menu-item.active { background: #2c3e50; color: white; box-shadow: 0 8px 20px rgba(44,62,80,0.25); }
.menu-item .el-icon { font-size: 22px; }
.logout-btn { padding: 15px 20px; border-radius: 20px; background: #ffebeb; color: #ff6b6b; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: bold; margin-top: auto; }

.feed-island { width: 600px; display: flex; flex-direction: column; gap: 25px; }
.dashboard-header { display: flex; gap: 20px; }
.welcome-island { flex: 1; background: white; border-radius: 24px; padding: 30px; display: flex; flex-direction: column; justify-content: center; background-image: radial-gradient(circle at top right, #fff0f0, transparent); }
.welcome-island h1 { margin: 0 0 5px; font-size: 24px; }
.welcome-island p { margin: 0; color: #94a3b8; }
.create-island { width: 100px; background: #2c3e50; border-radius: 24px; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
.create-island:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(44,62,80,0.3); }
.create-icon { font-size: 32px; margin-bottom: 5px; }

.stats-grid { display: flex; gap: 15px; }
.stat-island { flex: 1; background: white; border-radius: 24px; padding: 20px; position: relative; overflow: hidden; }
.stat-num { font-size: 32px; font-weight: 800; color: #2c3e50; position: relative; z-index: 2; }
.stat-label { color: #94a3b8; font-size: 13px; position: relative; z-index: 2; }
.stat-bg-icon { position: absolute; right: -10px; bottom: -10px; font-size: 80px; opacity: 0.1; transform: rotate(-15deg); }
.stat-island.purple .stat-num { color: #8b5cf6; }
.stat-island.blue .stat-num { color: #3b82f6; }
.stat-island.orange .stat-num { color: #f97316; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tab-switch { display: flex; gap: 20px; }
.tab-switch span { font-size: 18px; font-weight: 800; color: #cbd5e1; cursor: pointer; transition: 0.2s; position: relative; }
.tab-switch span.active { color: #2c3e50; }
.tab-switch span.active::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 30px; height: 4px; background: #409EFF; border-radius: 10px; }
.mini-search { width: 180px; }

.feed-stream { display: flex; flex-direction: column; gap: 15px; }
.manage-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 15px; transition: 0.3s; position: relative; overflow: hidden; }
.manage-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.card-status { width: 6px; height: 100%; position: absolute; left: 0; top: 0; }
.card-status.public { background: #10b981; }
.card-status.private { background: #ef4444; }
.card-content { flex: 1; cursor: pointer; }
.card-content h4 { margin: 0 0 8px; font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; }
.meta-row { display: flex; gap: 15px; font-size: 13px; color: #94a3b8; align-items: center; }
.tag { background: #f1f5f9; padding: 2px 8px; border-radius: 6px; color: #64748b; }
.private-lock { color: #ef4444; display: flex; align-items: center; gap: 3px; }
.card-actions { display: flex; gap: 10px; }
.action-btn { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; background: #f8fafc; color: #64748b; }
.action-btn.delete:hover { background: #fef2f2; color: #ef4444; }
.fav-style { border-left: none; }
.fav-style .card-status { display: none; }
.author-mini { display: flex; align-items: center; gap: 5px; color: #2c3e50; font-weight: bold; background: #f1f5f9; padding: 2px 8px 2px 2px; border-radius: 12px; }

.widget-island { width: 300px; display: flex; flex-direction: column; gap: 25px; }
.profile-island { background: white; border-radius: 24px; padding: 30px; text-align: center; }
.sidebar-avatar { border: 4px solid #f1f5f9; margin-bottom: 15px; background: #2c3e50; font-size: 24px; }
.profile-island h3 { margin: 0 0 5px; }
.profile-island p { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
.stats-row { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; }
.s-item { text-align: center; width: 60px; }
.s-item .num { font-weight: 800; font-size: 18px; color: #2c3e50; }
.s-item .txt { font-size: 12px; color: #94a3b8; }
.divider { width: 1px; height: 20px; background: #e2e8f0; margin: 0 10px; }
.s-item.clickable { cursor: pointer; transition: all 0.3s; padding: 5px; border-radius: 8px; }
.s-item.clickable:hover { background: #f8fafc; transform: translateY(-2px); }

.widget-box { background: white; border-radius: 24px; padding: 25px; }
.widget-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-weight: 800; font-size: 16px; }
.add-icon { cursor: pointer; color: #3b82f6; font-size: 18px; }
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.gallery-item { position: relative; height: 80px; border-radius: 12px; overflow: hidden; }
.gallery-item img, .gallery-item video { width: 100%; height: 100%; object-fit: cover; }
.del-layer { position: absolute; inset: 0; background: rgba(0,0,0,0.5); color: white; display: flex; justify-content: center; align-items: center; opacity: 0; transition: 0.2s; cursor: pointer; }
.gallery-item:hover .del-layer { opacity: 1; }
.gallery-add { height: 80px; border: 2px dashed #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; color: #cbd5e1; font-size: 12px; transition: 0.3s; gap: 5px; }
.gallery-add:hover { border-color: #3b82f6; color: #3b82f6; }
.gallery-more { height: 80px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: bold; cursor: pointer; }
.widget-footer-tip { margin-top: 15px; font-size: 12px; color: #cbd5e1; text-align: center; }

.user-list-container { max-height: 400px; overflow-y: auto; padding: 0 5px; }
.user-list-item { display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f1f5f9; }
.user-list-item:hover { background: #f8fafc; }
.list-avatar { background: #2c3e50; flex-shrink: 0; }
.list-info { flex: 1; overflow: hidden; }
.list-name { font-weight: bold; font-size: 15px; color: #2c3e50; }
.list-bio { font-size: 12px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.arrow-icon { color: #cbd5e1; }
</style>