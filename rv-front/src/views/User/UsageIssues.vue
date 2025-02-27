<template>
  <div class="usage-issues">
    <h2>使用问题</h2>
    <el-button type="primary" @click="handleSearch">搜索</el-button>
    <el-button type="primary" @click="handleAskQuestionsDialog">提出问题</el-button>
    <div class="content-placeholder">
      <!-- 使用问题列表 -->
      <div>
        <el-table :data="usageIssuesCurrentPageData" style="width: 100%">
        <el-table-column label="问题描述">
          <template #default="scope">
            <span>{{ scope.row.userQuestionDetails }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提出日期">
          <template #default="scope">
            <span>{{ formatDate(scope.row.userQuestionCreatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最新解决日期">
          <template #default="scope">
            <span>{{ formatDate(scope.row.userQuestionUpdatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="问题状态">
          <template #default="scope">
            <span>{{ formatQuestionStatus(scope.row.userQuestionStatus) }}</span>
          </template>
        </el-table-column>
      </el-table>
      </div>  
      
      <!-- 分页 -->
      <div>
        <SmartPagination
          v-model:current-page="usageIssuesPagination.currentPage"
          :server-page-size="usageIssuesPagination.serverPageSize"
          :display-page-size="usageIssuesPagination.displayPageSize"
          :total="usageIssuesPagination.totalItems"
          @load-data="handleUsageIssuesLoadData" />
      </div>

      <!-- 提出问题弹窗 -->
      <el-dialog v-model="askQuestionsDialog" title="提出问题" width="500px">
        <el-input 
          v-model="askQuestionsContent" 
          placeholder="请输入问题描述" 
          type="textarea" 
          :autosize="{ minRows: 4 }" 
          style="margin-bottom: 10px;"
          />
        <el-button type="primary" @click="handleAskQuestions">提交</el-button>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import issueApi from '../../api/user/issue';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
//搜索
const handleSearch = async () => {
  try {
    clearUsageIssuesCache();
    const res = await issueApi.questionsInfo();
    if (res.code === 200) {
      ElMessage.success('搜索成功');
      usageIssuesPagination.value.totalItems = res.data.length;
      usageIssuesPagination.value.cachedData.set(usageIssuesPagination.value.serverPage, res.data);
      console.log('搜索成功',res);
    } else {
      errorHandler.showError("搜索失败", res);
    }
    console.log(res);
  } catch (error) {
    errorHandler.showError("搜索失败", error);
  }
}

const handleAskQuestions = async () => {
  try {
    const requestData = {
      questionsDetails: askQuestionsContent.value
    }
    const res = await issueApi.askQuestions(requestData);
    if (res.code === 200) {
      ElMessage.success('提交成功');
      askQuestionsDialog.value = false;
      askQuestionsContent.value = '';
      console.log('提交成功',res);
      handleSearch();
    } else {
      errorHandler.showError("提交失败", error);
    }
  } catch (error) {
    errorHandler.showError("提交失败", error);
  }
};

// 分页
const usageIssuesPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 20, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const {
  currentPageData: usageIssuesCurrentPageData,
  handleLoadData: handleUsageIssuesLoadData,
  clearCache: clearUsageIssuesCache
} = usePagination(handleSearch, usageIssuesPagination)

// 对话框
const askQuestionsDialog = ref(false);
const askQuestionsContent = ref('');
const handleAskQuestionsDialog = () => {
  askQuestionsDialog.value = true;
};

// 根据时间戳转换为日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
}
// 根据订单状态转换为中文
const formatQuestionStatus = (status) => {
  if(status === 0){
    return '未处理'
  }else if(status === 1){
    return '处理中'
  }else if(status === 2){
    return '已解决'
  }
}

</script>

<style scoped>
.usage-issues {
  padding: 20px;
}

.content-placeholder {
  margin-top: 20px;
  min-height: 300px;
}
</style> 