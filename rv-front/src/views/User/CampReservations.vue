<template>
  <div class="camp-reservations">
    <div class="page-header">
      <el-icon><Calendar /></el-icon>
      <h2>已预定营地</h2>
    </div>

    <div class="reservation-content" v-loading="loading">
      <el-empty v-if="!hasReservation" description="暂无预订信息" />
      
      <el-form 
        v-else
        :model="campReservations" 
        label-width="100px" 
        class="reservation-form"
      >
        <el-descriptions :column="1" border>
          <el-descriptions-item label="营地名称">
            <el-tag size="large">
              <el-icon><House /></el-icon>
              {{ campReservations.camp_name }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="营地地址">
            <div class="location-info">
              <el-icon><Location /></el-icon>
              {{ campReservations.camp_location }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="开始时间">
            <div class="time-info">
              <el-icon><Timer /></el-icon>
              {{ campReservations.camp_start_date }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="结束时间">
            <div class="time-info">
              <el-icon><Timer /></el-icon>
              {{ campReservations.camp_end_date }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="总价">
            <span class="price">¥ {{ campReservations.camp_total_price }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons">
          <template v-if="campReservations.camp_status === 0">
            <el-button type="primary" @click="dialogVisible = true">
              <el-icon><Wallet /></el-icon>
              付款
            </el-button>
            <el-button type="danger" @click="handleCancel">
              <el-icon><Close /></el-icon>
              取消预订
            </el-button>
          </template>
          
          <el-button 
            v-if="campReservations.camp_status === 2"
            type="warning" 
            @click="handleRefund"
          >
            <el-icon><RefreshLeft /></el-icon>
            申请退款
          </el-button>
        </div>
      </el-form>
    </div>

    <el-dialog 
      v-model="dialogVisible" 
      title="租赁合同确认" 
      width="50%"
      class="rental-dialog"
    >
      <div class="contract-content">
        <h3 class="contract-title">营地租赁合同</h3>
        <el-scrollbar height="400px">
          <div class="contract-text">
            {{ contractText }}
          </div>
        </el-scrollbar>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button type="primary" @click="handleRent">
            <el-icon><Check /></el-icon>
            确认租赁
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { campApi } from '../../api/user/camp.js'
import { ElMessage } from 'element-plus'
import { errorHandler } from '../../utils/errorHandler.js'
import { payApi } from '../../api/user/pay.js'
import { 
  Calendar, House, Location, Timer, Wallet, 
  Close, RefreshLeft, Check 
} from '@element-plus/icons-vue'

const campReservations = ref({
  camp_start_date: null,
  camp_location: null,
  camp_name: null,
  camp_end_date: null,
  camp_total_price: null,
  camp_reservation_id: null,
  camp_id: null
});

const loading = ref(false);
const hasReservation = computed(() => {
  return Object.keys(campReservations.value).length > 0;
});

// 合同文本
const contractText = `第一条 租赁内容

甲方同意将其拥有的营地（以下简称"营地"）租赁给乙方使用，乙方同意按照合同约定的条件租赁该营地。

第四条 设施及使用
	1.	甲方提供以下设施：
	•	电力、供水、供暖等基本设施；
	•	垃圾处理和清洁服务；
	•	其他 [具体设施或服务]。
	2.	乙方应合理使用营地及其设施，保持营地环境的清洁和卫生，禁止擅自改变营地的结构、设施或用作非预定用途。

第五条 甲方的权利与义务
	1.	甲方应确保营地在租赁期间安全、卫生，符合有关安全标准；
	2.	甲方有权在营地发生不可抗力或其他特殊情况时提前解除合同，并退还乙方未使用部分的租金。

第六条 乙方的权利与义务
	1.	乙方应按照合同约定支付租金；
	2.	乙方不得擅自转租、转借或转让营地给第三方；
	3.	乙方不得在营地内从事非法活动，并应遵守相关法律法规；
	4.	如乙方未按期支付租金，甲方有权解除合同并要求乙方支付违约金。

第七条 违约责任
	1.	乙方未按时支付租金，每逾期一天应支付租金的 10 % 作为违约金；
	2.	若乙方提前退租，已支付的租金不予退还，且乙方应支付剩余租期的 10 % 作为违约赔偿。

第八条 不可抗力

因自然灾害、政府行为等不可抗力原因，甲方或乙方未能履行本合同的部分或全部义务，双方可协商重新约定履行期限或解除合同。

第九条 合同的变更与解除
	1.	双方可协商一致，书面形式变更或解除本合同；
	2.	任何一方未履行合同条款，另一方有权解除合同并要求赔偿。

第十条 争议解决

本合同的解释及争议解决应适用中华人民共和国的法律。若合同执行过程中发生争议，双方应友好协商，协商不成的，任一方可向合同签署地的人民法院提起诉讼。

第十一条 其他
	1.	本合同自双方签字盖章之日起生效；
	2.	本合同一式两份，甲乙双方各执一份，具有同等法律效力。`;

const getCampReservations = async () => {
  loading.value = true;
  try {
    const res = await campApi.checkBookedCampground();
    if(res.code === 200){
      ElMessage.success("查看营地成功");
      campReservations.value = res.data;
      campReservations.value.camp_start_date = formatDate(campReservations.value.camp_start_date);
      campReservations.value.camp_end_date = formatDate(campReservations.value.camp_end_date);
      console.log("查看营地成功",campReservations.value);
    }else if(res.code === 417){
      ElMessage.warning("用户暂无预订");
      campReservations.value = {};
    }else{
      errorHandler.showError("查看营地失败",res);
    }
  } catch (error) {
    errorHandler.showError("查看营地失败",error);
  } finally {
    loading.value = false;
  }
}

// 租赁
const handleRent = async () => {
  try {
    const requestData = {
      paymentVehicleReservationId:null,
      paymentCampgroundReservationId:campReservations.value.camp_reservation_id,
      paymentTransactionType:1 //0车辆、1营地
    }
    const res = await payApi.payment(requestData);
    if(res.code === 200){
      ElMessage.success("租赁营地成功");
      dialogVisible.value = false;
      await getCampReservations();
    }else if(res.code === 421){
      ElMessage.warning("用户余额不足");
    }else{
      errorHandler.showError("租赁营地失败",res);
    }
  } catch (error) {
    errorHandler.showError("租赁营地失败",error);
  }
}

// 取消
const handleCancel = async () => {
  try {
    const requestData = {
      campgroundReservationId: campReservations.value.camp_reservation_id
    }
    console.log("取消营地请求数据",requestData);
    const res = await campApi.campgroundCancelReservation(requestData);
    if(res.code === 200){
      ElMessage.success("取消营地成功");
      await getCampReservations();
    }else if(res.code === 428){
      ElMessage.warning("距离开始时间还有一天，不可取消");
    }else{
      errorHandler.showError("取消营地失败",res);
    }
  } catch (error) {
    errorHandler.showError("取消营地失败",error);
  }
}

// 退款
const handleRefund = async () => {
  try {
    const requestData = {
      reservationId: campReservations.value.camp_reservation_id,
      transactionType: 1 //0车辆，1营地
    }
    const res = await payApi.refund(requestData);
    if(res.code === 200){
      ElMessage.success("退款成功");
      await getCampReservations();
    }else if(res.code === 426){
      ElMessage.warning("超出退款时间");
    }else{
      errorHandler.showError("退款失败",res);
    }
  } catch (error) {
    errorHandler.showError("退款失败",error);
  }
}

// 租赁弹窗
const dialogVisible = ref(false);

// 根据时间戳转换为日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
}

onMounted(() => {
  getCampReservations();
})
</script>

<style scoped>
.camp-reservations {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.reservation-content {
  min-height: 300px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.reservation-form {
  max-width: 800px;
  margin: 0 auto;
}

.location-info,
.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.rental-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.contract-content {
  .contract-title {
    text-align: center;
    margin-bottom: 20px;
    color: #303133;
  }

  .contract-text {
    color: #606266;
    line-height: 1.8;
    white-space: pre-wrap;
    padding: 0 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

:deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-tag) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
}

:deep(.el-descriptions__cell) {
  padding: 16px 24px;
}
</style> 