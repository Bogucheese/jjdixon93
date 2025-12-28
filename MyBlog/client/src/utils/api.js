import axios from 'axios'

const api = axios.create({
  // ✨ 统一使用 /api，配合 vite.config.js 的代理功能
  // ✨ Uniformly use /api to match vite.config.js proxy settings
  baseURL: '/api', 
  timeout: 600000
})

// 请求拦截器：自动携带 Token
// Request Interceptor: Automatically attach Token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：处理 Token 过期
// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // 401 代表未授权或 Token 过期
      // 401 means unauthorized or Token expired
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      // 可以在这里强制跳转登录，或者让具体页面处理
      // window.location.href = '/login' 
    }
    return Promise.reject(error)
  }
)

export default api