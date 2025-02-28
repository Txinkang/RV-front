<template>
  <div class="user-container">
    <div class="sidebar">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-vertical"
        router
        @select="handleSelect"
      >
        <el-menu-item index="/user/camp-info">
          <el-icon><Location /></el-icon>
          <span>营地管理</span>
        </el-menu-item>
        
        <el-menu-item index="/user/vehicle-info">
          <el-icon><Van /></el-icon>
          <span>车辆管理</span>
        </el-menu-item>

        <el-menu-item index="/user/camp-audit">
          <el-icon><Check /></el-icon>
          <span>营地审核</span>
        </el-menu-item>

        <el-menu-item index="/user/vehicle-audit">
          <el-icon><Document /></el-icon>
          <span>车辆审核</span>
        </el-menu-item>

        <el-menu-item index="/user/data-analyze">
          <el-icon><TrendCharts /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Location, Van, Check, Document, TrendCharts } from '@element-plus/icons-vue'

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
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  gap: 24px;
  padding: 24px;
}

.sidebar {
  width: 240px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-menu-vertical :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  font-size: 14px;
}

.el-menu-vertical :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: 500;
}

.el-menu-vertical :deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}

.el-menu-vertical :deep(.el-icon) {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  min-width: 0; /* 防止内容溢出 */
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .user-container {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }

  .sidebar {
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
