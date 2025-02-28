<template>
  <div class="data-analyze">
    <div class="page-header">
      <h2>数据分析</h2>
      <el-button type="primary" @click="fetchData">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <div class="content-wrapper">
      <div class="chart-section" v-loading="loading">
        <!-- 数据卡片 -->
        <div class="data-cards">
          <el-row :gutter="20">
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Van /></el-icon>
                    <span>车辆总数</span>
                  </div>
                </template>
                <div class="card-value">{{ chartData.vehicleCount }}</div>
              </el-card>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Location /></el-icon>
                    <span>营地总数</span>
                  </div>
                </template>
                <div class="card-value">{{ chartData.campCount }}</div>
              </el-card>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Wallet /></el-icon>
                    <span>支付总数</span>
                  </div>
                </template>
                <div class="card-value">{{ chartData.paymentCount }}</div>
              </el-card>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Document /></el-icon>
                    <span>订单总数</span>
                  </div>
                </template>
                <div class="card-value">{{ chartData.unpaidCount + chartData.completedCount }}</div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 图表 -->
        <div class="chart-container">
          <div id="chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import userApi from '../../api/user.js'
import { errorHandler } from '../../utils/errorHandler.js'
import { ElMessage } from 'element-plus'
import { Refresh, Van, Location, Wallet, Document } from '@element-plus/icons-vue'

let chart = null
const loading = ref(false)
const chartData = ref({
  vehicleCount: 0,
  unpaidCount: 0, 
  completedCount: 0,
  campCount: 0,
  paymentCount: 0
})

const initChart = () => {
  const chartDom = document.getElementById('chart')
  chart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '系统数据统计',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['车辆总数', '未支付订单', '已完成订单', '营地总数', '支付总数'],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [
          chartData.value.vehicleCount,
          chartData.value.unpaidCount,
          chartData.value.completedCount, 
          chartData.value.campCount,
          chartData.value.paymentCount
        ],
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#409EFF' },
            { offset: 1, color: '#2c5282' }
          ])
        }
      }
    ]
  }

  chart.setOption(option)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await userApi.dataAnalyze()
    if (res.code === 200) {
      chartData.value = res.data
      initChart()
      ElMessage.success('数据刷新成功')
    } else {
      errorHandler.showError('获取数据失败', res)
    }
  } catch (error) {
    errorHandler.showError('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart && chart.resize()
  })
})
</script>

<style scoped>
.data-analyze {
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

.chart-section {
  padding: 24px;
}

.data-cards {
  margin-bottom: 32px;
}

.data-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #666;
}

.card-header .el-icon {
  font-size: 20px;
  color: #409EFF;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #409EFF;
  text-align: center;
  margin-top: 8px;
}

.chart-container {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}

#chart {
  width: 100%;
  height: 400px;
  margin-top: 20px;
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

  .chart-section {
    padding: 16px;
  }

  #chart {
    height: 300px;
  }
}
</style>
