<template>
  <div class="booking-camp-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <div class="search-header">
          <span class="search-title">
            <el-icon><Location /></el-icon>
            营地筛选
          </span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-select 
            style="width: 200px;" 
            v-model="searchForm.status" 
            placeholder="营地状态"
            clearable
          >
            <el-option label="可预定" :value="CAMP_CONSTANT_DATA.AVAILABLE">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span style="margin-left: 6px">可预定</span>
            </el-option>
            <el-option label="租赁中" :value="CAMP_CONSTANT_DATA.BOOKED">
              <el-icon color="#E6A23C"><Timer /></el-icon>
              <span style="margin-left: 6px">租赁中</span>
            </el-option>
            <el-option label="维护中" :value="CAMP_CONSTANT_DATA.MAINTENANCE">
              <el-icon color="#F56C6C"><Tools /></el-icon>
              <span style="margin-left: 6px">维护中</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input 
            style="width: 200px;" 
            v-model="searchForm.name" 
            placeholder="营地名称"
            clearable
          >
            <template #prefix>
              <el-icon><House /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input 
            style="width: 200px;" 
            v-model="searchForm.location" 
            placeholder="营地地址"
            clearable
          >
            <template #prefix>
              <el-icon><MapLocation /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input-number 
            style="width: 200px;"
            v-model="searchForm.price" 
            placeholder="最高价格"
            :min="0"
            :max="100000000"
            clearable
          >
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
          </el-input-number>
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
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <el-table 
        :data="campCurrentPageData" 
        style="width: 100%" 
        border
        v-loading="loading"
        row-class-name="table-row"
      >
        <el-table-column label="营地名称" min-width="150px" align="center">
          <template #default="{ row }">
            <div class="camp-name">
              <el-icon><House /></el-icon>
              <span>{{ row.campgroundName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="营地图片" min-width="120px" align="center">
          <template #default="{ row }">
            <el-carousel 
              v-if="getImages(row.campgroundPicture).length"
              height="120px"
              indicator-position="none"
              :interval="4000"
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
        <el-table-column label="营地价格" min-width="120px" align="center">
          <template #default="{ row }">
            <span class="price">¥ {{ row.campgroundPrice }}/天</span>
          </template>
        </el-table-column>
        <el-table-column label="营地地址" min-width="200px" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="location">
              <el-icon><Location /></el-icon>
              <span>{{ row.campgroundLocation }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="营地设施" min-width="200px" show-overflow-tooltip>
          <template #default="{ row }">
            <el-text class="description">{{ row.campgroundFacilityDetails }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="营地状态" min-width="120px" align="center">
          <template #default="{ row }">
            <div class="status-column">
              <el-tag :type="getStatusType(row.campgroundStatus)">
                {{ getStatusText(row.campgroundStatus) }}
              </el-tag>
              <el-button 
                v-if="row.campgroundStatus === CAMP_CONSTANT_DATA.AVAILABLE"
                type="primary" 
                @click="handleBookingClick(row)"
                class="booking-button"
              >
                <el-icon><Calendar /></el-icon>
                预定
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <SmartPagination
          v-model:current-page="campPagination.currentPage"
          :server-page-size="campPagination.serverPageSize"
          :display-page-size="campPagination.displayPageSize"
          :total="campPagination.totalItems"
          @load-data="handleCampLoadData" 
        />
      </div>
    </el-card>

    <!-- 预定对话框 -->
    <el-dialog 
      v-model="bookingDialogVisible" 
      title="预定营地" 
      width="500px" 
      @close="handleBookingCancel"
      destroy-on-close
      class="booking-dialog"
    >
      <el-form :model="bookingForm" label-width="120px">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="bookingForm.campgroundStartDate"
            type="date"
            placeholder="选择开始日期"
            @change="calculateTotalPrice"
            clearable
            class="date-picker"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="bookingForm.campgroundEndDate"
            type="date"
            placeholder="选择结束日期"
            @change="calculateTotalPrice"
            clearable
            class="date-picker"
          />
        </el-form-item>
        <el-form-item label="总价">
          <el-input
            v-model="bookingForm.campgroundTotalPrice"
            disabled
            class="total-price"
          >
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleBookingCancel">取消</el-button>
          <el-button type="primary" @click="handleBooking">确认预定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CAMP_CONSTANT_DATA } from '../../constant/CampConstantData'
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import {errorHandler} from "../../utils/errorHandler.js";
import { campApi } from '../../api/user/camp.js'
import { ElMessage } from 'element-plus'
import { Search, Location, House, MapLocation, Money, Calendar, CircleCheck, Timer, Tools } from '@element-plus/icons-vue'

//===============================数据========================================
const searchForm = ref({
  status: null,
  name: null,
  location: null,
  price: null
})
const bookingForm = ref({
  campgroundId: null,
  campgroundStartDate: null,
  campgroundEndDate: null,
  campgroundTotalPrice: null,
  campgroundCurrentPrice: null,

})
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
// 获取图片
const getImages = (pictureStr) => {
  try {
    return JSON.parse(pictureStr) || []
  } catch {
    return []
  }
}
const getCampImageUrl = (filename) => {
  //return `http://localhost:8080/images/campgroundPictures/0c4bc107-77aa-49e1-9ad8-b92591c4a395.jpg`
  return `http://localhost:8080/images/campgroundPictures/${filename}`
}
// 计算总价
const calculateTotalPrice = () => {
  // Validate dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = bookingForm.value.campgroundStartDate ? new Date(bookingForm.value.campgroundStartDate) : null
  const endDate = bookingForm.value.campgroundEndDate ? new Date(bookingForm.value.campgroundEndDate) : null

  if (startDate && startDate <= today) {
    ElMessage.warning('开始日期必须大于今天')
    bookingForm.value.campgroundStartDate = null
    return
  }

  if (startDate && endDate && endDate <= startDate) {
    ElMessage.warning('结束日期必须大于开始日期')
    bookingForm.value.campgroundEndDate = null
    return
  }
  if(bookingForm.value.campgroundStartDate && bookingForm.value.campgroundEndDate){
    const startDate = new Date(bookingForm.value.campgroundStartDate)
    const endDate = new Date(bookingForm.value.campgroundEndDate)
    const timeDifference = (endDate - startDate) / (1000 * 60 * 60 * 24)
    bookingForm.value.campgroundTotalPrice = timeDifference * bookingForm.value.campgroundCurrentPrice
  }
}
// 预定
const handleBooking = async () => {
  try {
    const requestData = {
      campgroundReservationCampgroundId: bookingForm.value.campgroundId,
      campgroundReservationStartDate: getTimestamp(bookingForm.value.campgroundStartDate),
      campgroundReservationEndDate: getTimestamp(bookingForm.value.campgroundEndDate),
      campgroundReservationTotalPrice: bookingForm.value.campgroundTotalPrice
    }
    console.log("预定营地请求数据：",requestData)
    const res = await campApi.campgroundReservation(requestData)
    if(res.code === 200){
      ElMessage.success("预定营地成功")
      console.log("预定营地响应数据：",res)
      bookingDialogVisible.value = false
      handleSearchClick()
    }else if(res.code === 416){
      ElMessage.warning("用户已有预定")
    }else{
      errorHandler.showError("预定营地失败",res)
    }
  } catch (error) {
    errorHandler.showError("预定营地失败",error)
  }
}
// 取消预定
const handleBookingCancel = () => {
  bookingForm.value = {
    campgroundId: null,
    campgroundStartDate: null,
    campgroundEndDate: null,
    campgroundTotalPrice: null,
    campgroundCurrentPrice: null
  }
  bookingDialogVisible.value = false
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
const bookingDialogVisible = ref(false)
const handleBookingClick = (row) => {
  bookingDialogVisible.value = true
  bookingForm.value = {
    campgroundId: row.campgroundId,
    campgroundStartDate: null,
    campgroundEndDate: null,
    campgroundTotalPrice: null,
    campgroundCurrentPrice: row.campgroundPrice
  }
}

//===============================其他功能========================================
// 获取时间戳
const getTimestamp = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date)).getTime())
}

