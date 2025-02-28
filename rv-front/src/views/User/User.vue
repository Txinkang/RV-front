<template>
  <div class="user-container">
    <el-card class="sidebar" shadow="hover">
      <div class="user-profile">
        <el-avatar :size="64" class="user-avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <h3 class="user-name">个人中心</h3>
      </div>
      <el-menu
        :default-active="activeIndex"
        class="el-menu-vertical"
        router
        @select="handleSelect"
      >
        <el-menu-item index="/user/camp-reservations">
          <el-icon><Calendar /></el-icon>
          <template #title>已预定营地</template>
        </el-menu-item>
        
        <el-menu-item index="/user/vehicle-reservations">
          <el-icon><Van /></el-icon>
          <template #title>已预定车辆</template>
        </el-menu-item>
        
        <el-menu-item index="/user/camp-info">
          <el-icon><Location /></el-icon>
          <template #title>营地信息</template>
        </el-menu-item>
        
        <el-menu-item index="/user/vehicle-info">
          <el-icon><TakeawayBox /></el-icon>
          <template #title>车辆信息</template>
        </el-menu-item>
        
        <el-menu-item index="/user/personal-info">
          <el-icon><UserFilled /></el-icon>
          <template #title>个人信息</template>
        </el-menu-item>
        
        <el-menu-item index="/user/order-management">
          <el-icon><Document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        
        <el-menu-item index="/user/usage-issues">
          <el-icon><Warning /></el-icon>
          <template #title>使用问题</template>
        </el-menu-item>
        
        <el-menu-item index="/user/feedback">
          <el-icon><ChatLineSquare /></el-icon>
          <template #title>反馈</template>
        </el-menu-item>
      </el-menu>
    </el-card>

    <div class="main-content">
      <el-card class="content-card" shadow="hover">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  User, Calendar, Van, Location, TakeawayBox, 
  UserFilled, Document, Warning, ChatLineSquare 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const activeIndex = ref(route.path)

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath;
  },
  { immediate: true }
);

// 处理菜单选择
const handleSelect = (key) => {
  activeIndex.value = key
  router.push(key)
}
</script>

<style scoped>
.user-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.sidebar {
  width: 260px;
  height: fit-content;
  border-radius: 8px;
  background-color: white;
}

.user-profile {
  padding: 24px 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.user-avatar {
  background-color: #409EFF;
  margin-bottom: 12px;
}

.user-name {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 4px;
}

.el-menu-item:hover {
  background-color: #ecf5ff !important;
}

.el-menu-item.is-active {
  background-color: #409EFF !important;
  color: white !important;
}

.el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  height: 24px;
}

.main-content {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.content-card {
  min-height: 100%;
  border-radius: 8px;
  background-color: white;
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

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .user-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .el-menu-vertical {
    display: flex;
    flex-wrap: wrap;
  }

  .el-menu-item {
    width: 50%;
  }
}
</style>
