<template>
  <div class="feedback">
    <div class="page-header">
      <div class="header-left">
        <el-icon><ChatLineSquare /></el-icon>
        <h2>意见反馈</h2>
      </div>
    </div>

    <div class="content-wrapper">
      <el-card shadow="hover" class="feedback-card">
        <el-form :model="feedbackForm" label-width="100px" class="feedback-form">
          <div class="form-header">
            <el-icon class="header-icon"><Comment /></el-icon>
            <h3>我们期待您的反馈</h3>
            <p class="subtitle">您的反馈对我们很重要，帮助我们提供更好的服务</p>
          </div>

          <el-form-item label="反馈内容">
            <el-input 
              v-model="feedbackForm.feedbackContent" 
              type="textarea" 
              :autosize="{ minRows: 6, maxRows: 10 }" 
              placeholder="请详细描述您的建议或遇到的问题..."
              class="feedback-input"
            />
          </el-form-item>

          <el-form-item label="满意度">
            <div class="satisfaction-wrapper">
              <el-rate 
                v-model="feedbackForm.feedbackSatisfaction"
                :colors="['#F56C6C', '#E6A23C', '#67C23A']"
                :texts="['很差', '一般', '满意', '很满意', '非常满意']"
                show-text
              />
            </div>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button @click="handleFeedbackCancel">
                <el-icon><Close /></el-icon>
                取消
              </el-button>
              <el-button type="primary" @click="handleFeedback">
                <el-icon><Check /></el-icon>
                提交反馈
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import issueApi from '../../api/user/issue';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';
import {
  ChatLineSquare, Comment, Check, Close
} from '@element-plus/icons-vue'

const feedbackForm = ref({
  feedbackContent: '',
  feedbackSatisfaction: 0
});

const handleFeedback = async () => {
  try {
    if(feedbackForm.value.feedbackContent === '' || feedbackForm.value.feedbackSatisfaction === 0){
      ElMessage.error('反馈内容不能为空');
      return;
    }
    const requestData = {
      feedbackContent:feedbackForm.value.feedbackContent,
      feedbackSatisfaction:feedbackForm.value.feedbackSatisfaction
    }
    console.log("提交反馈数据",requestData);
    const res = await issueApi.feedback(requestData);
    if (res.code === 200) {
      ElMessage.success('提交成功');
      feedbackForm.value.feedbackContent = '';
      feedbackForm.value.feedbackSatisfaction = 0;
      console.log('提交成功',res);
    } else {
      errorHandler.showError("提交失败", res);
    }
  } catch (error) {
    errorHandler.showError("提交失败", error);
  }
}
const handleFeedbackCancel = () => {
  feedbackForm.value.feedbackContent = '';
  feedbackForm.value.feedbackSatisfaction = 0;
}
</script>

<style scoped>
.feedback {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.content-wrapper {
  background-color: #f5f7fa;
  border-radius: 8px;
  min-height: calc(100vh - 180px);
  padding: 20px;
}

.feedback-card {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  text-align: center;
}

.header-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 16px;
}

.form-header h3 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.feedback-form {
  padding: 20px 0;
}

.feedback-input {
  :deep(.el-textarea__inner) {
    font-size: 14px;
    line-height: 1.8;
  }
}

.satisfaction-wrapper {
  padding: 10px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-rate) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-rate__text) {
  font-size: 14px;
  color: #606266;
}
</style> 