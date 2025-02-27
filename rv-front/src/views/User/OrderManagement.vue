<template>
  <div class="order-management">
    <h2>订单管理</h2>
    <el-button type="primary" @click="checkOrder">查看订单</el-button>
    <div class="content-placeholder">
      <!-- 订单列表 -->
      <div>
        <el-table :data="orderCurrentPageData" style="width: 100%">
        <el-table-column label="商品名称">
          <template #default="scope">
            <span>{{ scope.row.payment_transaction_type === 1 ? '车辆' : '营地' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开始时间">
          <template #default="scope">
            <span>{{ formatDate(scope.row.start_date) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间">
          <template #default="scope">
            <span>{{ formatDate(scope.row.end_date) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总价">
          <template #default="scope">
            <span>{{ scope.row.total_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态">
          <template #default="scope">
            <span>{{ formatOrderStatus(scope.row.payment_status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发票">
          <template #default="scope">
            <el-button v-if="scope.row.payment_status === 0" type="primary" size="small" @click="handleGenerateInvoice(scope.row.payment_id,scope.row.total_price)">开具</el-button>
            <el-button v-if="scope.row.payment_status === 0" type="primary" size="small" @click="handleCheckInvoice(scope.row.payment_id)">查看</el-button>
            <span v-else>暂无</span>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 分页 -->
      <div>
        <SmartPagination
          v-model:current-page="orderPagination.currentPage"
          :server-page-size="orderPagination.serverPageSize"
          :display-page-size="orderPagination.displayPageSize"
          :total="orderPagination.totalItems"
          @load-data="handleOrderLoadData" />
      </div>

      <!-- 发票弹窗 -->
      <div>
        <el-dialog v-model="dialogVisible" title="发票">
          <el-form :model="invoiceForm" label-width="100px">
            <el-form-item label="发票金额">
              <el-input v-model="invoiceForm.invoiceTotalAmount" disabled />
            </el-form-item>
            <el-form-item label="发票代码">
              <el-input v-model="invoiceForm.invoiceNumber" disabled />
            </el-form-item>
            <el-form-item label="发票开票日期">
              <el-input v-model="invoiceForm.invoiceIssueDate" disabled />
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
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
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.content-placeholder {
  margin-top: 20px;
  min-height: 300px;
}
</style> 