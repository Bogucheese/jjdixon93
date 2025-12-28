<template>
  <div class="editor-layout">
    
    <aside class="draft-island">
      <div class="media-tools">
        <div class="island-title"><el-icon><Headset /></el-icon> 多媒体工具</div>
        <div class="tool-btn" @click="triggerMusicUpload">
          <el-icon><Microphone /></el-icon> 插入背景音乐
          <input type="file" ref="musicInput" accept="audio/*" style="display:none" @change="handleMusicUpload">
        </div>
        <div class="tool-btn" @click="openMediaLibrary">
          <el-icon><Picture /></el-icon> 从媒体库选择
        </div>
        <div class="tool-tip">也可以直接拖拽图片到中间哦</div>
      </div>
      <div class="divider"></div>
      <div class="island-title">
        <el-icon><Files /></el-icon> 灵感草稿箱
        <div class="new-btn" @click="resetEditor"><el-icon><Plus /></el-icon> 新建</div>
      </div>
      <div class="draft-list">
        <el-empty v-if="drafts.length === 0" description="暂无草稿" :image-size="60" />
        <div v-for="draft in drafts" :key="draft.id" class="draft-item" :class="{ active: currentId === draft.id }" @click="loadDraft(draft)">
          <div class="d-title">{{ draft.title || '无标题草稿' }}</div>
          <div class="d-date">{{ new Date(draft.create_time).toLocaleDateString() }}</div>
          <div class="d-del" @click.stop="deleteDraft(draft.id)"><el-icon><Delete /></el-icon></div>
        </div>
      </div>
    </aside>

    <main class="main-editor-island">
      <div class="composer-container">
        <div class="composer-title-row">
          <input v-model="form.title" class="big-title-input" placeholder="请输入标题 (可选)..." />
        </div>

        <div class="composer-body">
          <el-input
            v-model="form.summary"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 20 }"
            placeholder="分享你的新鲜事、技术感悟或是生活碎片..."
            class="tweet-textarea"
            resize="none"
          />

          <div v-if="mediaFiles.length > 0" class="media-grid-preview" :class="gridClass">
            <div v-for="(media, index) in mediaFiles" :key="index" class="media-preview-item">
              <div class="remove-badge" @click="removeMedia(index)"><el-icon><Close /></el-icon></div>
              <img v-if="media.type === 'image'" :src="media.url" class="media-content" />
              <video v-else :src="media.url" class="media-content" controls></video>
            </div>
          </div>
          
          <div v-if="bgMusic" class="music-preview-bar">
             <el-icon><Headset /></el-icon> 已添加背景音乐：{{ bgMusic.name }}
             <span class="del-music" @click="bgMusic = null">删除</span>
          </div>
        </div>

        <div class="composer-toolbar">
          <div class="tools-left">
            <div class="tool-icon" @click="triggerUpload" title="上传图片/视频">
              <el-icon><Picture /></el-icon>
            </div>
            <input type="file" ref="fileInput" multiple accept="image/*,video/*" style="display:none" @change="handleFileUpload">
            
            <div class="tool-icon" @click="openMediaLibrary" title="媒体库">
              <el-icon><Files /></el-icon>
            </div>
            
            <span class="word-count">{{ form.summary.length }} 字</span>
          </div>
        </div>
      </div>
    </main>

    <aside class="settings-island">
      <div class="setting-group">
        <h3>发布设置</h3>
        <div class="form-item">
          <label>所属分区</label>
          <el-select v-model="form.category" placeholder="选择分区" filterable allow-create default-first-option style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
        <div class="form-item">
          <label>可见性</label>
          <div class="visibility-box">
             <el-radio-group v-model="form.is_public">
                <el-radio :label="1">公开展示</el-radio>
                <el-radio :label="0">仅自己可见</el-radio>
             </el-radio-group>
          </div>
        </div>
      </div>
      
      <div class="action-btns">
        <el-button class="btn-draft" @click="saveDraft" :loading="saving">
          <el-icon><Collection /></el-icon> 存草稿
        </el-button>
        <el-button type="primary" class="btn-pub" @click="publish" :loading="publishing">
          <el-icon><Promotion /></el-icon> {{ currentId && currentStatus === 'published' ? '更新发布' : '立即发布' }}
        </el-button>
      </div>
      <div class="back-link" @click="$router.push('/')">返回首页</div>
    </aside>

    <el-dialog v-model="mediaDialogVisible" title="我的媒体库" width="600px" append-to-body style="border-radius: 12px;">
      <div class="lib-grid">
        <div v-for="m in mediaLib" :key="m.id" class="lib-item" @click="selectFromLib(m)">
          <img v-if="m.type === 'image'" :src="m.url">
          <video v-else :src="m.url"></video>
          <div class="lib-check" v-if="isSelected(m.url)"><el-icon><Check /></el-icon></div>
        </div>
      </div>
    </el-dialog>

    <div v-if="isUploading" class="upload-mask">
      <div class="progress-box animate__animated animate__zoomIn">
        <h3>正在上传素材...</h3>
        <p class="upload-tip">{{ uploadStatusText }}</p>
        <el-progress 
          :percentage="uploadProgress" 
          :stroke-width="12" 
          status="success" 
          striped 
          striped-flow 
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Files, Plus, Delete, Collection, Promotion, Headset, Microphone, Picture, Close, Check } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 核心数据
const form = reactive({ title: '', summary: '', category: '日常', is_public: 1 })
const mediaFiles = ref([]) 
const bgMusic = ref(null)

