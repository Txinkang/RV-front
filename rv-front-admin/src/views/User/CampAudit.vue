<template>
    <div class="camp-info">
        <h2>营地审核</h2>
        <el-button type="primary" @click="handleSearch" style="margin-bottom: 10px;">查看</el-button>
        <div class="content-placeholder">
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
            <el-table-column label="操作" min-width="150px">
                <template #default="{ row }">
                    <el-button type="primary" @click="handleAuditSuccess(row.campgroundId)">通过</el-button>
                    <el-button type="primary" @click="handleAuditFail(row.campgroundId)">不通过</el-button>
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
        </div>
    </div>
  </template>
  
<script setup>
import { ref } from 'vue'
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import {errorHandler} from "../../utils/errorHandler.js";
import { auditApi } from '../../api/audit.js'
import { ElMessage } from 'element-plus'

//===============================数据========================================

//===============================功能========================================

const handleSearch = async () => {
  try {
    const res = await auditApi.getAuditCampgroundList()
    if(res.code === 200){
      ElMessage.success("搜索营地成功")
      console.log("搜索营地响应数据：",res)
      campPagination.value.totalItems = res.data.length
      campPagination.value.cachedData.set(campPagination.value.serverPage, res.data)
    }else{
      errorHandler.showError("搜索营地失败",res)
    }
  } catch (error) {
    errorHandler.showError("搜索营地失败",error)
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

// 通过
const handleAuditSuccess = async (campgroundId) => {
    try {
        const requestData = {
            campgroundId: campgroundId,
            status: 2,  //1失败、2通过
            auditFailedMsg:""
        }
        const res = await auditApi.auditCampground(requestData)
        if(res.code === 200){
            ElMessage.success("审核营地成功")
            handleSearch()
        }else{
            errorHandler.showError("审核营地失败",res)
        }
    } catch (error) {
        errorHandler.showError("审核营地失败",error)
    }
}
// 不通过
const handleAuditFail = async (campgroundId) => {
    try {
        const requestData = {
            campgroundId: campgroundId,
            status: 1,  //1失败、2通过
            auditFailedMsg:""
        }
        const res = await auditApi.auditCampground(requestData)
        if(res.code === 200){
            ElMessage.success("审核营地成功")
            handleSearch()
        }else{
            errorHandler.showError("审核营地失败",res)
        }
    } catch (error) {
        errorHandler.showError("审核营地失败",error)
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

//===============================其他功能========================================


</script>
  
<style scoped>
.camp-info {
  padding: 20px;
}

.content-placeholder {
  margin-top: 20px;
  min-height: 300px;
}
</style>