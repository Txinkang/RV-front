<template>
  <div class="data-analyze">
    <h2>数据分析</h2>
    <el-button type="primary" @click="fetchData" style="margin-bottom: 20px;">刷新数据</el-button>
    
    <div id="chart" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import userApi from '../../api/user.js'
import { errorHandler } from '../../utils/errorHandler.js'
import { ElMessage } from 'element-plus'

let chart = null
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
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
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
          color: '#409EFF'
        }
      }
    ]
  }

  chart.setOption(option)
}

const fetchData = async () => {
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
  padding: 20px;
}
</style>
