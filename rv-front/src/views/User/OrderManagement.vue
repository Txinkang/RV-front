<template>
  <div class="order-management">
    <div class="page-header">
      <div class="header-left">
        <el-icon><Document /></el-icon>
        <h2>订单管理</h2>
      </div>
      <el-button type="primary" @click="checkOrder">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <el-card shadow="hover" class="table-card">
        <el-table 
          :data="orderCurrentPageData" 
          style="width: 100%"
          border
          class="order-table"
        >
          <el-table-column label="商品名称" min-width="120">
            <template #default="{ row }">
              <el-tag :type="row.payment_transaction_type === 1 ? 'warning' : 'success'" size="small">
                <el-icon>
                  <component :is="row.payment_transaction_type === 1 ? 'Van' : 'Location'" />
                </el-icon>
                {{ row.payment_transaction_type === 1 ? '车辆' : '营地' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="开始时间" min-width="150">
            <template #default="{ row }">
              <div class="time-info">
                <el-icon><Timer /></el-icon>
                {{ formatDate(row.start_date) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="结束时间" min-width="150">
            <template #default="{ row }">
              <div class="time-info">
                <el-icon><Timer /></el-icon>
                {{ formatDate(row.end_date) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="总价" min-width="120">
            <template #default="{ row }">
              <span class="price">¥ {{ row.total_price }}</span>
            </template>
          </el-table-column>

          <el-table-column label="订单状态" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.payment_status)" effect="light">
                {{ formatOrderStatus(row.payment_status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="发票" min-width="120" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons" v-if="row.payment_status === 0">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleGenerateInvoice(row.payment_id, row.total_price)"
                >
                  <el-icon><Tickets /></el-icon>
                  开具发票
                </el-button>
                <el-button 
                  type="info" 
                  size="small" 
                  @click="handleCheckInvoice(row.payment_id)"
                >
                  <el-icon><Document /></el-icon>
                  查看发票
                </el-button>
              </div>
              <el-tag v-else type="info">暂无发票</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <SmartPagination
            v-model:current-page="orderPagination.currentPage"
            :server-page-size="orderPagination.serverPageSize"
            :display-page-size="orderPagination.displayPageSize"
            :total="orderPagination.totalItems"
            @load-data="handleOrderLoadData" 
          />
        </div>
      </el-card>

      <!-- 发票弹窗 -->
      <el-dialog 
        v-model="dialogVisible" 
        title="发票详情" 
        width="400px"
        class="invoice-dialog"
      >
        <el-descriptions :column="1" border>
          <el-descriptions-item label="发票金额">
            <span class="price">¥ {{ invoiceForm.invoiceTotalAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发票代码">
            {{ invoiceForm.invoiceNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="开票日期">
            {{ invoiceForm.invoiceIssueDate }}
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import { ref } from 'vue'
import { payApi } from '../../api/user/pay'
import { errorHandler } from '../../utils/errorHandler'
import { ElMessage } from 'element-plus'
import {
  Document, Refresh, Timer, Van, Location,
  Tickets, Check, Close
} from '@element-plus/icons-vue'

const loading = ref(false)

// 发票弹窗
const dialogVisible = ref(false);
const invoiceForm = ref({
  invoiceTotalAmount: '',
  invoiceNumber: '',
  invoiceIssueDate: ''
})

// 查看订单
const checkOrder = async () => {
  try{
    clearOrderCache()
    const res = await payApi.checkOrder()
    if(res.code === 200){
      ElMessage.success("获取订单成功")
      orderPagination.value.totalItems = res.data.length
      orderPagination.value.cachedData.set(orderPagination.value.serverPage, res.data)
      console.log("获取订单成功",res)
    }else{
      errorHandler.showError("获取订单失败",res)
    }
  }catch(error){
    errorHandler.showError("获取订单失败",error)
  }
}
// 开具发票
const handleGenerateInvoice = async (id,totalPrice) => {
  try{
    const requestData = {
      paymentId: id,
      paymentTotalPrice: totalPrice
    }
    console.log("开具发票请求数据",requestData)
    const res = await payApi.generateInvoice(requestData)
    if(res.code === 200){
      ElMessage.success("开具发票成功，请稍后查看")
      console.log("开具发票成功",res)
    }else if(res.code === 429){
      ElMessage.error("该发票已开具")
    }else{
      errorHandler.showError("开具发票失败",res)
    }
  }catch(error){
    errorHandler.showError("开具发票失败",error)
  }
}
// 查看发票
const handleCheckInvoice = async (id) => {
  try{
    const requestData = {
      invoicePaymentId: id
    }
    console.log("查看发票请求数据",requestData)
    const res = await payApi.checkInvoice(requestData)
    if(res.code === 200){
      ElMessage.success("查看发票成功")
      console.log("查看发票成功",res)
      invoiceForm.value.invoiceTotalAmount = res.data.invoiceTotalAmount
      invoiceForm.value.invoiceNumber = res.data.invoiceNumber
      invoiceForm.value.invoiceIssueDate = res.data.invoiceIssueDate
      dialogVisible.value = true
    }else if(res.code === 430){
      ElMessage.error("暂未开具发票")
    }else{
      errorHandler.showError("查看发票失败",res)
    }
  }catch(error){
    errorHandler.showError("查看发票失败",error)
  }
}

//===============================分页========================================
const orderPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 20, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const {
  currentPageData: orderCurrentPageData,
  handleLoadData: handleOrderLoadData,
  clearCache: clearOrderCache
} = usePagination(checkOrder, orderPagination)


// 根据时间戳转换为日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
}
// 根据订单状态转换为中文
const formatOrderStatus = (status) => {
  if(status === 0){
    return '支付成功'
  }else if(status === 1){
    return '支付失败'
  }else if(status === 2){
    return '退款成功'
  }else if(status === 3){
    return '退款失败'
  }
}

// 添加状态类型映射函数
const getStatusType = (status) => {
  const statusMap = {
    0: 'success',   // 支付成功
    1: 'danger',    // 支付失败
    2: 'warning',   // 退款成功
    3: 'info'       // 退款失败
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.order-management {
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

.content-wrapper {
  background-color: #f5f7fa;
  border-radius: 8px;
  min-height: calc(100vh - 180px);
}

.table-card {
  margin-bottom: 20px;
}

.order-table {
  margin-bottom: 20px;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 15px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
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

.invoice-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }

  :deep(.el-descriptions__cell) {
    padding: 16px 24px;
  }
}
</style> 