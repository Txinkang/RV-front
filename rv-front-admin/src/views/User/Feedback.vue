<template>
  <div class="feedback">
    <div class="page-header">
      <h2>用户反馈</h2>
      <el-button type="primary" @click="fetchFeedback">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <div class="content-wrapper">
      <!-- 表格区域 -->
      <div class="table-section">
        <el-table 
          :data="feedbackData" 
          style="width: 100%" 
          border
          stripe
          v-loading="loading"
        >
          <el-table-column 
            label="反馈ID" 
            prop="userFeedbackId" 
            min-width="100"
            align="center"
          />

          <el-table-column 
            label="用户ID" 
            prop="userFeedbackUserId" 
            min-width="100"
            align="center"
          />

          <el-table-column 
            label="反馈内容" 
            prop="userFeedbackContent" 
            min-width="300"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.userFeedbackContent || '未填写内容' }}</span>
            </template>
          </el-table-column>

          <el-table-column 
            label="满意度评分" 
            prop="userFeedbackSatisfaction" 
            min-width="150"
            align="center"
          >
            <template #default="{ row }">
              <el-rate 
                v-model="row.userFeedbackSatisfaction" 
                disabled 
                show-score
                text-color="#ff9900"
              />
            </template>
          </el-table-column>

          <el-table-column 
            label="反馈时间" 
            min-width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDate(row.userFeedbackDate) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空数据显示 -->
      <el-empty
        v-if="feedbackData.length === 0 && !loading"
        description="暂无反馈数据"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import issueApi from '../../api/user/issue.js'
import { errorHandler } from '../../utils/errorHandler.js'
import { ElMessage } from 'element-plus'

// 数据
const feedbackData = ref([])
const loading = ref(false)

// 获取反馈数据
const fetchFeedback = async () => {
  loading.value = true
  try {
    const res = await issueApi.getFeedback()
    if (res.code === 200) {
      feedbackData.value = res.data
      ElMessage.success('反馈数据获取成功')
    } else {
      errorHandler.showError('获取反馈数据失败', res)
    }
  } catch (error) {
    errorHandler.showError('获取反馈数据失败', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 页面加载时获取数据
onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
.feedback {
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
  min-height: 400px;
}

.table-section {
  margin-bottom: 24px;
}

:deep(.el-button--primary) {
  background: linear-gradient(to right, #409EFF, #2c5282);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(to right, #66b1ff, #3a6aa8);
  border: none;
}

:deep(.el-button .el-icon) {
  margin-right: 4px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}

:deep(.el-rate) {
  display: inline-flex;
  justify-content: center;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .content-wrapper {
    padding: 16px;
  }
}
</style>
