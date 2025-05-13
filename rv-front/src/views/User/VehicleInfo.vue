<template>
  <div class="vehicle-info">
    <div class="page-header">
      <div class="header-left">
        <el-icon><Van /></el-icon>
        <h2>车辆信息</h2>
      </div>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        刷新数据
      </el-button>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <!-- 表格 -->
      <el-card shadow="hover" class="table-card">
        <el-table 
          :data="vehicleCurrentPageData" 
          style="width: 100%" 
          border
          class="vehicle-table"
        >
          <el-table-column label="车辆类型" min-width="120">
            <template #default="{ row }">
              <el-tag :type="row.vehicleType === VEHICLE_CONSTANT_DATA.TYPE_A ? 'success' : 'warning'" size="small">
                <el-icon>
                  <component :is="row.vehicleType === VEHICLE_CONSTANT_DATA.TYPE_A ? 'Van' : 'TakeawayBox'" />
                </el-icon>
                {{ row.vehicleType === VEHICLE_CONSTANT_DATA.TYPE_A ? "自行式" : "拖挂式" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="车辆图片" min-width="150">
            <template #default="{ row }">
              <el-carousel 
                v-if="getImages(row.vehiclePicture).length"
                height="120px"
                indicator-position="none"
                trigger="click"
                class="image-carousel"
              >
                <el-carousel-item v-for="image in getImages(row.vehiclePicture)" :key="image">
                  <el-image 
                    :src="getVehicleImageUrl(image)" 
                    fit="cover"
                    class="vehicle-image"
                    :preview-src-list="getImages(row.vehiclePicture).map(img => getVehicleImageUrl(img))"
                  />
                </el-carousel-item>
              </el-carousel>
            </template>
          </el-table-column>

          <el-table-column label="车辆价格" min-width="120">
            <template #default="{ row }">
              <span class="price">¥ {{ row.vehiclePrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="车辆地址" min-width="180">
            <template #default="{ row }">
              <div class="location-info">
                <el-icon><Location /></el-icon>
                {{ row.vehicleLocation }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="车辆描述" min-width="200">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.vehicleDescription" 
                placement="top" 
                :hide-after="0"
              >
                <div class="description-text">
                  {{ row.vehicleDescription }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column label="车辆状态" min-width="120">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.vehicleStatus)"
                effect="light"
              >
                {{ formatVehicleStatus(row.vehicleStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="330" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleUpdateClick(row.vehicleId)">
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
                <el-button 
                  v-if="row.vehicleStatus !== 2" 
                  type="warning" 
                  size="small" 
                  @click="handleMaintainClick(row.vehicleId)"
                >
                  <el-icon><Tools /></el-icon>
                  维护
                </el-button>
                <el-button 
                  v-if="row.vehicleStatus === 2" 
                  type="success" 
                  size="small" 
                  @click="handleCompleteMaintainClick(row.vehicleId)"
                >
                  <el-icon><Select /></el-icon>
                  完成维护
                </el-button>
                <el-button 
                  v-if="row.vehicleStatus === 2" 
                  type="info" 
                  size="small" 
                  @click="handleCancelMaintainClick(row.vehicleId)"
                >
                  <el-icon><Close /></el-icon>
                  取消维护
                </el-button>
                <el-popconfirm
                  title="确定要删除该车辆吗？"
                  @confirm="handleDeleteClick(row.vehicleId)"
                >
                  <template #reference>
                    <el-button type="danger" size="small">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="确认归还" min-width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="success" 
                size="small" 
                @click="handleReturnClick(row.vehicleId)"
              >
                <el-icon><Check /></el-icon>
                确认归还
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <SmartPagination
            v-model:current-page="vehiclePagination.currentPage"
            :server-page-size="vehiclePagination.serverPageSize"
            :display-page-size="vehiclePagination.displayPageSize"
            :total="vehiclePagination.totalItems"
            @load-data="handleVehicleLoadData" 
          />
        </div>
      </el-card>

      <!-- 修改和维护对话框部分保持不变，只添加样式类 -->
      <el-dialog 
        v-model="vehicleUpdateDialogVisible" 
        title="修改车辆信息" 
        width="50%" 
        @close="closeVehicleUpdateDialog"
        class="update-dialog"
      >
        <el-form :model="vehicleForm" label-width="100px">
          <el-form-item label="车辆类型" prop="type">
            <el-select v-model="vehicleForm.type" placeholder="请选择类型" clearable>
                <el-option label="自行式" :value="VEHICLE_CONSTANT_DATA.TYPE_A" />
                <el-option label="拖挂式" :value="VEHICLE_CONSTANT_DATA.TYPE_B" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="车辆位置" prop="location">
            <el-input v-model="vehicleForm.location" placeholder="请输入车辆位置"></el-input>
          </el-form-item>
          
          <el-form-item label="车辆价格" prop="price">
            <el-input-number v-model="vehicleForm.price" :min="0" :precision="2" :step="10" placeholder="车辆价格"></el-input-number>
          </el-form-item>
          
          <el-form-item label="车辆描述" prop="description">
            <el-input type="textarea" v-model="vehicleForm.description" placeholder="请输入车辆描述"></el-input>
          </el-form-item>
          
          <el-form-item label="车辆图片" prop="pictures">
            <el-upload
              ref="vehicleFormRef"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleVehiclePictureChange"
              :on-remove="handleVehiclePictureRemove"
              multiple
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="updateVehicle">修改</el-button>
            <el-button @click="closeVehicleUpdateDialog">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog 
        v-model="vehicleMaintainDialogVisible" 
        title="维护车辆信息" 
        width="50%" 
        @close="closeVehicleMaintainDialog"
        class="maintain-dialog"
      >
        <el-form :model="vehicleForm" label-width="100px">
          <el-form-item label="维护信息" prop="maintenanceDetails">
            <el-input 
              type="textarea" 
              v-model="vehicleForm.maintenanceDetails" 
              placeholder="请输入维护信息"
              :autosize="{ minRows: 4, maxRows: 6 }"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="maintainVehicle">维护</el-button>
            <el-button @click="closeVehicleMaintainDialog">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import { vehicleApi } from '../../api/business/vehicle.js';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';
import { VEHICLE_CONSTANT_DATA } from '../../constant/VehicleConstantData'

//===============================数据========================================
// 车辆表单相关
const vehicleForm = reactive({
  id: null,
  type: null,
  location: null,
  price: null,
  description: null,
  pictures: [],
  maintenanceDetails: null
})
const vehicleFormRef = ref(null)

//===============================功能========================================
// 查看车辆信息
const handleSearch = async () => {
  try {
    clearVehicleCache();
    const res = await vehicleApi.checkVehicleList();
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

// 修改车辆信息
const updateVehicle = async () => {
  try{
      const vehicle = {
          vehicleId: vehicleForm.id,
          vehicleType: vehicleForm.type,
          vehicleLocation: vehicleForm.location,
          vehiclePrice: vehicleForm.price,
          vehicleDescription: vehicleForm.description,
      }
      console.log("修改车辆信息", vehicle)
      // 创建一个 Blob，指定内容类型为 application/json
      const vehicleBlob = new Blob(
          [JSON.stringify(vehicle)], 
          { type: 'application/json' }
      )
      const vehiclePictures = vehicleForm.pictures.map(picture => picture.raw)
      const formData = new FormData()
      formData.append('vehicle', vehicleBlob)
      vehiclePictures.forEach(picture => formData.append('vehiclePictures', picture))
      const res = await vehicleApi.updateVehicle(formData)
      if(res.code === 200){
          ElMessage.success('车辆信息修改成功')
          closeVehicleUpdateDialog()
          console.log("车辆信息修改成功", res)
          handleSearch()
      }else if(res.code === 419){
        ElMessage.error('该车辆已被租赁')
      }else{
          errorHandler.showError('车辆信息修改失败', res)
      }
    }catch(error){
        errorHandler.showError('车辆信息修改失败', error)
    }
}
// 车辆图片处理
const handleVehiclePictureChange = (file) => {
  if (file.raw.type.indexOf('image/') !== 0) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  
  vehicleForm.pictures.push(file)
}
const handleVehiclePictureRemove = (file) => {
  const index = vehicleForm.pictures.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    vehicleForm.pictures.splice(index, 1)
  }
}
// 重置车辆表单
const resetVehicleForm = () => {
  vehicleFormRef.value.clearFiles()
  vehicleForm.pictures = []
  vehicleForm.id = null
  vehicleForm.type = null
  vehicleForm.location = null
  vehicleForm.price = null
  vehicleForm.description = null
  vehicleForm.maintenanceDetails = null
}

// 维护车辆信息
const maintainVehicle = async () => {
  try{
    if(!vehicleForm.maintenanceDetails){
      ElMessage.error('请输入维护信息')
      return
    }
    const requestData = {
      vehicleId: vehicleForm.id,  
      maintenanceDetails: vehicleForm.maintenanceDetails
    }
    const res = await vehicleApi.maintenanceVehicle(requestData)
    if(res.code === 200){
      ElMessage.success('车辆信息维护成功')
      closeVehicleMaintainDialog()
      console.log("车辆信息维护成功", res)
      handleSearch()
    }else if(res.code === 436){
      ElMessage.error('该车辆未处于可维护状态')
    }else{
      errorHandler.showError('车辆信息维护失败', res)
    }
  }catch(error){
    errorHandler.showError('车辆信息维护失败', error)
  }
}

// 完成维护车辆信息
const handleCompleteMaintainClick = async (vehicleId) => {
  try{
    const requestData = {
      vehicleId: vehicleId
    }
    const res = await vehicleApi.vehicleMaintenanceComplete(requestData)
    if(res.code === 200){
      ElMessage.success('车辆信息完成维护成功')
      handleSearch()
    }else{
      errorHandler.showError('车辆信息完成维护失败', res)
    }
  }catch(error){
    errorHandler.showError('车辆信息完成维护失败', error)
  }
}
// 取消维护车辆信息
const handleCancelMaintainClick = async (vehicleId) => {
  try{
    const requestData = {
      vehicleId: vehicleId
    }
    const res = await vehicleApi.vehicleMaintenanceCancel(requestData)
    if(res.code === 200){
      ElMessage.success('车辆信息取消维护成功')
      handleSearch()
    }else{
      errorHandler.showError('车辆信息取消维护失败', res)
    }
  }catch(error){
    errorHandler.showError('车辆信息取消维护失败', error)
  }
}

// 确认归还车辆信息
const handleReturnClick = async (vehicleId) => {
  try{
    const requestData = {
      vehicleId: vehicleId
    }
    const res = await vehicleApi.returnVehicle(requestData)
    if(res.code === 200){
      ElMessage.success('车辆信息确认归还成功')
      handleSearch()
    }else{
      errorHandler.showError('车辆信息确认归还失败', res)
    }
  }catch(error){
    errorHandler.showError('车辆信息确认归还失败', error)
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

//===============================对话框========================================
const vehicleUpdateDialogVisible = ref(false)
const vehicleMaintainDialogVisible = ref(false)

// 修改车辆信息
const handleUpdateClick = (vehicleId) => {
  vehicleForm.id = vehicleId
  vehicleUpdateDialogVisible.value = true
}

// 关闭修改车辆信息对话框
const closeVehicleUpdateDialog = () => {
  vehicleUpdateDialogVisible.value = false
  resetVehicleForm()
}

// 维护车辆信息
const handleMaintainClick = (vehicleId) => {
  vehicleForm.id = vehicleId
  vehicleMaintainDialogVisible.value = true
}

// 关闭维护车辆信息对话框
const closeVehicleMaintainDialog = () => {
  vehicleForm.maintenanceDetails = null
  vehicleForm.id = null
  vehicleMaintainDialogVisible.value = false
}

// 删除车辆信息
const handleDeleteClick = async (vehicleId) => {
  try{
    const requestData = {
      vehicleId: vehicleId
    }
    console.log("删除车辆信息", requestData)
    const res = await vehicleApi.deleteVehicle(requestData)
    if(res.code === 200){
      ElMessage.success('车辆信息删除成功')
      handleSearch()
    }else if(res.code === 419){
      ElMessage.error('该车辆已被租赁')
    }else{
      errorHandler.showError('车辆信息删除失败', res)
    }
  }catch(error){
    errorHandler.showError('车辆信息删除失败', error)
  }
}

// 获取图片
const getImages = (pictureStr) => {
  try {
    // 移除方括号并分割字符串
    return pictureStr
      .replace(/[\[\]]/g, '') // 移除方括号
      .split(',')             // 按逗号分割
      .map(img => img.trim()) // 移除每个项的空格
      .filter(img => img)     // 移除空字符串
  } catch {
    return []
  }
}
const getVehicleImageUrl = (filename) => {
  const url = import.meta.env.VITE_IMAGE_VEHICLE_BASE_URL
  return `${url}/${filename}`
}
// 根据订单状态转换为中文
const formatVehicleStatus = (status) => {
  if(status === 0){
    return '可预定'
  }else if(status === 1){
    return '租赁中'
  }else if(status === 2){
    return '维护中'
  }else if(status === 3){
    return '审核中'
  }else if(status === 4){
    return '审核失败'
  }else{
    return '已删除'
  }
}

// 添加状态类型映射函数
const getStatusType = (status) => {
  const statusMap = {
    0: 'success',   // 可预定
    1: 'warning',   // 租赁中
    2: 'info',      // 维护中
    3: 'primary',   // 审核中
    4: 'danger',    // 审核失败
    5: 'info'       // 已删除
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.vehicle-info {
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

.vehicle-table {
  margin-bottom: 20px;
}

.image-carousel {
  width: 120px;
  margin: 0 auto;
}

.vehicle-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  cursor: pointer;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 15px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #606266;
}

.action-buttons {
  display: flex;
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

.update-dialog,
.maintain-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}
</style> 