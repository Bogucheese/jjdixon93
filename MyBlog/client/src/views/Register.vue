<template>
  <div class="island-container">
    <div class="auth-island animate__animated animate__fadeInUp">
      
      <div class="brand-header">
        <div class="logo-box" style="background: #409EFF;">M</div>
        <h2>加入我们</h2>
        <p>创建一个属于你的数字空间</p>
      </div>
      
      <el-form :model="form" class="auth-form" size="large">
        <el-form-item>
          <el-input v-model="form.username" placeholder="设置用户名" :prefix-icon="User" class="bento-input" />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="设置密码" 
            :prefix-icon="Lock" 
            show-password 
            class="bento-input" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="confirmPwd" 
            type="password" 
            placeholder="确认密码" 
            :prefix-icon="CircleCheck" 
            show-password 
            class="bento-input" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-input v-model="form.email" placeholder="QQ邮箱 (用于找回密码)" :prefix-icon="Message" class="bento-input" />
        </el-form-item>
        
        <el-form-item>
          <div class="code-row">
            <el-input v-model="form.code" placeholder="验证码" :prefix-icon="Key" class="bento-input code-input" />
            
            <el-button 
              type="primary" 
              plain 
              class="send-btn" 
              :disabled="isSending || countdown > 0" 
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s 后重发` : (isSending ? '发送中...' : '获取验证码') }}
            </el-button>
          </div>
        </el-form-item>

        <el-button type="success" @click="handleRegister" class="submit-btn register-style" :loading="loading">
          立即注册
        </el-button>
        
        <div class="footer-links">
          <span>已有账号？</span>
          <span class="link-highlight" @click="$router.push('/login')">返回登录</span>
        </div>
      </el-form>
    </div>
    <div class="footer-copyright">© 2025 MySpace Community</div>
  </div>
</template>

// Register.vue 的 script setup 部分

<script setup>
import { reactive, ref, onUnmounted, onMounted } from 'vue' // 引入 onMounted
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Key, CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()
const isSending = ref(false)
const loading = ref(false)
const form = reactive({ username: '', password: '', email: '', code: '' })

const confirmPwd = ref('')
const countdown = ref(0)
let timer = null

// 强密码正则
const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&.]{8,}$/;

// ✨✨✨ 1. 页面加载时检查本地是否有未结束的倒计时 ✨✨✨
onMounted(() => {
    const lastSendTime = localStorage.getItem('lastEmailSendTime');
    if (lastSendTime) {
        const diff = Math.floor((Date.now() - parseInt(lastSendTime)) / 1000);
        if (diff < 60) {
            countdown.value = 60 - diff;
            startCountdown(false); // 继续倒计时，不重置 localStorage
        }
    }
})

const sendCode = async () => {
    if (!form.email) return ElMessage.warning('请输入邮箱')
    if (!form.email.endsWith('@qq.com')) return ElMessage.warning('目前仅支持 QQ 邮箱')
    
    if (countdown.value > 0) return

    isSending.value = true
    try {
        const res = await api.post('/send-code', { email: form.email })
        if (res.data.code === 200) {
            ElMessage.success('验证码已发送')
            // ✨✨✨ 2. 发送成功，记录时间到本地 ✨✨✨
            localStorage.setItem('lastEmailSendTime', Date.now());
            startCountdown(true);
        } else {
            // 如果是后端返回的 "操作太频繁"，这里也能显示出来
            ElMessage.error(res.data.message)
        }
    } catch (err) { 
        ElMessage.error('请求失败') 
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
            localStorage.removeItem('lastEmailSendTime'); // 倒计时结束，清除本地记录
        }
    }, 1000)
}

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const handleRegister = async () => {
    if (!form.username || !form.password || !form.email || !form.code) {
        return ElMessage.warning('请填写完整信息')
    }
    // ✨✨✨ 3. 前端强密码校验 ✨✨✨
    if (!pwdRegex.test(form.password)) {
        return ElMessage.error('密码需包含大小写字母和数字，且不少于8位')
    }
    if (form.password !== confirmPwd.value) {
        return ElMessage.error('两次输入的密码不一致！')
    }

    loading.value = true
    try {
        const res = await api.post('/register', form)
        if (res.data.code === 200) {
            ElMessage.success('注册成功')
            router.push('/login')
        } else { 
            ElMessage.error(res.data.message) 
        }
    } catch (err) { 
        ElMessage.error('注册服务异常') 
    } finally { 
        loading.value = false 
    }
}
</script>

<style scoped>
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
  box-shadow: 0 10px 20px rgba(64, 158, 255, 0.3);
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
  border-color: #409EFF;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1) !important;
}

.code-row { display: flex; gap: 10px; width: 100%; }
.code-input { flex: 1; }
.send-btn {
  height: 100%;
  border-radius: 16px;
  background: #F0F9FF;
  border: none;
  color: #409EFF;
  font-weight: bold;
  min-width: 110px; 
  transition: all 0.3s;
}
.send-btn:hover:not(.is-disabled) { background: #E0F2FE; }
.send-btn.is-disabled { background: #F2F4F7; color: #94a3b8; }

.submit-btn {
  width: 100%; height: 50px; border-radius: 16px;
  border: none; font-size: 16px; font-weight: bold; letter-spacing: 1px;
  margin-top: 10px; transition: all 0.3s;
}
.register-style {
  background: #10B981;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
}
.register-style:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3);
}

.footer-links { margin-top: 25px; font-size: 14px; color: #94a3b8; }
.link-highlight { color: #409EFF; font-weight: 700; cursor: pointer; margin-left: 5px; }
.link-highlight:hover { text-decoration: underline; }
.footer-copyright { margin-top: 40px; color: #cbd5e1; font-size: 12px; }
</style>