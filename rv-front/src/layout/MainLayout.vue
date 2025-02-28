<template>
    <div class="main-layout">
      <!-- 头部区域 -->
      <div class="header">
        <div class="header-content">
          <div class="title">
            <el-icon class="logo-icon"><Van /></el-icon>
            房车在线租赁系统
          </div>
          <div class="user-info" :class="{ 'logged-in': isTokenValid }">
            <el-icon size="20"><User /></el-icon>
            <span v-if="!isTokenValid" class="login-text" @click="router.replace('/login')">登录</span>
            <el-button v-if="isTokenValid" type="danger" size="small" class="logout-btn" @click="handleLogout">
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
        <el-menu-item index="/booking-vehicle">
          <el-icon><Van /></el-icon>
          <span>预定车辆</span>
        </el-menu-item>
        <el-menu-item index="/booking-camp">
          <el-icon><House /></el-icon>
          <span>预定营地</span>
        </el-menu-item>
        <el-menu-item index="/upload">
          <el-icon><Upload /></el-icon>
          <span>上传信息</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><UserFilled /></el-icon>
          <span>我的</span>
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
  import { User, Van, House, Upload, UserFilled, SwitchButton } from '@element-plus/icons-vue'
  import { useRouter, useRoute } from "vue-router";
  import { useUserStore } from '@/store/user.js'
  import { userApi } from '@/api/user/user.js'
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
    }
  );
  function handleMenuSelect(index) {
    router.push(index).then(() => {
      activeMenu.value = index;
    }).catch((err) => {
      console.error('Navigation failed:', err);
      // 如果导航失败，将 activeMenu 重置为当前路由路径
      activeMenu.value = route.path;
    });
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
    /* background: url('/src/assets/image2.jpg') no-repeat center center fixed;
    background-size: cover; */
  }
  
  .header {
    background: linear-gradient(135deg, #409EFF 0%, #2c8af8 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    color: white;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 10px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .logo-icon {
    font-size: 28px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 20px;
    transition: all 0.3s ease;
  }
  
  .user-info:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .login-text {
    font-size: 15px;
    font-weight: 500;
  }
  
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 20px;
    transition: all 0.3s ease;
  }
  
  .nav-menu {
    padding: 0;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
  }
  
  .el-menu-item {
    height: 56px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    margin: 0 10px;
  }
  
  .el-menu-item:hover {
    background-color: #f0f7ff !important;
  }
  
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    min-height: calc(100vh - 116px);
  }
  
  /* 过渡动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>