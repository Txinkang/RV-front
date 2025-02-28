<template>
  <div class="camp-info">
    <div class="page-header">
      <div class="header-left">
        <el-icon><Location /></el-icon>
        <h2>营地信息</h2>
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
          :data="campCurrentPageData" 
          style="width: 100%" 
          border
          class="camp-table"
        >
          <el-table-column label="营地名称" min-width="120">
            <template #default="{ row }">
              <span class="camp-name">{{ row.campgroundName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="营地图片" min-width="150">
            <template #default="{ row }">
              <el-carousel 
                v-if="getImages(row.campgroundPicture).length"
                height="120px"
                indicator-position="none"
                trigger="click"
                class="image-carousel"
              >
                <el-carousel-item v-for="image in getImages(row.campgroundPicture)" :key="image">
                  <el-image 
                    :src="getCampImageUrl(image)" 
                    fit="cover"
                    class="camp-image"
                    :preview-src-list="getImages(row.campgroundPicture).map(img => getCampImageUrl(img))"
                  />
                </el-carousel-item>
              </el-carousel>
            </template>
          </el-table-column>

          <el-table-column label="营地价格" min-width="120">
            <template #default="{ row }">
              <span class="price">¥ {{ row.campgroundPrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="营地地址" min-width="180">
            <template #default="{ row }">
              <div class="location-info">
                <el-icon><MapLocation /></el-icon>
                {{ row.campgroundLocation }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="营地描述" min-width="200">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.campgroundFacilityDetails" 
                placement="top" 
                :hide-after="0"
              >
                <div class="description-text">
                  {{ row.campgroundFacilityDetails }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column label="营地状态" min-width="120">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.campgroundStatus)"
                effect="light"
              >
                {{ formatCampStatus(row.campgroundStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="330" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleUpdateClick(row.campgroundId)">
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
                <el-button 
                  v-if="row.campgroundStatus !== 2" 
                  type="warning" 
                  size="small" 
                  @click="handleMaintainClick(row.campgroundId)"
                >
                  <el-icon><Tools /></el-icon>
                  维护
                </el-button>
                <el-button 
                  v-if="row.campgroundStatus === 2" 
                  type="success" 
                  size="small" 
                  @click="handleCompleteMaintainClick(row.campgroundId)"
                >
                  <el-icon><Select /></el-icon>
                  完成维护
                </el-button>
                <el-button 
                  v-if="row.campgroundStatus === 2" 
                  type="info" 
                  size="small" 
                  @click="handleCancelMaintainClick(row.campgroundId)"
                >
                  <el-icon><Close /></el-icon>
                  取消维护
                </el-button>
                <el-popconfirm
                  title="确定要删除该营地吗？"
                  @confirm="handleDeleteClick(row.campgroundId)"
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
                @click="handleReturnClick(row.campgroundId)"
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
            v-model:current-page="campPagination.currentPage"
            :server-page-size="campPagination.serverPageSize"
            :display-page-size="campPagination.displayPageSize"
            :total="campPagination.totalItems"
            @load-data="handleCampLoadData" 
          />
        </div>
      </el-card>

      <!-- 修改营地信息对话框 -->
      <el-dialog 
        v-model="campUpdateDialogVisible" 
        title="修改营地信息" 
        width="50%" 
        @close="closeCampUpdateDialog"
        class="update-dialog"
      >
        <el-form :model="campForm" label-width="100px" class="update-form">
          <el-form-item label="营地名称" prop="name">
            <el-input v-model="campForm.name" placeholder="请输入营地名称"></el-input>
          </el-form-item>
          
          <el-form-item label="营地位置" prop="location">
            <el-input v-model="campForm.location" placeholder="请输入营地位置"></el-input>
          </el-form-item>
          
          <el-form-item label="营地价格" prop="price">
            <el-input-number v-model="campForm.price" :min="0" :precision="2" :step="10" placeholder="营地价格"></el-input-number>
          </el-form-item>
          
          <el-form-item label="营地设备" prop="facilities">
            <el-input type="textarea" v-model="campForm.facilities" placeholder="请输入营地设备信息"></el-input>
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
          
          <el-form-item>
            <el-button type="primary" @click="updateCamp">修改</el-button>
            <el-button @click="closeCampUpdateDialog">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 维护营地信息对话框 -->
      <el-dialog 
        v-model="campMaintainDialogVisible" 
        title="维护营地信息" 
        width="50%" 
        @close="closeCampMaintainDialog"
        class="maintain-dialog"
      >
        <el-form :model="campForm" label-width="100px" class="maintain-form">
          <el-form-item label="维护信息" prop="maintenanceDetails">
            <el-input 
              type="textarea" 
              v-model="campForm.maintenanceDetails" 
              placeholder="请输入维护信息"
              :autosize="{ minRows: 4, maxRows: 6 }"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="maintainCamp">维护</el-button>
            <el-button @click="closeCampMaintainDialog">取消</el-button>
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
import {campApi} from '../../api/business/camp.js';
import { errorHandler } from '../../utils/errorHandler';
import { ElMessage } from 'element-plus';


//===============================数据========================================
// 营地表单相关
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
// 查看营地信息
const handleSearch = async () => {
  try {
    clearCampCache();
    const res = await campApi.checkCampgroundList();
    if (res.code === 200) {
      ElMessage.success('搜索成功');
      campPagination.value.totalItems = res.data.length;
      res.data = res.data.filter(item => item.campgroundStatus !== 99);
      campPagination.value.cachedData.set(campPagination.value.serverPage, res.data);
      console.log('搜索成功',res);
    } else {
      errorHandler.showError("搜索失败", res);
    }
  } catch (error) {
    errorHandler.showError("搜索失败", error);
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
const getCampImageUrl = (filename) => {
  return `http://localhost:8080/images/campgroundPictures/${filename}`
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

// 获取状态标签类型
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
.camp-info {
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

.camp-table {
  margin-bottom: 20px;
}

.camp-name {
  font-weight: 500;
  color: #303133;
}

.image-carousel {
  width: 120px;
  margin: 0 auto;
}

.camp-image {
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
}

.update-dialog,
.maintain-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}
</style> 