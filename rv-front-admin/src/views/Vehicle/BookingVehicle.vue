<template>
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
    <!-- 表格 -->
    <div>
        <el-table :data="vehicleCurrentPageData" style="width: 100%" border>
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
          <el-table-column label="车辆描述" min-width="120px">
              <template #default="{ row }">
                {{ row.vehicleDescription }}
              </template>
          </el-table-column>
          <el-table-column label="车辆状态" min-width="120px">
              <template #default="{ row }">
                {{ row.vehicleStatus === VEHICLE_CONSTANT_DATA.AVAILABLE ? "可预定" : row.vehicleStatus === VEHICLE_CONSTANT_DATA.BOOKED ? "租赁中" : "维护中" }}
                <el-button type="primary" @click="handleBookingClick(row)" v-if="row.vehicleStatus === VEHICLE_CONSTANT_DATA.AVAILABLE">预定</el-button>
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
    <el-dialog v-model="bookingDialogVisible" title="预定车辆" width="30%" @close="handleBookingCancel">
      <el-form :model="bookingForm" label-width="120px">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="bookingForm.vehicleReservationStartDate"
            type="date"
            placeholder="选择开始日期"
            @change="calculateTotalPrice"
            clearable
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="bookingForm.vehicleReservationEndDate"
            type="date"
            placeholder="选择结束日期"
            @change="calculateTotalPrice"
            clearable
          />
        </el-form-item>
        <el-form-item label="总价">
          <el-input
            v-model="bookingForm.vehicleReservationTotalPrice"
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
import { VEHICLE_CONSTANT_DATA } from '../../constant/VehicleConstantData'
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import {errorHandler} from "../../utils/errorHandler.js";
import { vehicleApi } from '../../api/user/vehicle.js'
import { ElMessage } from 'element-plus'

//===============================数据========================================
const searchForm = ref({
  status: null,
  type: null,
  price: null
})
const bookingForm = ref({
  vehicleReservationVehicleId: null,
  vehicleReservationStartDate: null,
  vehicleReservationEndDate: null,
  vehicleReservationTotalPrice: null,
  vehicleReservationCurrentPrice: null,

})
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
// 获取图片
const getImages = (pictureStr) => {
  try {
    return JSON.parse(pictureStr) || []
  } catch {
    return []
  }
}
const getVehicleImageUrl = (filename) => {
  //return `http://localhost:8080/images/campgroundPictures/0c4bc107-77aa-49e1-9ad8-b92591c4a395.jpg`
  return `http://localhost:8080/images/vehiclePictures/${filename}`
}
// 计算总价
const calculateTotalPrice = () => {
  // Validate dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = bookingForm.value.vehicleReservationStartDate ? new Date(bookingForm.value.vehicleReservationStartDate) : null
  const endDate = bookingForm.value.vehicleReservationEndDate ? new Date(bookingForm.value.vehicleReservationEndDate) : null

  if (startDate && startDate <= today) {
    ElMessage.warning('开始日期必须大于今天')
    bookingForm.value.vehicleReservationStartDate = null
    return
  }

  if (startDate && endDate && endDate <= startDate) {
    ElMessage.warning('结束日期必须大于开始日期')
    bookingForm.value.vehicleReservationEndDate = null
    return
  }
  if(bookingForm.value.vehicleReservationStartDate && bookingForm.value.vehicleReservationEndDate){
    const startDate = new Date(bookingForm.value.vehicleReservationStartDate)
    const endDate = new Date(bookingForm.value.vehicleReservationEndDate)
    const timeDifference = (endDate - startDate) / (1000 * 60 * 60 * 24)
    bookingForm.value.vehicleReservationTotalPrice = timeDifference * bookingForm.value.vehicleReservationCurrentPrice
  }
}
// 预定
const handleBooking = async () => {
  try {
    const requestData = {
      vehicleReservationVehicleId: bookingForm.value.vehicleReservationVehicleId,
      vehicleReservationStartDate: getTimestamp(bookingForm.value.vehicleReservationStartDate),
      vehicleReservationEndDate: getTimestamp(bookingForm.value.vehicleReservationEndDate),
      vehicleReservationTotalPrice: bookingForm.value.vehicleReservationTotalPrice
    }
    console.log("预定车辆请求数据：",requestData)
    const res = await vehicleApi.vehicleReservation(requestData)
    if(res.code === 200){
      ElMessage.success("预定车辆成功")
      console.log("预定车辆响应数据：",res)
      bookingDialogVisible.value = false
      handleSearchClick()
    }else if(res.code === 416){
      ElMessage.warning("用户已有预定")
    }else{
      errorHandler.showError("预定车辆失败",res)
    }
  } catch (error) {
    errorHandler.showError("预定车辆失败",error)
  }
}
// 取消预定
const handleBookingCancel = () => {
  bookingForm.value = {
    vehicleReservationVehicleId: null,
    vehicleReservationStartDate: null,
    vehicleReservationEndDate: null,
    vehicleReservationTotalPrice: null,
    vehicleReservationCurrentPrice: null
  }
  bookingDialogVisible.value = false
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
const bookingDialogVisible = ref(false)
const handleBookingClick = (row) => {
  bookingDialogVisible.value = true
  bookingForm.value = {
    vehicleReservationVehicleId: row.vehicleId,
    vehicleReservationStartDate: null,
    vehicleReservationEndDate: null,
    vehicleReservationTotalPrice: null,
    vehicleReservationCurrentPrice: row.vehiclePrice
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