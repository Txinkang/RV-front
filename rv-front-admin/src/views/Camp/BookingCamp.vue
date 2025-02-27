<template>
    <!-- 搜索 -->
    <div>
        <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item>
                <el-select style="width: 200px;" v-model="searchForm.status" placeholder="请选择状态" clearable>
                    <el-option label="可预定" :value="CAMP_CONSTANT_DATA.AVAILABLE" />
                    <el-option label="租赁中" :value="CAMP_CONSTANT_DATA.BOOKED" />
                    <el-option label="维护中" :value="CAMP_CONSTANT_DATA.MAINTENANCE" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-input style="width: 200px;" v-model="searchForm.name" placeholder="请输入名称" clearable />
            </el-form-item>
            <el-form-item>
                <el-input style="width: 200px;" v-model="searchForm.location" placeholder="请输入地址" clearable />
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
    <!-- 表格 -->
    <div>
        <el-table :data="campCurrentPageData" style="width: 100%" border>
          <el-table-column label="营地名称" min-width="120px">
              <template #default="{ row }">
                {{ row.campgroundName }}
              </template>
          </el-table-column>
          <el-table-column label="营地图片" min-width="120px">
            <template #default="{ row }">
              <el-carousel 
                v-if="getImages(row.campgroundPicture).length"
                height="100px"
                indicator-position="none"
              >
                <el-carousel-item v-for="image in getImages(row.campgroundPicture)" :key="image">
                  <el-image 
                    :src="getCampImageUrl(image)" 
                    style="width: 100px; height: 100px;" 
                    fit="cover"
                  />
                </el-carousel-item>
              </el-carousel>
            </template>
          </el-table-column>
          <el-table-column label="营地价格" min-width="120px">
              <template #default="{ row }">
                {{ row.campgroundPrice }}
              </template>
          </el-table-column>  
          <el-table-column label="营地地址" min-width="120px">
              <template #default="{ row }">
                {{ row.campgroundLocation }}
              </template>
          </el-table-column>
          <el-table-column label="营地描述" min-width="120px">
              <template #default="{ row }">
                {{ row.campgroundFacilityDetails }}
              </template>
          </el-table-column>
          <el-table-column label="营地状态" min-width="120px">
              <template #default="{ row }">
                {{ row.campgroundStatus === CAMP_CONSTANT_DATA.AVAILABLE ? "可预定" : row.campgroundStatus === CAMP_CONSTANT_DATA.BOOKED ? "租赁中" : "维护中" }}
                <el-button type="primary" @click="handleBookingClick(row)" v-if="row.campgroundStatus === CAMP_CONSTANT_DATA.AVAILABLE">预定</el-button>
              </template>
          </el-table-column>
        </el-table>
    </div>
    <!-- 分页 -->
    <div>
      <SmartPagination
        v-model:current-page="campPagination.currentPage"
        :server-page-size="campPagination.serverPageSize"
        :display-page-size="campPagination.displayPageSize"
        :total="campPagination.totalItems"
        @load-data="handleCampLoadData" />
    </div>
    <el-dialog v-model="bookingDialogVisible" title="预定营地" width="30%" @close="handleBookingCancel">
      <el-form :model="bookingForm" label-width="120px">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="bookingForm.campgroundStartDate"
            type="date"
            placeholder="选择开始日期"
            @change="calculateTotalPrice"
            clearable
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="bookingForm.campgroundEndDate"
            type="date"
            placeholder="选择结束日期"
            @change="calculateTotalPrice"
            clearable
          />
        </el-form-item>
        <el-form-item label="总价">
          <el-input
            v-model="bookingForm.campgroundTotalPrice"
            disabled
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleBooking">预定</el-button>
          <el-button @click="handleBookingCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </template>
  
<script setup>
import { ref } from 'vue'
import { CAMP_CONSTANT_DATA } from '../../constant/CampConstantData'
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import {errorHandler} from "../../utils/errorHandler.js";
import { campApi } from '../../api/user/camp.js'
import { ElMessage } from 'element-plus'

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

</script>
  
  <style scoped>
  </style>