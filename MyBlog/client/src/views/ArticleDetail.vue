<template>
  <div class="island-layout">
    
    <aside class="nav-island">
      <div class="logo-area" @click="$router.push('/')" style="cursor: pointer;">
        <div class="logo-box"><el-icon><Back /></el-icon></div>
        <span class="logo-text">返回</span>
      </div>
      <div class="article-outline">
        <h3>互动统计</h3>
        <div class="stat-row">
           <el-icon><View /></el-icon> <span>{{ article.views }} 阅读</span>
        </div>
        <div class="stat-row" :class="{ active: isLiked }">
           <el-icon><Pointer /></el-icon> <span>{{ article.likes_count }} 点赞</span>
        </div>
        <div class="stat-row" :class="{ active: isFavorited }">
           <el-icon><Star /></el-icon> <span>{{ article.fav_count }} 收藏</span>
        </div>
        <div class="stat-row">
           <el-icon><ChatLineRound /></el-icon> <span>{{ article.comments_count }} 评论</span>
        </div>
      </div>
    </aside>

    <main class="feed-island">
      <div class="article-card animate__animated animate__fadeIn">
        <div class="art-header">
          <span class="category-tag">{{ article.category }}</span>
          <h1>{{ article.title }}</h1>
          <div class="art-meta">
              <span>发布于 {{ new Date(article.create_time).toLocaleString() }}</span>
              <span v-if="article.status === 'draft'" class="draft-badge">草稿预览</span>
          </div>
        </div>

        <div class="art-content w-e-text-container" v-html="sanitizedContent"></div>

        <div class="art-actions">
           <el-button round size="large" :type="isLiked ? 'danger' : ''" @click="toggleLike">
             <el-icon><Pointer /></el-icon> {{ isLiked ? '已赞' : '点赞' }} {{ article.likes_count }}
           </el-button>
           <el-button round size="large" :type="isFavorited ? 'warning' : ''" @click="toggleFav">
             <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon> {{ isFavorited ? '已收藏' : '收藏' }}
           </el-button>
        </div>
      </div>

      <div class="comment-island" id="comment-section">
        <h3>评论 ({{ comments.length }})</h3>
        
        <div class="comment-input-area">
           <el-input 
             v-model="newComment" 
             type="textarea" 
             :rows="3" 
             :placeholder="replyTarget ? `回复 @${replyTarget.username}:` : '写下你的想法...'"
             resize="none"
           />
           <div class="input-footer">
             <span v-if="replyTarget" class="cancel-reply" @click="cancelReply">取消回复</span>
             <el-button type="primary" round @click="submitComment" :loading="submitting">发送</el-button>
           </div>
        </div>

        <div class="comment-list">
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <el-avatar :size="40" :src="c.avatar" class="c-avatar">
              {{ c.username ? c.username.charAt(0) : 'U' }}
            </el-avatar>
            <div class="c-content">
              <div class="c-user">
                {{ c.username }} 
                <span v-if="c.reply_to_user" class="reply-tag">回复 @{{ c.reply_to_user }}</span>
                <span class="c-time">{{ new Date(c.create_time).toLocaleString() }}</span>
              </div>
              <div class="c-text">{{ c.content }}</div>
              <div class="c-actions">
                  <span class="act-btn" @click="replyTo(c)">回复</span>
                  
                  <span v-if="isMyComment(c.user_id)" class="act-btn del" @click="deleteComment(c.id)">删除</span>
                  
                  <span class="act-btn report" @click="openReport(c.id)">举报</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <aside class="widget-island">
      <div class="author-card">
         <el-avatar :size="60" :src="article.avatar" class="author-avatar" @click="$router.push(`/blog/${article.user_id}`)">
           {{ article.username ? article.username.charAt(0) : 'U' }}
         </el-avatar>
         <div class="author-name">{{ article.username }}</div>
         <div class="author-bio">{{ userBio || '这位作者很神秘' }}</div>
         
         <div class="author-btns" v-if="!isMyArticle">
            <el-button v-if="isFollowing" round class="followed-btn" @click="toggleFollow">已关注</el-button>
            <el-button v-else type="primary" round class="follow-btn" @click="toggleFollow">+ 关注</el-button>
            <el-button round @click="$router.push(`/blog/${article.user_id}`)">访问主页</el-button>
         </div>
         <div class="author-btns" v-else>
            <el-button round @click="$router.push('/editor?id=' + article.id)">编辑文章</el-button>
         </div>
      </div>
    </aside>

    <el-dialog v-model="reportDialogVisible" title="举报评论" width="400px">
      <el-input v-model="reportReason" placeholder="请输入举报理由..." />
      <template #footer>
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReport">提交</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back, View, Pointer, Star, StarFilled, ChatLineRound } from '@element-plus/icons-vue'
import DOMPurify from 'dompurify' 

const route = useRoute()
const router = useRouter()
const articleId = route.params.id

const article = ref({})
const comments = ref([])
const userBio = ref('')
const isFollowing = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const currentUserId = ref(null) // ✨✨✨ 新增：当前登录用户的ID