const drafts = ref([])
const currentId = ref(null)
const currentStatus = ref('')

const saving = ref(false)
const publishing = ref(false)
const categoryOptions = ref(['日常', '技术', '吐槽', '摄影', '影评', '其他'])

const fileInput = ref(null)
const musicInput = ref(null)
const mediaDialogVisible = ref(false)
const mediaLib = ref([])

// ✨✨✨ 进度条相关状态 ✨✨✨
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('')

// 计算九宫格样式
const gridClass = computed(() => {
  const n = mediaFiles.value.length
  if (n === 1) return 'grid-1'
  if (n === 2) return 'grid-2'
  if (n === 3) return 'grid-3'
  return 'grid-4'
})

// === HTML 生成与解析 (保持不变) ===
const generateHtml = () => {
  let html = `<div class="tweet-content" style="font-size:16px; line-height:1.8; color:#333; white-space: pre-wrap;">${form.summary}</div>`
  
  if (mediaFiles.value.length > 0) {
    html += `<div class="tweet-media-grid" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:15px;">`
    mediaFiles.value.forEach(m => {
      if (m.type === 'image') {
        html += `<img src="${m.url}" class="tweet-img" style="max-width:100%; border-radius:8px; display:block; margin-bottom:5px;">`
      } else {
        html += `<video src="${m.url}" controls class="tweet-video" style="max-width:100%; border-radius:8px; display:block; margin-bottom:5px;"></video>`
      }
    })
    html += `</div>`
  }
  
  if (bgMusic.value) {
    html += `<div class="tweet-music" style="margin-top:15px; background:#f1f5f9; padding:10px; border-radius:8px;">
      <div style="font-size:12px; color:#666; margin-bottom:5px;">🎵 ${bgMusic.value.name}</div>
      <audio src="${bgMusic.value.url}" controls style="width:100%; height:30px;"></audio>
    </div>`
  }
  return html
}

const parseHtmlToState = (htmlContent) => {
  const div = document.createElement('div')
  div.innerHTML = htmlContent
  const imgs = div.querySelectorAll('img')
  const videos = div.querySelectorAll('video')
  const newMedia = []
  imgs.forEach(img => newMedia.push({ url: img.src, type: 'image' }))
  videos.forEach(video => newMedia.push({ url: video.src, type: 'video' }))
  mediaFiles.value = newMedia
  const audio = div.querySelector('audio')
  if (audio) {
    const musicDiv = div.querySelector('.tweet-music')
    let name = '未知音频'
    if (musicDiv && musicDiv.textContent) name = musicDiv.textContent.replace('🎵', '').trim()
    bgMusic.value = { url: audio.src, name }
  } else {
    bgMusic.value = null
  }
}

// === 上传逻辑 (集成进度条) ===

const triggerUpload = () => fileInput.value.click()

const handleFileUpload = async (e) => {
  const files = e.target.files
  if (!files.length) return
  if (mediaFiles.value.length + files.length > 9) return ElMessage.warning('最多9张素材')
  
  // 开启遮罩
  isUploading.value = true
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    uploadStatusText.value = `正在上传第 ${i + 1} / ${files.length} 个文件：${file.name}`
    uploadProgress.value = 0 // 重置进度
    
    const formData = new FormData(); 
    formData.append('file', file)
    
    try {
      const res = await api.post('/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        // ✨ Axios 进度监听
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          }
        }
      })
      
      if(res.data.code === 200) {
        mediaFiles.value.push({ url: res.data.url, type: file.type.startsWith('image/') ? 'image' : 'video' })
      }
    } catch(err) {
      ElMessage.error(`文件 ${file.name} 上传失败`)
    }
  }
  
  // 全部完成后关闭遮罩
  setTimeout(() => {
    isUploading.value = false
    e.target.value = ''
    uploadProgress.value = 0
  }, 500)
}

