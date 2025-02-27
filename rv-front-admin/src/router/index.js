import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import Login from '../views/Login/Login.vue'
import User from '../views/User/User.vue'
import CampInfo from '../views/User/CampInfo.vue'
import VehicleInfo from '../views/User/VehicleInfo.vue'
import CampAudit from '../views/User/CampAudit.vue'
import VehicleAudit from '../views/User/VehicleAudit.vue'
import DataAnalyze from '../views/User/DataAnalyze.vue'
const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/user',
    children: [
      {
        path: '/user',
        name: 'user',
        component: User,
        redirect: '/user/camp-info',
        children: [
          {
            path: 'camp-info',
            name: 'camp-info',
            component: CampInfo,
            meta: { title: '营地信息' }
          },
          {
            path: 'vehicle-info',
            name: 'vehicle-info',
            component: VehicleInfo,
            meta: { title: '车辆信息' }
          },
          {
            path: 'camp-audit',
            name: 'camp-audit',
            component: CampAudit,
            meta: { title: '营地审核' }
          },
          {
            path: 'vehicle-audit',
            name: 'vehicle-audit',
            component: VehicleAudit,
            meta: { title: '车辆审核' }
          },
          {
            path: 'data-analyze',
            name: 'data-analyze',
            component: DataAnalyze,
            meta: { title: '数据分析' }
          },
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user_token')
  const expiry = localStorage.getItem('token_expiry')

  // 检查token是否存在且未过期
  const isTokenValid = token && expiry && new Date().getTime() <= parseInt(expiry)

  // 如果访问登录页且已登录，重定向到预定车辆页
  if ((to.path === '/login' || to.path === '/register') && isTokenValid) {
    next('/user/camp-reservations')
    return
  }

  // 如果路由是登录页,注册页，直接放行
  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  // 如果用户未登录且访问的不是登录页，重定向到登录页
  if (!isTokenValid) {
    next('/login')
    return
  }

  // 用户已登录，允许访问
  next()
})
export default router