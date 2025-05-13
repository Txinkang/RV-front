<template>
  <div class="camp-info">
    <div class="page-header">
      <h2>营地管理</h2>
    </div>

    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <el-select 
              v-model="searchForm.status" 
              placeholder="营地状态" 
              clearable
              class="search-input"
            >
              <el-option label="可预定" :value="CAMP_CONSTANT_DATA.AVAILABLE" />
              <el-option label="租赁中" :value="CAMP_CONSTANT_DATA.BOOKED" />
              <el-option label="维护中" :value="CAMP_CONSTANT_DATA.MAINTENANCE" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="searchForm.name" 
              placeholder="营地名称" 
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="searchForm.location" 
              placeholder="营地地址" 
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input-number 
              v-model="searchForm.price" 
              placeholder="营地价格"
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
          :data="campCurrentPageData" 
          style="width: 100%" 
          border
          stripe
          v-loading="loading"
        >
          <el-table-column label="营地名称" prop="campgroundName" min-width="120" />
          
          <el-table-column label="营地图片" min-width="120">
            <template #default="{ row }">
              <el-carousel 
                v-if="getImages(row.campgroundPicture).length"
                height="120px"
                indicator-position="none"
                class="image-carousel"
              >
                <el-carousel-item v-for="image in getImages(row.campgroundPicture)" :key="image">
                  <el-image 
                    :src="getCampImageUrl(image)" 
                    fit="cover"
                    class="camp-image"
                    :preview-src-list="[getCampImageUrl(image)]"
                  />
                </el-carousel-item>
              </el-carousel>
            </template>
          </el-table-column>

          <el-table-column label="营地价格" prop="campgroundPrice" min-width="100">
            <template #default="{ row }">
              <span class="price">¥{{ row.campgroundPrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="营地地址" prop="campgroundLocation" min-width="150" show-overflow-tooltip />
          
          <el-table-column label="营地描述" prop="campgroundFacilityDetails" min-width="200" show-overflow-tooltip />
          
          <el-table-column label="营地状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getCampStatusType(row.campgroundStatus)">
                {{ formatCampStatus(row.campgroundStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="330" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button type="primary" size="small" @click="handleUpdateClick(row.campgroundId)">
                  <el-icon><Edit /></el-icon>修改
                </el-button>
                <el-button 
                  v-if="row.campgroundStatus !== 2" 
                  type="warning" 
                  size="small" 
                  @click="handleMaintainClick(row.campgroundId)"
                >
                  <el-icon><Tools /></el-icon>维护
                </el-button>
                <el-button 
                  v-if="row.campgroundStatus === 2" 
                  type="warning" 
                  size="small" 
                  @click="handleCancelMaintainClick(row.campgroundId)"
                >
                  <el-icon><Close /></el-icon>取消维护
                </el-button>
                <el-button 
                  v-if="row.campgroundStatus === 2" 
                  type="success" 
                  size="small" 
                  @click="handleCompleteMaintainClick(row.campgroundId)"
                >
                  <el-icon><Check /></el-icon>完成维护
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteClick(row.campgroundId)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleReturnClick(row.campgroundId)"
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
          v-model:current-page="campPagination.currentPage"
          :server-page-size="campPagination.serverPageSize"
          :display-page-size="campPagination.displayPageSize"
          :total="campPagination.totalItems"
          @load-data="handleCampLoadData"
        />
      </div>

      <!-- 修改营地信息对话框 -->
      <el-dialog 
        title="修改营地信息" 
        v-model="campUpdateDialogVisible" 
        width="600px"
        destroy-on-close
        @close="closeCampUpdateDialog"
      >
        <el-form :model="campForm" label-width="100px" class="dialog-form">
          <el-form-item label="营地名称" prop="name">
            <el-input v-model="campForm.name" placeholder="请输入营地名称" />
          </el-form-item>
          
          <el-form-item label="营地位置" prop="location">
            <el-input v-model="campForm.location" placeholder="请输入营地位置" />
          </el-form-item>
          
          <el-form-item label="营地价格" prop="price">
            <el-input-number 
              v-model="campForm.price" 
              :min="0" 
              :precision="2" 
              :step="10" 
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="营地设备" prop="facilities">
            <el-input 
              type="textarea" 
              v-model="campForm.facilities" 
              :rows="4"
              placeholder="请输入营地设备信息"
            />
          </el-form-item>
          
          <el-form-item label="营地图片" prop="pictures">
            <el-upload
              ref="campFormRef"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleCampPictureChange"
              :on-remove="handleCampPictureRemove"
              multiple
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeCampUpdateDialog">取消</el-button>
          <el-button type="primary" @click="updateCamp">确认修改</el-button>
        </template>
      </el-dialog>

      <!-- 维护营地信息对话框 -->
      <el-dialog 
        title="维护营地信息" 
        v-model="campMaintainDialogVisible" 
        width="500px"
        destroy-on-close
        @close="closeCampMaintainDialog"
      >
        <el-form :model="campForm" label-width="100px" class="dialog-form">
          <el-form-item label="维护信息" prop="maintenanceDetails">
            <el-input 
              type="textarea" 
              v-model="campForm.maintenanceDetails" 
              :rows="4"
              placeholder="请输入维护信息"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeCampMaintainDialog">取消</el-button>
          <el-button type="primary" @click="maintainCamp">确认维护</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import {campApi} from '../../api/camp.js';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';
import { CAMP_CONSTANT_DATA } from '../../constant/CampConstantData'


//===============================数据========================================
const searchForm = ref({
  status: null,
  name: null,
  location: null,
  price: null
})
const campForm = reactive({
  id: null,
  name: null,
  location: null,
  price: null,
  facilities: null,
  pictures: [],
  maintenanceDetails: null
})
const campFormRef = ref(null)

//===============================功能========================================
// 搜索
const handleSearchClick = async  () => {
  clearCampCache()
  await handleSearch()
}
const handleSearch = async () => {
  loading.value = true
  try {
    const requestData = {
      campground: {
        campgroundStatus: searchForm.value.status ? searchForm.value.status : null,
        campgroundName: searchForm.value.name ? searchForm.value.name : null,
        campgroundLocation: searchForm.value.location ? searchForm.value.location : null,
        campgroundPrice: searchForm.value.price ? searchForm.value.price : null
      },
      pageNum: campPagination.value.serverPage,
      pageSize: campPagination.value.serverPageSize
    }
    console.log("搜索营地请求数据：",requestData)
    const res = await campApi.checkCampgroundList(requestData)
    if(res.code === 200){
      ElMessage.success("搜索营地成功")
      console.log("搜索营地响应数据：",res)
      campPagination.value.totalItems = res.data.total
      campPagination.value.cachedData.set(campPagination.value.serverPage, res.data.items)
    }else{
      errorHandler.showError("搜索营地失败",res)
    }
  } catch (error) {
    errorHandler.showError("搜索营地失败",error)
  } finally {
    loading.value = false
  }
}
const handleReset = () => {
  clearCampCache()
  searchForm.value = {
    status: null,
    name: null,
    location: null,
    price: null
  }
}

// 修改营地信息
const updateCamp = async () => {
  try{
      const campground = {
          campgroundId: campForm.id,
          campgroundName: campForm.name,
          campgroundLocation: campForm.location,
          campgroundPrice: campForm.price,
          campgroundFacilityDetails: campForm.facilities,
      }
      console.log("修改营地信息", campground)
      // 创建一个 Blob，指定内容类型为 application/json
      const campgroundBlob = new Blob(
          [JSON.stringify(campground)], 
          { type: 'application/json' }
      )
      const campgroundPictures = campForm.pictures.map(picture => picture.raw)
      const formData = new FormData()
      formData.append('campground', campgroundBlob)
      campgroundPictures.forEach(picture => formData.append('campgroundPictures', picture))
      const res = await campApi.updateCampground(formData)
      if(res.code === 200){
          ElMessage.success('营地信息修改成功')
          closeCampUpdateDialog()
          console.log("营地信息修改成功", res)
          handleSearch()
      }else if(res.code === 414){
        ElMessage.error('该营地已被预定')
      }else{
          errorHandler.showError('营地信息修改失败', res)
      }
    }catch(error){
        errorHandler.showError('营地信息修改失败', error)
    }
}
// 营地图片处理
const handleCampPictureChange = (file) => {
  if (file.raw.type.indexOf('image/') !== 0) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  
  campForm.pictures.push(file)
}
const handleCampPictureRemove = (file) => {
  const index = campForm.pictures.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    campForm.pictures.splice(index, 1)
  }
}
// 重置营地表单
const resetCampForm = () => {
  campFormRef.value.clearFiles()
  campForm.pictures = []
  campForm.id = null
  campForm.name = null
  campForm.location = null
  campForm.price = null
  campForm.facilities = null
  campForm.maintenanceDetails = null
}

// 维护营地信息
const maintainCamp = async () => {
  try{
    if(!campForm.maintenanceDetails){
      ElMessage.error('请输入维护信息')
      return
    }
    const requestData = {
      campgroundId: campForm.id,  
      maintenanceDetails: campForm.maintenanceDetails
    }
    const res = await campApi.maintenanceCampground(requestData)
    if(res.code === 200){
      ElMessage.success('营地信息维护成功')
      closeCampMaintainDialog()
      console.log("营地信息维护成功", res)
      handleSearch()
    }else if(res.code === 433){
      ElMessage.error('该营地未处于可维护状态')
    }else{
      errorHandler.showError('营地信息维护失败', res)
    }
  }catch(error){
    errorHandler.showError('营地信息维护失败', error)
  }
}

// 完成维护营地信息
const handleCompleteMaintainClick = async (campgroundId) => {
  try{
    const requestData = {
      campgroundId: campgroundId
    }
    const res = await campApi.campMaintenanceComplete(requestData)
    if(res.code === 200){
      ElMessage.success('营地信息完成维护成功')
      handleSearch()
    }else{
      errorHandler.showError('营地信息完成维护失败', res)
    }
  }catch(error){
    errorHandler.showError('营地信息完成维护失败', error)
  }
}
// 取消维护营地信息
const handleCancelMaintainClick = async (campgroundId) => {
  try{
    const requestData = {
      campgroundId: campgroundId
    }
    const res = await campApi.campMaintenanceCancel(requestData)
    if(res.code === 200){
      ElMessage.success('营地信息取消维护成功')
      handleSearch()
    }else{
      errorHandler.showError('营地信息取消维护失败', res)
    }
  }catch(error){
    errorHandler.showError('营地信息取消维护失败', error)
  }
}

// 确认归还营地信息
const handleReturnClick = async (campgroundId) => {
  try{
    const requestData = {
      campgroundId: campgroundId
    }
    const res = await campApi.returnCamp(requestData)
    if(res.code === 200){
      ElMessage.success('营地信息确认归还成功')
      handleSearch()
    }else{
      errorHandler.showError('营地信息确认归还失败', res)
    }
  }catch(error){
    errorHandler.showError('营地信息确认归还失败', error)
  }
}
//===============================分页========================================
const campPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 20, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const {
  currentPageData: campCurrentPageData,
  handleLoadData: handleCampLoadData,
  clearCache: clearCampCache
} = usePagination(handleSearch, campPagination)

//===============================对话框========================================
const campUpdateDialogVisible = ref(false)
const campMaintainDialogVisible = ref(false)

// 修改营地信息
const handleUpdateClick = (campgroundId) => {
  campForm.id = campgroundId
  campUpdateDialogVisible.value = true
}

// 关闭修改营地信息对话框
const closeCampUpdateDialog = () => {
  campUpdateDialogVisible.value = false
  resetCampForm()
}

// 维护营地信息
const handleMaintainClick = (campgroundId) => {
  campForm.id = campgroundId
  campMaintainDialogVisible.value = true
}

// 关闭维护营地信息对话框
const closeCampMaintainDialog = () => {
  campForm.maintenanceDetails = null
  campForm.id = null
  campMaintainDialogVisible.value = false
}

// 删除营地信息
const handleDeleteClick = async (campgroundId) => {
  try{
    const requestData = {
      campgroundId: campgroundId
    }
    const res = await campApi.deleteCampground(requestData)
    if(res.code === 200){
      ElMessage.success('营地信息删除成功')
      handleSearch()
    }else if(res.code === 414){
      ElMessage.error('该营地已被预定')
    }else{
      errorHandler.showError('营地信息删除失败', res)
    }
  }catch(error){
    errorHandler.showError('营地信息删除失败', error)
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
const getCampImageUrl = (filename) => {
  const url = import.meta.env.VITE_IMAGE_CAMP_BASE_URL
  return `${url}/${filename}`
}
// 根据订单状态转换为中文
const formatCampStatus = (status) => {
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
const getCampStatusType = (status) => {
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
.camp-info {
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

.camp-image {
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