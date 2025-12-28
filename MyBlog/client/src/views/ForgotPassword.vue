<template>
  <div class="island-container">
    <div class="auth-island animate__animated animate__fadeInUp">
      
      <div class="brand-header">
        <div class="logo-box" style="background: #F56C6C;">M</div>
        <h2>找回密码</h2>
        <p>验证你的身份以重置密码</p>
      </div>
      
      <el-form :model="form" class="auth-form" size="large">
        <el-form-item>
          <el-input v-model="form.email" placeholder="绑定的 QQ 邮箱" :prefix-icon="Message" class="bento-input" />
        </el-form-item>
        
        <el-form-item>
          <div class="code-row">
            <el-input v-model="form.code" placeholder="邮件验证码" :prefix-icon="Key" class="bento-input code-input" />
            
            <el-button 
              type="primary" 
              plain 
              class="send-btn" 
              :disabled="isSending || countdown > 0" 
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s 后重发` : (isSending ? '发送中' : '获取验证码') }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            placeholder="设置新密码" 
            :prefix-icon="Lock" 
            show-password 
            class="bento-input" 
          />
        </el-form-item>

        <el-button type="danger" @click="handleReset" class="submit-btn reset-style" :loading="loading">
          重置密码
        </el-button>
        
        <div class="footer-links">
          <span class="link-highlight" @click="$router.push('/login')">返回登录</span>
        </div>
      </el-form>
    </div>
    <div class="footer-copyright">© 2025 MySpace Community</div>
  </div>
</template>

// ForgotPassword.vue 的 script setup 部分

<script setup>
import { reactive, ref, onUnmounted, onMounted } from 'vue'
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Key, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const isSending = ref(false)
const loading = ref(false)
const form = reactive({ email: '', code: '', newPassword: '' })
const countdown = ref(0)
let timer = null
const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&.]{8,}$/;

// ✨✨✨ 复用倒计时持久化逻辑 ✨✨✨
onMounted(() => {
    const lastSendTime = localStorage.getItem('lastForgotSendTime'); // 注意 key 最好和注册页区分开
    if (lastSendTime) {
        const diff = Math.floor((Date.now() - parseInt(lastSendTime)) / 1000);
        if (diff < 60) {
            countdown.value = 60 - diff;
            startCountdown(false);
        }
    }
})

const sendCode = async () => {
    if (!form.email) return ElMessage.warning('请输入邮箱')
    
    isSending.value = true
    try {
        const res = await api.post('/send-code', { email: form.email })
        if (res.data.code === 200) {
            ElMessage.success('验证码已发送')
            localStorage.setItem('lastForgotSendTime', Date.now());
            startCountdown(true);
        } else {
            ElMessage.error(res.data.message)
        }
    } catch (err) { 
        ElMessage.error('发送失败') 
    } finally { 
        isSending.value = false 
    }
}

const startCountdown = (isNew = true) => {
    if (isNew) countdown.value = 60;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            clearInterval(timer)
            countdown.value = 0
            localStorage.removeItem('lastForgotSendTime');
        }
    }, 1000)
}

const handleReset = async () => {
    if (!form.email || !form.code || !form.newPassword) return ElMessage.warning('请填写完整')
    
    // ✨✨✨ 前端强密码校验 ✨✨✨
    if (!pwdRegex.test(form.newPassword)) {
        return ElMessage.error('新密码需包含大小写字母和数字，且不少于8位')
    }
    
    loading.value = true
    try {
        const res = await api.post('/reset-password', form)
        if (res.data.code === 200) {
            ElMessage.success('密码重置成功')
            router.push('/login')
        } else {
            ElMessage.error(res.data.message)
        }
    } catch (err) {
        ElMessage.error('重置失败')
    } finally {
        loading.value = false
    }
}

onUnmounted(() => { if(timer) clearInterval(timer) })
</script>

<style scoped>
/* 复用 Login/Register 的基础样式 */
.island-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #F2F4F7;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.auth-island {
  width: 420px;
  background: white;
  border-radius: 32px;
  padding: 40px 35px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.brand-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
.logo-box {
  width: 56px; height: 56px;
  color: white; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 28px; margin-bottom: 20px;
  box-shadow: 0 10px 20px rgba(245, 108, 108, 0.3);
}

.brand-header h2 { margin: 0 0 8px; color: #2c3e50; font-size: 24px; font-weight: 800; }
.brand-header p { margin: 0; color: #94a3b8; font-size: 14px; }

:deep(.bento-input .el-input__wrapper) {
  background-color: #F8FAFC;
  box-shadow: none !important;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 12px 15px;
  transition: all 0.3s;
}
:deep(.bento-input .el-input__wrapper.is-focus) {
  background-color: white;
  border-color: #F56C6C;
  box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.1) !important;
}

.code-row { display: flex; gap: 10px; width: 100%; }
.code-input { flex: 1; }
.send-btn {
  height: 100%;
  border-radius: 16px;
  background: #fef0f0;
  border: none;
  color: #F56C6C;
  font-weight: bold;
  min-width: 110px; 
}
.send-btn:hover:not(.is-disabled) { background: #fde2e2; }

.submit-btn {
  width: 100%; height: 50px; border-radius: 16px;
  border: none; font-size: 16px; font-weight: bold; letter-spacing: 1px;
  margin-top: 10px; transition: all 0.3s;
}
.reset-style {
  background: #F56C6C;
  box-shadow: 0 10px 20px rgba(245, 108, 108, 0.2);
}
.reset-style:hover {
  background: #f56c6c;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(245, 108, 108, 0.3);
}

.footer-links { margin-top: 25px; font-size: 14px; color: #94a3b8; }
.link-highlight { color: #2c3e50; font-weight: 700; cursor: pointer; }
.link-highlight:hover { text-decoration: underline; }
.footer-copyright { margin-top: 40px; color: #cbd5e1; font-size: 12px; }
</style>