// 新增状态相关的工具函数
const getStatusType = (status) => {
  switch(status) {
    case CAMP_CONSTANT_DATA.AVAILABLE:
      return 'success'
    case CAMP_CONSTANT_DATA.BOOKED:
      return 'warning'
    case CAMP_CONSTANT_DATA.MAINTENANCE:
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status) => {
  switch(status) {
    case CAMP_CONSTANT_DATA.AVAILABLE:
      return '可预定'
    case CAMP_CONSTANT_DATA.BOOKED:
      return '租赁中'
    case CAMP_CONSTANT_DATA.MAINTENANCE:
      return '维护中'
    default:
      return '未知'
  }
}

// 添加loading状态
const loading = ref(false)

</script>

<style scoped>
.booking-camp-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  background: white;
  border-radius: 8px;
}

.search-header {
  display: flex;
  align-items: center;
}

.search-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.table-card {
  background: white;
  border-radius: 8px;
}

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.camp-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.image-carousel {
  border-radius: 4px;
  overflow: hidden;
}

.camp-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  cursor: pointer;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.description {
  color: #606266;
  font-size: 14px;
}

.status-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.booking-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.booking-dialog {
  .date-picker {
    width: 100%;
  }

  .total-price {
    font-weight: 600;
    color: #f56c6c;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

:deep(.el-dialog__body) {
  padding: 20px 40px;
}
</style>