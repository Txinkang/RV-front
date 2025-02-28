<template>
  <div class="camp-audit">
    <div class="page-header">
      <h2>营地审核</h2>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>

    <div class="content-wrapper">
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

          <el-table-column label="营地价格" min-width="100">
            <template #default="{ row }">
              <span class="price">¥{{ row.campgroundPrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="营地地址" prop="campgroundLocation" min-width="150" show-overflow-tooltip />
          
          <el-table-column label="营地描述" prop="campgroundFacilityDetails" min-width="200" show-overflow-tooltip />

          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleAuditSuccess(row.campgroundId)"
                >
                  <el-icon><Check /></el-icon>通过
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleAuditFail(row.campgroundId)"
                >
                  <el-icon><Close /></el-icon>不通过
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import { errorHandler } from "../../utils/errorHandler.js"
import { auditApi } from '../../api/audit.js'
import { ElMessage } from 'element-plus'
import { Refresh, Check, Close } from '@element-plus/icons-vue'

// 添加 loading 状态
const loading = ref(false)

//===============================数据========================================

//===============================功能========================================

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await auditApi.getAuditCampgroundList()
    if(res.code === 200){
      ElMessage.success("获取审核列表成功")
      console.log("搜索营地响应数据：",res)
      campPagination.value.totalItems = res.data.length
      campPagination.value.cachedData.set(campPagination.value.serverPage, res.data)
    }else{
      errorHandler.showError("获取审核列表失败",res)
    }
  } catch (error) {
    errorHandler.showError("获取审核列表失败",error)
  } finally {
    loading.value = false
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
.camp-audit {
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.table-section {
  padding: 24px 24px 0;
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

:deep(.el-button--small) {
  padding: 8px 16px;
}

:deep(.el-button--small .el-icon) {
  margin-right: 4px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .table-section {
    padding: 16px 16px 0;
    overflow-x: auto;
  }

  .pagination-section {
    padding: 16px;
  }
}
</style>