const newComment = ref('')
const replyTarget = ref(null)
const submitting = ref(false)

const reportDialogVisible = ref(false)
const reportReason = ref('')
const currentReportId = ref(null)

const sanitizedContent = computed(() => {
    if (!article.value.content) return '';
    return DOMPurify.sanitize(article.value.content, {
        ADD_TAGS: ['iframe', 'video', 'img', 'div', 'p', 'span', 'b', 'i', 'em', 'strong', 'a', 'br', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'code', 'pre'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'controls', 'autoplay', 'target', 'class', 'style', 'alt', 'title', 'width', 'height'],
    });
})

// ✨✨✨ 核心修复：比对 ID ✨✨✨
const isMyComment = (commentUserId) => {
    // 确保都转为数字进行比对，防止类型不一致
    return currentUserId.value && (parseInt(currentUserId.value) === parseInt(commentUserId))
}

const isMyArticle = computed(() => {
    return localStorage.getItem('username') === article.value.username
})

// ✨✨✨ 新增：获取当前用户信息 ✨✨✨
const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const res = await api.get('/user/info');
            if (res.data.code === 200) {
                currentUserId.value = res.data.data.id; // 拿到真实ID
            }
        } catch (e) {
            // Token 可能失效，静默处理
        }
    }
}

const fetchArticle = async () => {
    try {
        const res = await api.get(`/articles/${articleId}`)
        if (res.data.code === 200) {
            article.value = res.data.data
            const userRes = await api.get(`/user/info?id=${article.value.user_id}`)
            if(userRes.data.code === 200) userBio.value = userRes.data.data.bio
            
            if (localStorage.getItem('token') && !isMyArticle.value) {
                const followRes = await api.get(`/follow/status?targetId=${article.value.user_id}`)
                isFollowing.value = followRes.data.isFollowing
            }
        }
        
        if (localStorage.getItem('token')) {
            const statusRes = await api.get(`/interactions/status?articleId=${articleId}`)
            isLiked.value = statusRes.data.isLiked
            isFavorited.value = statusRes.data.isFavorited
        }
    } catch (e) { 
        console.error(e) 
        ElMessage.error('文章加载失败或不存在')
    }
}

const fetchComments = async () => {
    try {
        const res = await api.get(`/comments/${articleId}`)
        comments.value = res.data.data
    } catch (e) {}
}

const toggleLike = async () => {
    if (!localStorage.getItem('token')) return router.push('/login')
    try {
        const res = await api.post('/likes/toggle', { articleId })
        isLiked.value = res.data.isLiked
        article.value.likes_count += (res.data.isLiked ? 1 : -1)
    } catch (e) {}
}

const toggleFav = async () => {
    if (!localStorage.getItem('token')) return router.push('/login')
    try {
        const res = await api.post('/favorites/toggle', { articleId })
        isFavorited.value = res.data.isFavorited
        article.value.fav_count += (res.data.isFavorited ? 1 : -1)
        if (res.data.isFavorited) ElMessage.success('已收藏')
    } catch (e) {}
}

const toggleFollow = async () => {
    if (!localStorage.getItem('token')) return router.push('/login')
    try {
        if (isFollowing.value) {
            await api.post('/unfollow', { targetId: article.value.user_id })
            isFollowing.value = false
            ElMessage.success('已取消关注')
        } else {
            await api.post('/follow', { targetId: article.value.user_id })
            isFollowing.value = true
            ElMessage.success('关注成功')
        }
    } catch (e) { ElMessage.error('操作失败') }
}

const submitComment = async () => {
    if (!localStorage.getItem('token')) return router.push('/login')
    if (!newComment.value.trim()) return ElMessage.warning('写点什么吧')
    
    submitting.value = true
    try {
        const payload = {
            articleId,
            content: newComment.value,
            parentId: replyTarget.value ? replyTarget.value.id : null
        }
        const res = await api.post('/comments', payload)
        if (res.data.code === 200) {
            ElMessage.success('评论成功')
            newComment.value = ''
            replyTarget.value = null
            article.value.comments_count++
            fetchComments()
        } else {
            ElMessage.error(res.data.message)
        }
    } catch (e) { ElMessage.error('评论失败') } 
    finally { submitting.value = false }
}

const replyTo = (comment) => {
    replyTarget.value = comment
    newComment.value = '' 
    document.getElementById('comment-section').scrollIntoView({ behavior: 'smooth' })
}
const cancelReply = () => { replyTarget.value = null }

const deleteComment = async (id) => {
    try {
        await ElMessageBox.confirm('确定删除这条评论？')
        await api.delete(`/comments/${id}`)
        ElMessage.success('已删除')
        // 删除成功后，文章的评论数减一 (前端显示修正，或者重新fetchArticle)
        article.value.comments_count--
        fetchComments()
    } catch(e) {}
}

const openReport = (id) => {
    currentReportId.value = id
    reportDialogVisible.value = true
}

const submitReport = async () => {
    try {
        await api.post('/comments/report', { commentId: currentReportId.value, reason: reportReason.value })
        ElMessage.success('举报已提交')
        reportDialogVisible.value = false
        reportReason.value = ''
    } catch (e) {}
}

