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
        <div class="menu-item" @click="$router.push('/dashboard')">
          <div class="icon-box"><el-icon><UserFilled /></el-icon></div><span class="label">我的</span>
        </div>
        <div class="menu-item active">
          <div class="icon-box"><el-icon><Setting /></el-icon></div><span class="label">设置</span>
        </div>
      </nav>
    </aside>

    <main class="feed-island">
      <div class="settings-card animate__animated animate__fadeInUp">
        <div class="card-header">
          <h2>账号设置</h2>
          <el-button type="primary" round :loading="saving" @click="saveProfile">保存修改</el-button>
        </div>

        <div class="form-body">
          <div class="avatar-row">
            <el-upload 
              class="avatar-uploader" 
              action="#" 
              :show-file-list="false" 
              :http-request="uploadAvatar"
              accept="image/*"
            >
              <div class="avatar-wrapper">
                <el-avatar :size="80" :src="form.avatar" class="setting-avatar">
                  {{ form.username ? form.username.charAt(0) : 'U' }}
                </el-avatar>
                <div class="edit-mask"><el-icon><EditPen /></el-icon></div>
              </div>
            </el-upload>
            <div class="avatar-tip">点击头像可更换<br>建议使用正方形图片</div>
          </div>

          <div class="input-island">
            <label>昵称</label>
            <input v-model="form.username" type="text" placeholder="你的名字">
          </div>

          <div class="input-island">
            <label>个人简介</label>
            <textarea v-model="form.bio" rows="4" placeholder="写点什么..."></textarea>
          </div>

          <div class="input-island disabled">
            <label>绑定邮箱</label>
            <input v-model="form.email" type="text" disabled>
            <el-icon class="check-icon"><CircleCheckFilled /></el-icon>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Compass, UserFilled, Setting, EditPen, CircleCheckFilled } from '@element-plus/icons-vue'

const router = useRouter()
const saving = ref(false)
const form = reactive({ username: '', email: '', avatar: '', bio: '' })

// 获取用户信息
const fetchUserInfo = async () => { 
    try { 
        const res = await api.get('/user/info'); 
        if (res.data.code === 200) { 
            const user = res.data.data; 
            form.username = user.username; 
            form.email = user.email; 
            form.avatar = user.avatar; 
            form.bio = user.bio 
        } 
    } catch (err) { 
        ElMessage.error('获取信息失败') 
    } 
}

// 自定义上传头像
const uploadAvatar = async (param) => { 
    const formData = new FormData(); 
    formData.append('file', param.file); 
    
    try { 
        // 使用 api.post，自动处理 baseUrl 和 token
        const res = await api.post('/upload', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
        }); 
        
        if (res.data.code === 200) { 
            form.avatar = res.data.url; 
            ElMessage.success('头像上传成功') 
        } 
    } catch (err) { 
        ElMessage.error('上传出错') 
    } 
}

// 保存资料
const saveProfile = async () => { 
    if (!form.username) return ElMessage.warning('用户名不能为空'); 
    
    saving.value = true; 
    try { 
        const res = await api.put('/user/info', { 
            username: form.username, 
            avatar: form.avatar, 
            bio: form.bio 
        }); 
        
        if (res.data.code === 200) { 
            ElMessage.success('已保存'); 
            // 更新本地存储的用户名，以便其他组件同步更新
            localStorage.setItem('username', form.username); 
            router.push('/dashboard') 
        } else { 
            ElMessage.error(res.data.message) 
        } 
    } catch (err) { 
        ElMessage.error('保存失败') 
    } finally { 
        saving.value = false 
    } 
}

onMounted(fetchUserInfo)
</script>

<style scoped>
/* 继承 Bento 风格 */
.island-layout { display: flex; justify-content: center; gap: 30px; min-height: 100vh; background-color: #F2F4F7; padding: 30px; font-family: 'Plus Jakarta Sans', sans-serif; color: #2c3e50; }
.nav-island { width: 260px; display: flex; flex-direction: column; position: sticky; top: 30px; height: calc(100vh - 60px); }
.logo-area { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; padding-left: 10px; }
.logo-box { width: 48px; height: 48px; background: #2c3e50; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; box-shadow: 0 10px 20px rgba(44,62,80,0.3); }
.logo-text { font-size: 24px; font-weight: 800; letter-spacing: -1px; }
.menu-list { flex: 1; display: flex; flex-direction: column; gap: 15px; }
.menu-item { display: flex; align-items: center; gap: 15px; padding: 16px 20px; border-radius: 20px; background: white; color: #94a3b8; cursor: pointer; transition: 0.3s; }
.menu-item:hover { transform: translateX(5px); color: #2c3e50; }
.menu-item.active { background: #2c3e50; color: white; box-shadow: 0 8px 20px rgba(44,62,80,0.25); }
.icon-box { font-size: 22px; } .label { font-weight: 600; font-size: 16px; }

.feed-island { width: 600px; }
.settings-card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.card-header h2 { margin: 0; font-size: 24px; font-weight: 800; }

.avatar-row { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
.avatar-wrapper { position: relative; cursor: pointer; }
.setting-avatar { background: #2c3e50; font-size: 32px; border: 4px solid #F2F4F7; }
.edit-mask { position: absolute; inset: 0; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; opacity: 0; transition: 0.2s; font-size: 24px; }
.avatar-wrapper:hover .edit-mask { opacity: 1; }
.avatar-tip { color: #94a3b8; font-size: 13px; line-height: 1.5; }

.form-body { display: flex; flex-direction: column; gap: 20px; }
.input-island { background: #F8FAFC; border-radius: 16px; padding: 15px 20px; border: 1px solid transparent; transition: 0.3s; position: relative; }
.input-island:focus-within { background: white; border-color: #2c3e50; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.input-island label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.input-island input, .input-island textarea { width: 100%; background: transparent; border: none; outline: none; font-size: 16px; color: #2c3e50; font-family: inherit; font-weight: 500; }
.input-island.disabled { opacity: 0.7; }
.check-icon { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 20px; }

@media (max-width: 1000px) { .nav-island { display: none; } .feed-island { width: 100%; } }
</style>