const removeMedia = (idx) => mediaFiles.value.splice(idx, 1)

const triggerMusicUpload = () => musicInput.value.click()

const handleMusicUpload = async (e) => {
  const file = e.target.files[0]
  if(!file) return
  
  isUploading.value = true
  uploadStatusText.value = `正在上传音乐：${file.name}`
  uploadProgress.value = 0

  const formData = new FormData(); 
  formData.append('file', file)
  
  try {
    const res = await api.post('/upload', formData, {
      onUploadProgress: (p) => {
        if(p.total) uploadProgress.value = Math.round((p.loaded / p.total) * 100)
      }
    })
    
    if(res.data.code === 200) {
      bgMusic.value = { url: res.data.url, name: file.name }
      ElMessage.success('音乐已添加')
    }
  } catch(e) { 
    ElMessage.error('音乐上传失败') 
  } finally {
    setTimeout(() => { isUploading.value = false; e.target.value = '' }, 500)
  }
}

const openMediaLibrary = async () => {
  mediaDialogVisible.value = true
  const res = await api.get('/media')
  mediaLib.value = res.data.data
}
const selectFromLib = (m) => {
  if(mediaFiles.value.length >= 9) return ElMessage.warning('满了')
  mediaFiles.value.push({ url: m.url, type: m.type })
  mediaDialogVisible.value = false
}
const isSelected = (url) => mediaFiles.value.some(m => m.url === url)

// === 数据交互 (保持不变) ===
const fetchDrafts = async () => { try{ const res = await api.get('/my-drafts'); drafts.value = res.data.data }catch(e){} }
const fetchCategories = async () => { try{ const res = await api.get('/my-categories'); if(res.data.code===200) categoryOptions.value=[...new Set([...categoryOptions.value, ...res.data.data])] }catch(e){} }

const loadDraft = (item) => {
  currentId.value = item.id
  currentStatus.value = item.status || 'draft'
  form.title = item.title
  form.category = item.category
  form.is_public = item.is_public
  form.summary = item.summary 
  parseHtmlToState(item.content)
}

const resetEditor = () => {
  router.push('/editor')
  currentId.value = null; currentStatus.value = ''; 
  form.title = ''; form.summary = ''; mediaFiles.value = []; bgMusic.value = null;
}

const saveDraft = async () => {
  if(!form.title) form.title = form.summary.substring(0, 15) || '无标题草稿'
  if(!form.category) form.category = '日常'
  saving.value = true
  try {
    const html = generateHtml()
    const statusToSave = currentStatus.value === 'published' ? 'published' : 'draft'
    const payload = { ...form, content: html, status: statusToSave }
    let res
    if(currentId.value) res = await api.put(`/articles/${currentId.value}`, payload)
    else { res = await api.post('/articles/add', payload); if(res.data.code===200) currentId.value = res.data.articleId }
    
    if(res.data.code===200) {
      ElMessage.success('草稿已保存')
      if(!currentId.value) currentStatus.value='draft'
      fetchDrafts()
    }
  } catch(e) { ElMessage.error('保存失败') } finally { saving.value = false }
}

const publish = async () => {
  if(!form.summary && mediaFiles.value.length===0) return ElMessage.warning('写点什么吧')
  if(!form.title) form.title = form.summary.substring(0, 20) || '无标题动态'
  
  publishing.value = true
  try {
    const html = generateHtml()
    const payload = { ...form, content: html, status: 'published' }
    let res
    if(currentId.value) res = await api.put(`/articles/${currentId.value}`, payload)
    else res = await api.post('/articles/add', payload)
    
    if(res.data.code===200) {
      ElMessage.success('发布成功')
      router.push('/dashboard')
    }
  } catch(e) { ElMessage.error('发布失败') } finally { publishing.value = false }
}

const deleteDraft = async (id) => {
  try { await ElMessageBox.confirm('删除草稿?'); await api.delete(`/articles/${id}`); fetchDrafts(); if(currentId.value===id) resetEditor() } catch(e){}
}

onMounted(() => {
  fetchDrafts()
  fetchCategories()
  if(route.query.id) {
    api.get(`/articles/${route.query.id}`).then(res => loadDraft(res.data.data))
  }
})
</script>

