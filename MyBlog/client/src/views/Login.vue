<template>
  <div class="island-container">
    <div class="auth-island animate__animated animate__fadeInUp">
      <div class="brand-header">
        <div class="logo-box">M</div>
        <h2>Welcome Back</h2>
        <p>登录以继续你的创作之旅</p>
      </div>

      <el-form :model="form" class="auth-form" size="large">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="账号 / 用户名"
            :prefix-icon="User"
            class="bento-input"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            class="bento-input"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          @click="handleLogin"
          class="submit-btn"
          :loading="loading"
        >
          登 录
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>

        <div class="footer-links">
          <div style="margin-bottom: 10px">
            <span
              class="link-highlight"
              style="color: #94a3b8; font-weight: normal"
              @click="$router.push('/forgot-password')"
              >忘记密码？</span
            >
          </div>
          <div>
            <span>还没有账号？</span>
            <span class="link-highlight" @click="$router.push('/register')"
              >立即注册</span
            >
          </div>
        </div>
      </el-form>
    </div>

    <div class="footer-copyright">© 2025 MySpace Community</div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import api from "@/utils/api";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { User, Lock, ArrowRight } from "@element-plus/icons-vue";

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: "", password: "" });

const handleLogin = async () => {
    if(!form.username || !form.password) return ElMessage.warning('请输入账号密码')
    loading.value = true
    try {
        const res = await api.post('/login', form)
        
        if (res.data.code === 200) {
            ElMessage.success('登录成功')
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('username', form.username)
            router.push('/')
        } else if (res.data.code === 403 && res.data.message.includes('冻结')) {
            // 403 临时冻结或永久封禁提示
            ElMessageBox.alert(res.data.message, '登录失败 - 账号状态异常', { type: 'error' });
        } else {
            // 401 密码错误，后端会返回剩余尝试次数
            ElMessage.error(res.data.message)
        }
    } catch (err) {
        // 捕获 500 或连接错误
        ElMessage.error('登录服务连接失败或发生内部错误')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* 全局容器：与 Dashboard 背景一致 */
.island-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f2f4f7;
  font-family: "Plus Jakarta Sans", sans-serif;
}

/* 核心卡片：岛屿风格 */
.auth-island {
  width: 400px;
  background: white;
  border-radius: 32px;
  padding: 40px 35px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  text-align: center;
  transition: transform 0.3s;
}

.auth-island:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08);
}

/* 品牌头部 */
.brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo-box {
  width: 56px;
  height: 56px;
  background: #2c3e50;
  color: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 28px;
  margin-bottom: 20px;
  box-shadow: 0 10px 20px rgba(44, 62, 80, 0.2);
}

.brand-header h2 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 800;
}

.brand-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

/* 输入框样式重写 (Bento 风格) */
:deep(.bento-input .el-input__wrapper) {
  background-color: #f8fafc;
  box-shadow: none !important;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 12px 15px;
  transition: all 0.3s;
}

:deep(.bento-input .el-input__wrapper.is-focus) {
  background-color: white;
  border-color: #2c3e50;
  box-shadow: 0 0 0 4px rgba(44, 62, 80, 0.1) !important;
}

:deep(.el-input__inner) {
  font-weight: 600;
  color: #2c3e50;
}

/* 按钮样式 */
.submit-btn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  background: #2c3e50;
  border: none;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-top: 10px;
  transition: all 0.3s;
}

.submit-btn:hover {
  background: #409eff; /* 悬停变为品牌蓝 */
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(64, 158, 255, 0.3);
}

/* 底部链接 */
.footer-links {
  margin-top: 25px;
  font-size: 14px;
  color: #94a3b8;
}

.link-highlight {
  color: #2c3e50;
  font-weight: 700;
  cursor: pointer;
  margin-left: 5px;
  transition: color 0.2s;
}

.link-highlight:hover {
  color: #409eff;
  text-decoration: underline;
}

.footer-copyright {
  margin-top: 40px;
  color: #cbd5e1;
  font-size: 12px;
}
</style>