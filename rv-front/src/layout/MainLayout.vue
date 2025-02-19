<template>
    <div class="main-layout">
      <!-- 头部区域 -->
      <div class="header">
        <div class="title">房车在线租赁系统</div>
        <div class="user-info">
          <el-icon size="24"><User /></el-icon>
          <span>登录</span>
        </div>
      </div>
  
      <!-- 导航栏 -->
      <el-menu
        :default-active="activeIndex"
        class="nav-menu"
        mode="horizontal"
        router
      >
        <el-menu-item index="/booking-vehicle">预定车辆</el-menu-item>
        <el-menu-item index="/booking-camp">预定营地</el-menu-item>
        <el-menu-item index="/upload">上传信息</el-menu-item>
        <el-menu-item index="/my">我的</el-menu-item>
      </el-menu>
  
      <!-- 内容区域 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { User } from '@element-plus/icons-vue'
  
  const activeIndex = ref('/booking-vehicle')
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