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
            营地管理
        </el-menu-item>
        
        <el-menu-item index="/user/vehicle-info">
            车辆管理
        </el-menu-item>

        <el-menu-item index="/user/camp-audit">
            营地审核
        </el-menu-item>

        <el-menu-item index="/user/vehicle-audit">
            车辆审核
        </el-menu-item>

        <el-menu-item index="/user/data-analyze">
            数据分析
        </el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'


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
  min-height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
}

.sidebar {
  width: 220px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 确保图标和文字垂直居中 */
.el-menu-item {
  display: flex;
  align-items: center;
}

.el-menu-item .el-icon {
  margin-right: 8px;
}
</style>