onMounted(() => {
    fetchCurrentUser() // ✨ 优先获取用户信息
    fetchArticle()
    fetchComments()
})
</script>

<style scoped>
/* 使用与全局一致的 Bento/Island 风格 */
.island-layout { display: flex; justify-content: center; gap: 30px; min-height: 100vh; background-color: #F2F4F7; padding: 30px; font-family: 'Plus Jakarta Sans', sans-serif; color: #2c3e50; }
.nav-island { width: 260px; display: flex; flex-direction: column; position: sticky; top: 30px; height: calc(100vh - 60px); }
.logo-area { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; padding-left: 10px; transition: 0.2s; cursor: pointer; }
.logo-area:hover { opacity: 0.7; }
.logo-box { width: 40px; height: 40px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.logo-text { font-weight: 800; font-size: 18px; }

.article-outline { background: white; border-radius: 24px; padding: 25px; }
.article-outline h3 { margin: 0 0 20px; font-size: 16px; }
.stat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: #64748b; font-size: 14px; }
.stat-row.active { color: #FF6B6B; font-weight: bold; }

.feed-island { width: 680px; display: flex; flex-direction: column; gap: 25px; }

.article-card { background: white; border-radius: 32px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
.art-header { margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; }
.category-tag { background: #ecf5ff; color: #409EFF; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; margin-bottom: 10px; display: inline-block; }
.art-header h1 { margin: 10px 0; font-size: 28px; line-height: 1.4; }
.art-meta { font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 10px; }
.draft-badge { background: #fef0f0; color: #f56c6c; padding: 2px 6px; border-radius: 4px; }

/* WangEditor 内容样式重置 */
.art-content { font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 40px; min-height: 200px; position: relative; }

/* 强制重置容器 */
.art-content.w-e-text-container {
    height: auto !important; 
    border: none !important; 
    background-color: transparent !important;
    padding: 0 !important; 
    overflow-y: visible !important; 
}

/* 样式防御 */
:deep(.art-content img) { max-width: 100% !important; height: auto !important; border-radius: 12px; margin: 10px 0; display: block; }
:deep(.art-content video) { max-width: 100% !important; height: auto !important; border-radius: 12px; margin: 20px 0; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
:deep(.art-content iframe) { max-width: 100% !important; border-radius: 12px; margin: 20px 0; }
:deep(.art-content blockquote) { border-left: 4px solid #cbd5e1; padding-left: 15px; color: #64748b; margin: 10px 0; background: #f8fafc; padding: 10px 15px; border-radius: 0 8px 8px 0; }
:deep(.art-content p:empty) { display: none; }
:deep(.art-content div:empty) { display: none; }
:deep(.art-content p:has(br:only-child)) { min-height: 1.8em; }

.art-actions { display: flex; justify-content: center; gap: 20px; margin-top: 40px; }

.comment-island { background: white; border-radius: 24px; padding: 30px; }
.comment-input-area { background: #F8FAFC; border-radius: 16px; padding: 15px; margin-bottom: 30px; }
:deep(.el-textarea__inner) { background: transparent; box-shadow: none; padding: 0; font-size: 14px; }
.input-footer { display: flex; justify-content: flex-end; align-items: center; margin-top: 10px; gap: 15px; }
.cancel-reply { font-size: 12px; color: #94a3b8; cursor: pointer; }

.comment-item { display: flex; gap: 15px; margin-bottom: 25px; }
.c-content { flex: 1; }
.c-user { font-weight: bold; font-size: 14px; margin-bottom: 5px; color: #2c3e50; }
.reply-tag { color: #409EFF; font-weight: normal; margin-left: 5px; }
.c-time { font-weight: normal; font-size: 12px; color: #cbd5e1; margin-left: 10px; }
.c-text { font-size: 14px; color: #475569; margin-bottom: 8px; line-height: 1.5; word-break: break-all; }
.c-actions { display: flex; gap: 15px; font-size: 12px; color: #94a3b8; }
.act-btn { cursor: pointer; transition: 0.2s; }
.act-btn:hover { color: #409EFF; }
.act-btn.del:hover { color: #f56c6c; }

.widget-island { width: 300px; }
.author-card { background: white; border-radius: 24px; padding: 30px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.author-avatar { margin-bottom: 15px; background: #2c3e50; border: 4px solid #F8FAFC; cursor: pointer; }
.author-name { font-weight: 800; font-size: 18px; margin-bottom: 5px; }
.author-bio { font-size: 13px; color: #94a3b8; margin-bottom: 20px; line-height: 1.4; }
.author-btns { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.follow-btn { width: 100%; background: #2c3e50; border-color: #2c3e50; }
.followed-btn { width: 100%; background: #f1f5f9; border: none; color: #64748b; }
.followed-btn:hover { color: #f56c6c; background: #fef0f0; }

@media (max-width: 1000px) { .nav-island, .widget-island { display: none; } .feed-island { width: 100%; } }
</style>