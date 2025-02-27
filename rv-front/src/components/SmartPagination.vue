<template>
  <div class="smart-pagination">
    <el-pagination
      v-model:current-page="displayPage"
      :page-size="displayPageSize"
      :total="totalDisplayItems"
      layout="prev, pager, next"
      background
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 实际的后端分页大小
  serverPageSize: {
    type: Number,
    default: 30
  },
  // 显示的分页大小
  displayPageSize: {
    type: Number,
    default: 10
  },
  // 总数据量
  total: {
    type: Number,
    required: true
  },
  // 当前页码
  currentPage: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:currentPage', 'load-data'])

// 显示用的页码
const displayPage = ref(1)
// 保存上一次的服务器页码
const lastServerPage = ref(1)

// 计算实际需要显示的总条目数
const totalDisplayItems = computed(() => props.total)

// 计算当前显示页码对应的服务器页码
const getServerPage = (displayPageNum) => {
  const itemIndex = (displayPageNum - 1) * props.displayPageSize
  return Math.floor(itemIndex / props.serverPageSize) + 1
}

// 处理页码变化
const handlePageChange = (newDisplayPage) => {
  const newServerPage = getServerPage(newDisplayPage)

  console.log('页码变化:', {
    newDisplayPage,
    lastServerPage: lastServerPage.value,
    newServerPage,
    displayPageSize: props.displayPageSize,
    serverPageSize: props.serverPageSize
  })

  displayPage.value = newDisplayPage

  // 使用保存的上一次服务器页码进行比较
  if (lastServerPage.value !== newServerPage) {
    emit('load-data', newServerPage)
    lastServerPage.value = newServerPage  // 更新保存的服务器页码
  }

  emit('update:currentPage', newDisplayPage)
}

// 监听父组件页码变化
watch(() => props.currentPage, (newVal) => {
  displayPage.value = newVal
})
</script>

<style scoped>
.smart-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
