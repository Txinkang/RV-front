<template>
  <div class="vehicle-info">
    <div class="page-header">
      <h2>车辆管理</h2>
    </div>

    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <el-select 
              v-model="searchForm.status" 
              placeholder="车辆状态" 
              clearable
              class="search-input"
            >
              <el-option label="可预定" :value="VEHICLE_CONSTANT_DATA.AVAILABLE" />
              <el-option label="租赁中" :value="VEHICLE_CONSTANT_DATA.BOOKED" />
              <el-option label="维护中" :value="VEHICLE_CONSTANT_DATA.MAINTENANCE" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select 
              v-model="searchForm.type" 
              placeholder="车辆类型" 
              clearable
              class="search-input"
            >
              <el-option label="自行式" :value="VEHICLE_CONSTANT_DATA.TYPE_A" />
              <el-option label="拖挂式" :value="VEHICLE_CONSTANT_DATA.TYPE_B" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input-number 
              v-model="searchForm.price" 
              placeholder="车辆价格"
              :min="0"
              :max="100000000"
              class="search-input"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearchClick">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="table-section">
        <el-table 
          :data="vehicleCurrentPageData" 
          style="width: 100%" 
          border
          stripe
          v-loading="loading"
        >
          <el-table-column label="车辆类型" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.vehicleType === VEHICLE_CONSTANT_DATA.TYPE_A ? 'success' : 'warning'">
                {{ row.vehicleType === VEHICLE_CONSTANT_DATA.TYPE_A ? "自行式" : "拖挂式" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="车辆图片" min-width="120">
            <template #default="{ row }">
              <el-carousel 
                v-if="getImages(row.vehiclePicture).length"
                height="120px"
                indicator-position="none"
                class="image-carousel"
              >
                <el-carousel-item v-for="image in getImages(row.vehiclePicture)" :key="image">
                  <el-image 
                    :src="getVehicleImageUrl(image)" 
                    fit="cover"
                    class="vehicle-image"
                    :preview-src-list="[getVehicleImageUrl(image)]"
                  />
                </el-carousel-item>
              </el-carousel>
            </template>
          </el-table-column>

          <el-table-column label="车辆价格" min-width="100">
            <template #default="{ row }">
              <span class="price">¥{{ row.vehiclePrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="车辆地址" prop="vehicleLocation" min-width="150" show-overflow-tooltip />
          
          <el-table-column label="车辆描述" prop="vehicleDescription" min-width="200" show-overflow-tooltip />
          
          <el-table-column label="车辆状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getVehicleStatusType(row.vehicleStatus)">
                {{ formatVehicleStatus(row.vehicleStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="330" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button type="primary" size="small" @click="handleUpdateClick(row.vehicleId)">
                  <el-icon><Edit /></el-icon>修改
                </el-button>
                <el-button 
                  v-if="row.vehicleStatus !== 2" 
                  type="warning" 
                  size="small" 
                  @click="handleMaintainClick(row.vehicleId)"
                >
                  <el-icon><Tools /></el-icon>维护
                </el-button>
                <el-button 
                  v-if="row.vehicleStatus === 2" 
                  type="warning" 
                  size="small" 
                  @click="handleCancelMaintainClick(row.vehicleId)"
                >
                  <el-icon><Close /></el-icon>取消维护
                </el-button>
                <el-button 
                  v-if="row.vehicleStatus === 2" 
                  type="success" 
                  size="small" 
                  @click="handleCompleteMaintainClick(row.vehicleId)"
                >
                  <el-icon><Check /></el-icon>完成维护
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteClick(row.vehicleId)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleReturnClick(row.vehicleId)"
                >
                  <el-icon><Check /></el-icon>确认归还
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <SmartPagination
          v-model:current-page="vehiclePagination.currentPage"
          :server-page-size="vehiclePagination.serverPageSize"
          :display-page-size="vehiclePagination.displayPageSize"
          :total="vehiclePagination.totalItems"
          @load-data="handleVehicleLoadData"
        />
      </div>

      <!-- 修改车辆信息对话框 -->
      <el-dialog 
        title="修改车辆信息" 
        v-model="vehicleUpdateDialogVisible" 
        width="600px"
        destroy-on-close
        @close="closeVehicleUpdateDialog"
      >
        <el-form :model="vehicleForm" label-width="100px" class="dialog-form">
          <el-form-item label="车辆类型" prop="type">
            <el-select v-model="vehicleForm.type" placeholder="请选择类型" style="width: 100%">
              <el-option label="自行式" :value="VEHICLE_CONSTANT_DATA.TYPE_A" />
              <el-option label="拖挂式" :value="VEHICLE_CONSTANT_DATA.TYPE_B" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="车辆位置" prop="location">
            <el-input v-model="vehicleForm.location" placeholder="请输入车辆位置" />
          </el-form-item>
          
          <el-form-item label="车辆价格" prop="price">
            <el-input-number 
              v-model="vehicleForm.price" 
              :min="0" 
              :precision="2" 
              :step="10" 
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="车辆描述" prop="description">
            <el-input 
              type="textarea" 
              v-model="vehicleForm.description" 
              :rows="4"
              placeholder="请输入车辆描述"
            />
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
        </el-form>
        <template #footer>
          <el-button @click="closeVehicleUpdateDialog">取消</el-button>
          <el-button type="primary" @click="updateVehicle">确认修改</el-button>
        </template>
      </el-dialog>

      <!-- 维护车辆信息对话框 -->
      <el-dialog 
        title="维护车辆信息" 
        v-model="vehicleMaintainDialogVisible" 
        width="500px"
        destroy-on-close
        @close="closeVehicleMaintainDialog"
      >
        <el-form :model="vehicleForm" label-width="100px" class="dialog-form">
          <el-form-item label="维护信息" prop="maintenanceDetails">
            <el-input 
              type="textarea" 
              v-model="vehicleForm.maintenanceDetails" 
              :rows="4"
              placeholder="请输入维护信息"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeVehicleMaintainDialog">取消</el-button>
          <el-button type="primary" @click="maintainVehicle">确认维护</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import { vehicleApi } from '../../api/vehicle.js';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';
import { VEHICLE_CONSTANT_DATA } from '../../constant/VehicleConstantData'
import { Search, Refresh, Edit, Tools, Close, Check, Delete, Plus } from '@element-plus/icons-vue'

//===============================数据========================================
const searchForm = ref({
  status: null,
  type: null,
  price: null
})
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
// 搜索
const handleSearchClick = async  () => {
  clearVehicleCache()
  await handleSearch()
}
const handleSearch = async () => {
  loading.value = true
  try {
    const requestData = {
      vehicle: {
        vehicleStatus: searchForm.value.status ? searchForm.value.status : null,
        vehicleType: searchForm.value.type ? searchForm.value.type : null,
        vehiclePrice: searchForm.value.price ? searchForm.value.price : null
      },
      pageNum: vehiclePagination.value.serverPage,
      pageSize: vehiclePagination.value.serverPageSize
    }
    console.log("搜索车辆请求数据：",requestData)
    const res = await vehicleApi.checkVehicleList(requestData)
    if(res.code === 200){
      ElMessage.success("搜索车辆成功")
      console.log("搜索车辆响应数据：",res)
      vehiclePagination.value.totalItems = res.data.total
      vehiclePagination.value.cachedData.set(vehiclePagination.value.serverPage, res.data.items)
    }else{
      errorHandler.showError("搜索车辆失败",res)
    }
  } catch (error) {
    errorHandler.showError("搜索车辆失败",error)
  } finally {
    loading.value = false
  }
}
const handleReset = () => {
  clearVehicleCache()
  searchForm.value = {
    status: null,
    type: null,
    price: null
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
    return JSON.parse(pictureStr) || []
  } catch {
    return []
  }
}
const getVehicleImageUrl = (filename) => {
  return `http://localhost:8080/images/vehiclePictures/${filename}`
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

// 添加新的工具函数
const getVehicleStatusType = (status) => {
  const statusMap = {
    0: 'success',   // 可预定
    1: 'warning',   // 租赁中
    2: 'info',      // 维护中
    3: 'primary',   // 审核中
    4: 'danger',    // 审核失败
    5: 'danger'     // 已删除
  }
  return statusMap[status] || ''
}

// 添加 loading 状态
const loading = ref(false)
</script>

<style scoped>
.vehicle-info {
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-section {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 200px;
}

.table-section {
  padding: 0 24px;
}

.pagination-section {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
}

.vehicle-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.image-carousel {
  border-radius: 4px;
  overflow: hidden;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}

.dialog-form {
  padding: 20px 0;
}

:deep(.el-form-item__content) {
  flex-wrap: nowrap;
}

:deep(.el-button--small) {
  padding: 8px 16px;
}

:deep(.el-button--small .el-icon) {
  margin-right: 4px;
}

:deep(.el-tag) {
  text-align: center;
  min-width: 80px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .search-section {
    padding: 16px;
  }

  .search-input {
    width: 100%;
  }

  .table-section {
    padding: 0 16px;
    overflow-x: auto;
  }

  .pagination-section {
    padding: 16px;
  }
}
</style> 