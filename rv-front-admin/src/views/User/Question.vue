<template>
    <div class="usage-issues">
      <div class="page-header">
        <div class="header-left">
          <el-icon><Warning /></el-icon>
          <h2>使用问题</h2>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
  
      <div class="content-wrapper" v-loading="loading">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="usageIssuesCurrentPageData" 
            style="width: 100%"
            border
            class="issues-table"
          >
            <el-table-column label="问题描述" min-width="300">
              <template #default="{ row }">
                <div class="issue-content">
                  <el-icon><QuestionFilled /></el-icon>
                  <el-tooltip 
                    :content="row.userQuestionDetails" 
                    placement="top" 
                    :hide-after="0"
                  >
                    <span class="issue-text">{{ row.userQuestionDetails }}</span>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
  
            <el-table-column label="问题回复" min-width="300">
              <template #default="{ row }">
                <div class="issue-content">
                  <el-tooltip 
                    :content="row.userQuestionAnswer" 
                    placement="top" 
                    :hide-after="0"
                  >
                    <span class="issue-text">{{ row.userQuestionAnswer }}</span>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
  
            <el-table-column label="提出日期" min-width="150">
              <template #default="{ row }">
                <div class="time-info">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(row.userQuestionCreatedAt) }}
                </div>
              </template>
            </el-table-column>
  
            <el-table-column label="最新解决日期" min-width="150">
              <template #default="{ row }">
                <div class="time-info">
                  <el-icon><Timer /></el-icon>
                  {{ formatDate(row.userQuestionUpdatedAt) }}
                </div>
              </template>
            </el-table-column>
  
            <el-table-column label="问题状态" min-width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.userQuestionStatus)" effect="light">
                  <el-icon>
                    <component :is="getStatusIcon(row.userQuestionStatus)" />
                  </el-icon>
                  {{ formatQuestionStatus(row.userQuestionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="120">
                <template #default="{ row }">
                    <el-button type="primary" @click="handleAnswerDialog(row)" >回复</el-button>
                </template>
            </el-table-column>
          </el-table>
  
          <!-- 分页 -->
          <div class="pagination-wrapper">
            <SmartPagination
              v-model:current-page="usageIssuesPagination.currentPage"
              :server-page-size="usageIssuesPagination.serverPageSize"
              :display-page-size="usageIssuesPagination.displayPageSize"
              :total="usageIssuesPagination.totalItems"
              @load-data="handleUsageIssuesLoadData" 
            />
          </div>
        </el-card>
  
        <!-- 问题回复弹窗 -->
        <el-dialog 
          v-model="answerDialog" 
          title="问题回复" 
          width="500px"
          class="question-dialog"
        >
          <div class="question-form">
            <el-input 
              v-model="answerContent" 
              type="textarea" 
              :autosize="{ minRows: 4, maxRows: 8 }" 
              placeholder="请回复问题..."
            />
            <div class="dialog-footer">
              <el-button @click="answerDialog = false">取消</el-button>
              <el-button type="primary" @click="handleAnswer(answerRow)">
                <el-icon><Check /></el-icon>
                提交回复
              </el-button>
            </div>
          </div>
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
  import {
    Warning, Refresh, Plus, QuestionFilled, Calendar,
    Timer, Check, Loading, CircleCheck, CircleClose
  } from '@element-plus/icons-vue'
  
  const loading = ref(false)
  
  //搜索
  const handleSearch = async () => {
    try {
      clearUsageIssuesCache();
      const res = await issueApi.questionsInfo();
      if (res.code === 200) {
        console.log('搜索成功',res);
        ElMessage.success('搜索成功');
        usageIssuesPagination.value.totalItems = res.data.length;
        usageIssuesPagination.value.cachedData.set(usageIssuesPagination.value.serverPage, res.data);
      } else {
        errorHandler.showError("搜索失败", res);
      }
      console.log(res);
    } catch (error) {
      errorHandler.showError("搜索失败", error);
    }
  }
  
  const handleAnswer = async (row) => {
    try {
      const requestData = {
        userQuestionId: row.userQuestionId,
        userQuestionAnswer: answerContent.value
      }
      const res = await issueApi.answer(requestData);
      if (res.code === 200) {
        ElMessage.success('提交成功');
        answerDialog.value = false;
        answerContent.value = '';
        console.log('提交成功',res);
        handleSearch();
      } else {
        errorHandler.showError("提交失败", res);
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
  const answerDialog = ref(false);
  const answerContent = ref('');
  const answerRow = ref(null);
  const handleAnswerDialog = (row) => {
    answerDialog.value = true;
    answerRow.value = row;
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
  
  // 添加状态类型映射函数
  const getStatusType = (status) => {
    const statusMap = {
      0: 'info',     // 未处理
      1: 'warning',  // 处理中
      2: 'success'   // 已解决
    }
    return statusMap[status] || 'info'
  }
  
  // 添加状态图标映射函数
  const getStatusIcon = (status) => {
    const iconMap = {
      0: 'CircleClose',   // 未处理
      1: 'Loading',       // 处理中
      2: 'CircleCheck'    // 已解决
    }
    return iconMap[status] || 'CircleClose'
  }
  </script>
  
  <style scoped>
  .usage-issues {
    padding: 20px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
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
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
  
  .content-wrapper {
    background-color: #f5f7fa;
    border-radius: 8px;
    min-height: calc(100vh - 180px);
  }
  
  .table-card {
    margin-bottom: 20px;
  }
  
  .issues-table {
    margin-bottom: 20px;
  }
  
  .issue-content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  
  .issue-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: #606266;
  }
  
  .time-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .question-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
  
  :deep(.el-table) {
    --el-table-border-color: #e4e7ed;
    --el-table-header-bg-color: #f5f7fa;
  }
  
  :deep(.el-button) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  :deep(.el-tag) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
  }
  
  .question-dialog {
    :deep(.el-dialog__body) {
      padding: 20px 30px;
    }
  }
  </style> 