<style scoped>
/* 保持原有布局 */
.editor-layout { display: flex; height: 100vh; background-color: #F2F4F7; padding: 20px; gap: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }
.draft-island { width: 280px; background: white; border-radius: 24px; padding: 20px; display: flex; flex-direction: column; }
.settings-island { width: 300px; background: white; border-radius: 24px; padding: 25px; display: flex; flex-direction: column; }
.main-editor-island { flex: 1; display: flex; justify-content: center; overflow-y: auto; }

.composer-container {
  width: 100%; max-width: 800px;
  background: white; border-radius: 24px;
  padding: 40px;
  display: flex; flex-direction: column;
  height: fit-content; min-height: 80%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.composer-title-row { border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px; }
.big-title-input { width: 100%; border: none; font-size: 24px; font-weight: 800; color: #2c3e50; outline: none; }
.big-title-input::placeholder { color: #cbd5e1; }

.composer-body { flex: 1; display: flex; flex-direction: column; gap: 20px; }
:deep(.tweet-textarea .el-textarea__inner) {
  box-shadow: none; padding: 0; font-size: 16px; line-height: 1.6; border: none; min-height: 150px;
}
:deep(.tweet-textarea .el-textarea__inner:focus) { box-shadow: none; }

/* 九宫格 */
.media-grid-preview { display: grid; gap: 10px; margin-top: 10px; }
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.grid-4 { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }

.media-preview-item { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; max-height: 300px; }
.media-content { width: 100%; height: 100%; object-fit: cover; display: block; }
.remove-badge {
  position: absolute; top: 5px; right: 5px;
  background: rgba(0,0,0,0.5); color: white; border-radius: 50%;
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s; z-index: 10;
}
.remove-badge:hover { background: #ef4444; }

.music-preview-bar {
  background: #ecf5ff; color: #409EFF; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; font-size: 14px;
}
.del-music { margin-left: auto; font-size: 12px; cursor: pointer; color: #999; }
.del-music:hover { color: #ef4444; }

/* 工具栏 */
.composer-toolbar { margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.tools-left { display: flex; align-items: center; gap: 15px; }
.tool-icon {
  font-size: 22px; color: #409EFF; cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; background: #ecf5ff; display: flex;
}
.tool-icon:hover { background: #409EFF; color: white; transform: translateY(-2px); }
.word-count { font-size: 12px; color: #cbd5e1; margin-left: 10px; }

/* 侧边栏 */
.island-title { font-weight: 800; font-size: 16px; color: #2c3e50; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.new-btn { font-size: 12px; background: #F8FAFC; padding: 4px 10px; border-radius: 8px; cursor: pointer; color: #409EFF; }
.media-tools { margin-bottom: 20px; }
.tool-btn { background: #ecf5ff; color: #409EFF; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; }
.tool-tip { font-size: 11px; color: #94a3b8; margin-top: 8px; text-align: center; }
.divider { height: 1px; background: #f1f5f9; margin: 10px 0 20px; }
.draft-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.draft-item { background: #F8FAFC; border-radius: 12px; padding: 12px; cursor: pointer; transition: 0.2s; position: relative; }
.draft-item.active { background: #2c3e50; color: white; }
.d-title { font-weight: bold; font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.d-date { font-size: 12px; color: #94a3b8; }
.d-del { position: absolute; right: 10px; top: 12px; color: #ef4444; opacity: 0; }
.setting-group h3 { font-size: 18px; margin: 0 0 20px; color: #2c3e50; }
.form-item { margin-bottom: 20px; }
.form-item label { display: block; font-size: 13px; font-weight: bold; color: #64748b; margin-bottom: 8px; }
.action-btns { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.btn-pub { height: 44px; border-radius: 12px; font-weight: bold; font-size: 15px; }
.btn-draft { height: 44px; border-radius: 12px; font-weight: bold; font-size: 15px; background: #f1f5f9; border: none; color: #64748b; }
.back-link { text-align: center; margin-top: 15px; font-size: 13px; color: #94a3b8; cursor: pointer; }

/* 媒体库 */
.lib-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.lib-item { height: 100px; cursor: pointer; border-radius: 8px; overflow: hidden; position: relative; }
.lib-item img, .lib-item video { width: 100%; height: 100%; object-fit: cover; }
.lib-check { position: absolute; top: 5px; right: 5px; background: #409EFF; color: white; border-radius: 50%; padding: 2px; }

/* ✨✨✨ 上传遮罩层样式 ✨✨✨ */
.upload-mask {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(5px);
  z-index: 9999; display: flex; justify-content: center; align-items: center;
}
.progress-box {
  width: 400px; background: white; padding: 30px; border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center;
}
.upload-tip { color: #64748b; margin: 10px 0 20px; font-size: 14px; }

@media (max-width: 1000px) { .editor-layout { flex-direction: column; height: auto; } .draft-island, .settings-island { width: 100%; } }
</style>