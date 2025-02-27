<template>
  <div class="vehicle-info">
    <h2>车辆管理</h2>
    <!-- 搜索 -->
    <div>
        <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item>
                <el-select style="width: 200px;" v-model="searchForm.status" placeholder="请选择状态" clearable>
                    <el-option label="可预定" :value="VEHICLE_CONSTANT_DATA.AVAILABLE" />
                    <el-option label="租赁中" :value="VEHICLE_CONSTANT_DATA.BOOKED" />
                    <el-option label="维护中" :value="VEHICLE_CONSTANT_DATA.MAINTENANCE" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select style="width: 200px;" v-model="searchForm.type" placeholder="请选择类型" clearable>
                    <el-option label="自行式" :value="VEHICLE_CONSTANT_DATA.TYPE_A" />
                    <el-option label="拖挂式" :value="VEHICLE_CONSTANT_DATA.TYPE_B" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-input-number 
                    style="width: 200px;"
                    v-model="searchForm.price" 
                    placeholder="请输入价格"
                    :min="0"
                    :max="100000000"
                    clearable
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSearchClick">搜索</el-button>
                <el-button @click="handleReset">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                </el-button>
            </el-form-item>
        </el-form>
    </div>
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
          <el-table-column label="车辆状态" min-width="120px">
              <template #default="{ row }">
                {{ formatVehicleStatus(row.vehicleStatus) }}
              </template>
          </el-table-column>
          <el-table-column label="操作" min-width="330px">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleUpdateClick(row.vehicleId)">修改</el-button>
                <el-button type="warning" v-if="row.vehicleStatus !== 2" size="small" @click="handleMaintainClick(row.vehicleId)">维护</el-button>
                <el-button type="warning" v-if="row.vehicleStatus === 2" size="small" @click="handleCancelMaintainClick(row.vehicleId)">取消维护</el-button>
                <el-button type="warning" v-if="row.vehicleStatus === 2" size="small" @click="handleCompleteMaintainClick(row.vehicleId)">完成维护</el-button>
                <el-button type="danger" size="small" @click="handleDeleteClick(row.vehicleId)">删除</el-button>
              </template>
          </el-table-column>
          <el-table-column label="确认归还" min-width="120px">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleReturnClick(row.vehicleId)">确认归还</el-button>
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

      <!-- 修改车辆信息 -->
      <div>
        <el-dialog title="修改车辆信息" v-model="vehicleUpdateDialogVisible" width="50%" @close="closeVehicleUpdateDialog">
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
      </div>

      <!-- 维护车辆信息 -->
      <div>
        <el-dialog title="维护车辆信息" v-model="vehicleMaintainDialogVisible" width="50%" @close="closeVehicleMaintainDialog">
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