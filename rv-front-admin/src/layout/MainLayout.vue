<template>
    <div class="main-layout">
      <!-- 头部区域 -->
      <div class="header">
        <div class="header-content">
          <div class="title">
            <el-icon class="logo-icon"><Van /></el-icon>
            房车在线租赁系统
          </div>
          <div class="user-info">
            <el-icon size="20"><User /></el-icon>
            <span v-if="!isTokenValid" class="login-text" @click="router.replace('/login')">登录</span>
            <el-button v-if="isTokenValid" type="danger" size="small" plain @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </div>
  
      <!-- 导航栏 -->
      <el-menu
        class="nav-menu"
        mode="horizontal"
        :default-active="activeMenu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/user">
          <el-icon><Management /></el-icon>
          <span>管理端</span>
        </el-menu-item>
      </el-menu>
  
      <!-- 内容区域 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>      
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref , watch} from 'vue'
  import { User, Van, Management, SwitchButton } from '@element-plus/icons-vue'
  import { useRouter, useRoute } from "vue-router";
  import { useUserStore } from '@/store/user.js'
  import userApi from '@/api/user.js'
  import { errorHandler } from '@/utils/errorHandler.js'
  import { ElMessageBox, ElMessage } from 'element-plus'


  const router = useRouter();
  const route = useRoute();
  const activeMenu = ref(route.path);

  // 监听路由变化
  watch(
    () => route.path,
    (newPath) => {
      activeMenu.value = newPath;
    },
    { immediate: true }
  );
  function handleMenuSelect(index) {
  router.push(index);
  }

  // 检查token是否存在且未过期
  const token = localStorage.getItem('user_token')
  const expiry = localStorage.getItem('token_expiry')
  const isTokenValid = ref(token && expiry && new Date().getTime() <= parseInt(expiry))

  // 退出登录
  function handleLogout() {
  ElMessageBox.confirm('确认退出登录吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const logoutRes = await userApi.logout()
      if(logoutRes.code === 200){
        ElMessage.success('退出登录成功')
        const userStore = useUserStore()
        userStore.clearUserInfo()
        isTokenValid.value = false
      }else{
        errorHandler.showError('退出登录失败,请重试', logoutRes)
      }
    } catch (error) {
      console.log("退出登录失败,尝试绕过请求自动退出",error);
      // 手动清除本地存储
      localStorage.removeItem('user_token')
      localStorage.removeItem('token_expiry')
      isTokenValid.value = false
    }
  }).catch(() => {
    // 取消退出时不做任何操作
  })
  }

  </script>
  
  <style scoped>
  .main-layout {
    min-height: 100vh;
    background-color: #f5f7fa;
  }
  
  .header {
    background: linear-gradient(135deg, #409EFF 0%, #2c5282 100%);
    height: 64px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    color: white;
  }
  
  .title {
    font-size: 24px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: 0.5px;
  }
  
  .logo-icon {
    font-size: 28px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .login-text {
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .login-text:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
  
  .nav-menu {
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    padding: 0 24px;
  }
  
  .nav-menu :deep(.el-menu-item) {
    height: 56px;
    line-height: 56px;
    font-size: 15px;
  }
  
  .nav-menu :deep(.el-menu-item.is-active) {
    font-weight: 600;
  }
  
  .nav-menu :deep(.el-icon) {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    min-height: calc(100vh - 120px);
  }
  
  :deep(.el-button--small) {
    padding: 8px 16px;
  }
  
  :deep(.el-button--small .el-icon) {
    margin-right: 4px;
  }
  </style>