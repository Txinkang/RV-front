<template>
  <div class="vehicle-reservations">
    <div class="page-header">
      <el-icon><Van /></el-icon>
      <h2>已预定车辆</h2>
    </div>

    <div class="reservation-content" v-loading="loading">
      <el-empty v-if="!hasReservation" description="暂无预订信息" />
      
      <el-form 
        v-else
        :model="vehicleReservations" 
        label-width="100px" 
        class="reservation-form"
      >
        <el-descriptions :column="1" border>
          <el-descriptions-item label="车辆类型">
            <el-tag :type="vehicleReservations.vehicle_type === '自行式' ? 'success' : 'warning'" size="large">
              <el-icon>
                <component :is="vehicleReservations.vehicle_type === '自行式' ? 'Van' : 'TakeawayBox'" />
              </el-icon>
              {{ vehicleReservations.vehicle_type }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="车辆位置">
            <div class="location-info">
              <el-icon><Location /></el-icon>
              {{ vehicleReservations.vehicle_location }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="开始时间">
            <div class="time-info">
              <el-icon><Timer /></el-icon>
              {{ vehicleReservations.vehicle_start_date }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="结束时间">
            <div class="time-info">
              <el-icon><Timer /></el-icon>
              {{ vehicleReservations.vehicle_end_date }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="总价">
            <span class="price">¥ {{ vehicleReservations.vehicle_total_price }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons">
          <template v-if="vehicleReservations.vehicle_status === 0">
            <el-button type="primary" @click="dialogVisible = true">
              <el-icon><Wallet /></el-icon>
              付款
            </el-button>
            <el-button type="danger" @click="handleCancel">
              <el-icon><Close /></el-icon>
              取消预订
            </el-button>
          </template>
          
          <template v-if="vehicleReservations.vehicle_status === 2">
            <el-button type="primary" @click="handleUpdateLocation">
              <el-icon><MapLocation /></el-icon>
              更新位置
            </el-button>
            <el-button type="warning" @click="handleRefund">
              <el-icon><RefreshLeft /></el-icon>
              申请退款
            </el-button>
          </template>
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
        <h3 class="contract-title">车辆租赁合同</h3>
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
import { vehicleApi } from '../../api/user/vehicle.js'
import { ElMessage } from 'element-plus'
import { errorHandler } from '../../utils/errorHandler.js'
import { payApi } from '../../api/user/pay.js'
import { 
  Van, TakeawayBox, Location, Timer, Wallet, 
  Close, RefreshLeft, Check, MapLocation 
} from '@element-plus/icons-vue'

const vehicleReservations = ref({
  vehicle_end_date: null,
  vehicle_start_date: null,
  vehicle_reservation_id: null,
  vehicle_type: null,
  vehicle_location: null,
  vehicle_status: null,
  vehicle_total_price: null,
  vehicle_id: null
});
const geolocation = ref(null);

const loading = ref(false);
const hasReservation = computed(() => {
  return Object.keys(vehicleReservations.value).length > 0;
});

// 合同文本
const contractText = `第一条 租赁内容

甲方同意将其拥有的车辆（以下简称"车辆"）租赁给乙方使用，乙方同意按照合同约定的条件租赁该车辆。

第四条 设施及使用
	1.	甲方提供以下设施：
	•	电力、供水、供暖等基本设施；
	•	垃圾处理和清洁服务；
	•	其他 [具体设施或服务]。
	2.	乙方应合理使用车辆及其设施，保持车辆环境的清洁和卫生，禁止擅自改变车辆的结构、设施或用作非预定用途。

第五条 甲方的权利与义务
	1.	甲方应确保车辆在租赁期间安全、卫生，符合有关安全标准；
	2.	甲方有权在车辆发生不可抗力或其他特殊情况时提前解除合同，并退还乙方未使用部分的租金。

第六条 乙方的权利与义务
	1.	乙方应按照合同约定支付租金；
	2.	乙方不得擅自转租、转借或转让车辆给第三方；
	3.	乙方不得在车辆内从事非法活动，并应遵守相关法律法规；
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
const getVehicleReservations = async () => {
  loading.value = true;
  try {
    const res = await vehicleApi.checkBookedVehicle();
    if(res.code === 200){
      ElMessage.success("查看车辆成功");
      vehicleReservations.value = res.data;
      vehicleReservations.value.vehicle_type = vehicleReservations.value.vehicle_type === 'A' ? "自行式" : "拖挂式";
      vehicleReservations.value.vehicle_start_date = formatDate(vehicleReservations.value.vehicle_start_date);
      vehicleReservations.value.vehicle_end_date = formatDate(vehicleReservations.value.vehicle_end_date);
      console.log("查看车辆成功",vehicleReservations.value);
    }else if(res.code === 417){
      ElMessage.warning("用户暂无预订");
      vehicleReservations.value = {};
    }else{
      errorHandler.showError("查看车辆失败",res);
    }
  } catch (error) {
    errorHandler.showError("查看车辆失败",error);
  } finally {
    loading.value = false;
  }
}

// 租赁
const handleRent = async () => {
  try {
    const requestData = {
      paymentVehicleReservationId:vehicleReservations.value.vehicle_reservation_id,
      paymentCampgroundReservationId:null,
      paymentTransactionType:0 //0车辆、1营地
    }
    const res = await payApi.payment(requestData);
    if(res.code === 200){
      ElMessage.success("租赁车辆成功");
      dialogVisible.value = false;
      await getVehicleReservations();
    }else if(res.code === 421){
      ElMessage.warning("用户余额不足");
    }else{
      errorHandler.showError("租赁车辆失败",res);
    }
  } catch (error) {
    errorHandler.showError("租赁车辆失败",error);
  }
}

// 取消
const handleCancel = async () => {
  try {
    const requestData = {
      vehicleReservationId: vehicleReservations.value.vehicle_reservation_id
    }
    console.log("取消车辆请求数据",requestData);
    const res = await vehicleApi.vehicleCancelReservation(requestData);
    if(res.code === 200){
      ElMessage.success("取消车辆成功");
      await getVehicleReservations();
    }else if(res.code === 428){
      ElMessage.warning("距离开始时间还有一天，不可取消");
    }else{
      errorHandler.showError("取消车辆失败",res);
    }
  } catch (error) {
    errorHandler.showError("取消车辆失败",error);
  }
}

// 退款
const handleRefund = async () => {
  try {
    const requestData = {
      reservationId: vehicleReservations.value.vehicle_reservation_id,
      transactionType: 0 //0车辆，1营地
    }
    const res = await payApi.refund(requestData);
    if(res.code === 200){
      ElMessage.success("退款成功");
      await getVehicleReservations();
    }else if(res.code === 426){
      ElMessage.warning("超出退款时间");
    }else{
      errorHandler.showError("退款失败",res);
    }
  } catch (error) {
    errorHandler.showError("退款失败",error);
  }
}

// 更新位置
const handleUpdateLocation = async () => {
  try {
    if(vehicleReservations.value.vehicle_start_date > formatDate(new Date())){
      ElMessage.warning("未到开始时间");
      return;
    } 
    await getLocation();
    console.log("更新位置",vehicleReservations.value.vehicle_location);
    const requestData = {
      vehicle_reservation_id: vehicleReservations.value.vehicle_reservation_id,
      location: vehicleReservations.value.vehicle_location
    }
    const res = await vehicleApi.uploadVehicleLocation(requestData);
    if(res.code === 200){
      ElMessage.success("更新位置成功");
      await getVehicleReservations();
    }else{
      errorHandler.showError("更新位置失败",res);
    }
  } catch (error) {
    errorHandler.showError("更新位置失败",error);
  }
}

// 租赁弹窗
const dialogVisible = ref(false);


// 根据时间戳转换为日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
}

// 确保在初始化时加载逆地理编码插件
onMounted(() => {
  getVehicleReservations();
  
  // 确保高德地图 SDK 已加载
  if (window.AMap) {
    // 加载插件
    window.AMap.plugin(['AMap.Geolocation', 'AMap.Geocoder'], function() {
      initGeolocation();
    });
  }
});
const initGeolocation = () => {
  // 创建定位对象
  geolocation.value = new window.AMap.Geolocation({
    enableHighAccuracy: true, // 是否使用高精度定位
    timeout: 10000,           // 超时时间
    needAddress: true,        // 是否需要详细地址信息
    extensions: 'all'         // 返回基本+扩展信息
  });
};

const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      ElMessage.error('高德地图 SDK 未加载，请刷新页面重试');
      reject('高德地图 SDK 未加载，请刷新页面重试');
      return;
    }
    
    // 获取当前位置
    geolocation.value.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        // 如果有位置坐标但没有地址信息，手动进行逆地理编码
        if (result.position && (!result.formattedAddress || !result.addressComponent)) {
          // 创建逆地理编码实例
          const geocoder = new window.AMap.Geocoder();
          
          // 逆地理编码
          geocoder.getAddress(result.position, (status, geocodeResult) => {
            
            if (status === 'complete' && geocodeResult.regeocode) {
              // 保存详细位置信息
              vehicleReservations.value.vehicle_location = result.formattedAddress;
              ElMessage.success('定位成功');
            } else {
              // 逆地理编码失败
              vehicleReservations.value.vehicle_location = result.formattedAddress;
              ElMessage.warning('获取到位置坐标，但无法解析为具体地址');
            }
          });
        } else {
          // 已有完整地址信息
          vehicleReservations.value.vehicle_location = result.formattedAddress;
          ElMessage.success('定位成功');
        }
        resolve();
      } else {
        // 定位失败
        vehicleReservations.value.vehicle_location = '';
        ElMessage.error('定位失败: ' + result.message);
        reject('定位失败: ' + result.message);
      }
    });
  });
};
</script>

<style scoped>
.vehicle-reservations {
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