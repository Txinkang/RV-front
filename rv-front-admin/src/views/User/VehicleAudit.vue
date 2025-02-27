<template>
    <div class="vehicle-info">
      <h2>车辆信息</h2>
      <el-button type="primary" @click="handleSearch">查看</el-button>
      <div class="content-placeholder">
        <!-- 表格 -->
        <div style="overflow-x: auto;">
          <el-table 
          :data="vehicleCurrentPageData" 
          style="width: 1000px" 
          border>
            <el-table-column label="车辆类型" min-width="120px">
                <template #default="{ row }">
                  {{ row.vehicleType === VEHICLE_CONSTANT_DATA.TYPE_A ? "自行式" : "拖挂式" }}
                </template>
            </el-table-column>
            <el-table-column label="车辆图片" min-width="120px">
              <template #default="{ row }">
                <el-carousel 
                  v-if="getImages(row.vehiclePicture).length"
                  height="100px"
                  indicator-position="none"
                >
                  <el-carousel-item v-for="image in getImages(row.vehiclePicture)" :key="image">
                    <el-image 
                      :src="getVehicleImageUrl(image)" 
                      style="width: 100px; height: 100px;" 
                      fit="cover"
                    />
                  </el-carousel-item>
                </el-carousel>
              </template>
            </el-table-column>
            <el-table-column label="车辆价格" min-width="120px">
                <template #default="{ row }">
                  {{ row.vehiclePrice }}
                </template>
            </el-table-column>  
            <el-table-column label="车辆地址" min-width="120px">
                <template #default="{ row }">
                  {{ row.vehicleLocation }}
                </template>
            </el-table-column>
            <el-table-column label="车辆描述" min-width="120px">
                <template #default="{ row }">
                  {{ row.vehicleDescription }}
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150px">
              <template #default="{ row }">
                <el-button type="primary" @click="handleAuditSuccess(row.vehicleId)">通过</el-button>
                <el-button type="primary" @click="handleAuditFail(row.vehicleId)">不通过</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>  
        
        <!-- 分页 -->
        <div>
          <SmartPagination
            v-model:current-page="vehiclePagination.currentPage"
            :server-page-size="vehiclePagination.serverPageSize"
            :display-page-size="vehiclePagination.displayPageSize"
            :total="vehiclePagination.totalItems"
            @load-data="handleVehicleLoadData" />
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import { auditApi } from '../../api/audit.js';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';
import { VEHICLE_CONSTANT_DATA } from '../../constant/VehicleConstantData'


// 查看车辆信息
const handleSearch = async () => {
  try {
    clearVehicleCache();
    const res = await auditApi.getAuditVehicleList();
    if (res.code === 200) {
      ElMessage.success('搜索成功');
      vehiclePagination.value.totalItems = res.data.length;
      res.data = res.data.filter(item => item.vehicleStatus !== 99);
      vehiclePagination.value.cachedData.set(vehiclePagination.value.serverPage, res.data);
      console.log('搜索成功',res);
    } else {
      errorHandler.showError("搜索失败", res);
    }
  } catch (error) {
    errorHandler.showError("搜索失败", error);
  }
}
// 通过
const handleAuditSuccess = async (vehicleId) => {
    try {
        const requestData = {
            vehicleId: vehicleId,
            status: 2,  //1失败、2通过
            auditFailedMsg:""
        }
        const res = await auditApi.auditVehicle(requestData)
        if(res.code === 200){
            ElMessage.success("审核车辆成功")
            handleSearch()
        }else{
            errorHandler.showError("审核车辆失败",res)
        }
    } catch (error) {
        errorHandler.showError("审核车辆失败",error)
    }
}
// 不通过
const handleAuditFail = async (vehicleId) => {
    try {
        const requestData = {
            vehicleId: vehicleId,
            status: 1,  //1失败、2通过
            auditFailedMsg:""
        }
        const res = await auditApi.auditVehicle(requestData)
        if(res.code === 200){
            ElMessage.success("审核车辆成功")
            handleSearch()
        }else{
            errorHandler.showError("审核车辆失败",res)
        }
    } catch (error) {
        errorHandler.showError("审核车辆失败",error)
    }
}
//===============================分页========================================
const vehiclePagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 20, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const {
  currentPageData: vehicleCurrentPageData,
  handleLoadData: handleVehicleLoadData,
  clearCache: clearVehicleCache
} = usePagination(handleSearch, vehiclePagination)

// 获取图片
const getImages = (pictureStr) => {
  try {
    return JSON.parse(pictureStr) || []
  } catch {
    return []
  }
}
const getVehicleImageUrl = (filename) => {
  return `http://localhost:8080/images/vehiclePictures/${filename}`
}
</script>

<style scoped>
.vehicle-info {
  padding: 20px;
}

.content-placeholder {
  margin-top: 20px;
  min-height: 300px;
}
</style>