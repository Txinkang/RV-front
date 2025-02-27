<template>
    <div class="main-layout">
      <!-- 头部区域 -->
      <div class="header">
        <div class="title">房车在线租赁系统</div>
        <div class="user-info">
          <el-icon size="24"><User /></el-icon>
          <span v-if="!isTokenValid" @click="router.replace('/login')">登录</span>
          <el-button v-if="isTokenValid" type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
  
      <!-- 导航栏 -->
      <el-menu
        class="nav-menu"
        mode="horizontal"
        :default-active="activeMenu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/user">管理端</el-menu-item>
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
  import { User } from '@element-plus/icons-vue'
  import { useRouter, useRoute } from "vue-router";
  import { useUserStore } from '@/store/user.js'
  import userApi from '/Users/tangxinkang/Projects/RV/RV-front/rv-front-admin/src/api/user.js'
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
  }
  
  .header {
    background-color: #409EFF;
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
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .nav-menu {
    border-bottom: solid 1px #e6e6e6;
  }
  
  .content {
    padding: 20px;
  }
  </style>