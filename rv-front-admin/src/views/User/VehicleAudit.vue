<template>
  <div class="vehicle-audit">
    <div class="page-header">
      <h2>车辆审核</h2>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>

    <div class="content-wrapper">
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

          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleAuditSuccess(row.vehicleId)"
                >
                  <el-icon><Check /></el-icon>通过
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleAuditFail(row.vehicleId)"
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
          v-model:current-page="vehiclePagination.currentPage"
          :server-page-size="vehiclePagination.serverPageSize"
          :display-page-size="vehiclePagination.displayPageSize"
          :total="vehiclePagination.totalItems"
          @load-data="handleVehicleLoadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePagination } from '../../common/Pagination/Pagination'
import SmartPagination from '../../components/SmartPagination.vue'
import { auditApi } from '../../api/audit.js'
import { errorHandler } from '../../utils/errorHandler'
import { ElMessage } from 'element-plus'
import { VEHICLE_CONSTANT_DATA } from '../../constant/VehicleConstantData'
import { Refresh, Check, Close } from '@element-plus/icons-vue'

// 添加 loading 状态
const loading = ref(false)

// 查看车辆信息
const handleSearch = async () => {
  loading.value = true
  try {
    clearVehicleCache()
    const res = await auditApi.getAuditVehicleList()
    if (res.code === 200) {
      ElMessage.success('获取审核列表成功')
      vehiclePagination.value.totalItems = res.data.length
      res.data = res.data.filter(item => item.vehicleStatus !== 99)
      vehiclePagination.value.cachedData.set(vehiclePagination.value.serverPage, res.data)
      console.log('搜索成功',res)
    } else {
      errorHandler.showError("获取审核列表失败", res)
    }
  } catch (error) {
    errorHandler.showError("获取审核列表失败", error)
  } finally {
    loading.value = false
  }
}

// 通过
const handleAuditSuccess = async (vehicleId) => {
    try {
        const requestData = {
            vehicleId: vehicleId,
            status: 2,  //1失败、2通过
            auditFailedMsg:""
        }
        const res = await auditApi.auditVehicle(requestData)
        if(res.code === 200){
            ElMessage.success("审核车辆成功")
            handleSearch()
        }else{
            errorHandler.showError("审核车辆失败",res)
        }
    } catch (error) {
        errorHandler.showError("审核车辆失败",error)
    }
}
// 不通过
const handleAuditFail = async (vehicleId) => {
    try {
        const requestData = {
            vehicleId: vehicleId,
            status: 1,  //1失败、2通过
            auditFailedMsg:""
        }
        const res = await auditApi.auditVehicle(requestData)
        if(res.code === 200){
            ElMessage.success("审核车辆成功")
            handleSearch()
        }else{
            errorHandler.showError("审核车辆失败",res)
        }
    } catch (error) {
        errorHandler.showError("审核车辆失败",error)
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

// 获取图片
const getImages = (pictureStr) => {
  try {
    return JSON.parse(pictureStr) || []
  } catch {
    return []
  }
}
const getVehicleImageUrl = (filename) => {
  const url = import.meta.env.VITE_IMAGE_VEHICLE_BASE_URL
  return `${url}/${filename}`
}
</script>

<style scoped>
.vehicle-audit {
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