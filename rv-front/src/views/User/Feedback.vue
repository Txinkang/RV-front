<template>
  <div class="feedback">
    <h2>反馈</h2>
    <div class="content-placeholder">
      <el-form :model="feedbackForm">
        <el-form-item label="反馈内容">
          <el-input v-model="feedbackForm.feedbackContent" type="textarea" :autosize="{ minRows: 10 }" />
        </el-form-item>
        <el-form-item label="满意度">
          <el-rate v-model="feedbackForm.feedbackSatisfaction" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFeedback">提交</el-button>
          <el-button type="primary" @click="handleFeedbackCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import issueApi from '../../api/user/issue';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';

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

.content-placeholder {
  margin-top: 20px;
  min-height: 300px;
}
</style> 