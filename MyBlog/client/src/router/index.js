import { createRouter, createWebHistory } from 'vue-router'

// 静态引入部分页面 (也可以全部改为动态引入)
import Admin from '../views/Admin.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Changelog from '../views/Changelog.vue'
import DataVisual from '@/views/DataVisual.vue'

const routes = [
    {
        path: '/',
        name: 'Hub',
        component: () => import('../views/Hub.vue') // 懒加载
    },
    {
        path: '/blog/:id',
        name: 'UserBlog',
        component: () => import('../views/UserBlog.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
    },
    {
        path: '/article/:id',
        name: 'ArticleDetail',
        component: () => import('../views/ArticleDetail.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
    },
    {
        path: '/editor',
        name: 'Editor',
        component: () => import('../views/Editor.vue')
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword
    },
    {
        path: '/changelog',
        name: 'Changelog',
        component: Changelog
    },
    {
        path: '/visual',
        name: 'DataVisual',
        component: DataVisual,
        meta: { title: '数据视界' } // 不需要 requiresAuth，游客可见
    },
    {
        path: '/game',
        name: 'Game',
        component: () => import('../views/GameView.vue')
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// --- 路由守卫 (安全门卫) ---
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    // 需要登录才能访问的页面列表
    const authPages = ['/dashboard', '/settings', '/editor', '/admin'];

    // 如果要去受保护页面且没有 Token
    if (authPages.includes(to.path) && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router