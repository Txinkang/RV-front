<template>
  <div class="upload-container">
    <el-card class="upload-card" shadow="hover">
      <el-tabs v-model="activeTab" type="border-card" class="upload-tabs">
        <!-- 营地信息面板 -->
        <el-tab-pane name="camp">
          <template #label>
            <div class="tab-label">
              <el-icon><Location /></el-icon>
              <span>营地信息</span>
            </div>
          </template>
          <el-form 
            :model="campForm" 
            :rules="campRules" 
            ref="campFormRef" 
            label-width="100px"
            class="upload-form"
          >
            <el-form-item label="营地名称" prop="name">
              <el-input 
                v-model="campForm.name" 
                placeholder="请输入营地名称"
              >
                <template #prefix>
                  <el-icon><House /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="营地位置" prop="location">
              <el-input 
                v-model="campForm.location" 
                placeholder="请输入营地位置"
              >
                <template #prefix>
                  <el-icon><MapLocation /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="营地价格" prop="price">
              <el-input-number 
                v-model="campForm.price" 
                :min="0" 
                :precision="2" 
                :step="10" 
                placeholder="请输入营地价格"
                class="price-input"
              >
                <template #prefix>
                  <el-icon><Money /></el-icon>
                </template>
              </el-input-number>
            </el-form-item>
            
            <el-form-item label="营地设备" prop="facilities">
              <el-input 
                type="textarea" 
                v-model="campForm.facilities" 
                placeholder="请输入营地设备信息"
                :rows="4"
                resize="none"
              />
            </el-form-item>
            
            <el-form-item label="营地图片" prop="pictures" class="upload-pictures">
              <el-upload
                ref="campPictureRef"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="handleCampPictureChange"
                :on-remove="handleCampPictureRemove"
                multiple
                accept="image/*"
                class="upload-area"
              >
                <template #default>
                  <div class="upload-trigger">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span class="upload-text">点击上传</span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            
            <el-form-item class="form-buttons">
              <el-button type="primary" @click="submitCampForm">
                <el-icon><Upload /></el-icon>
                上传审核
              </el-button>
              <el-button @click="resetCampForm">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 车辆信息面板 -->
        <el-tab-pane name="vehicle">
          <template #label>
            <div class="tab-label">
              <el-icon><Van /></el-icon>
              <span>车辆信息</span>
            </div>
          </template>
          <el-form 
            :model="vehicleForm" 
            :rules="vehicleRules" 
            ref="vehicleFormRef" 
            label-width="100px"
            class="upload-form"
          >
            <el-form-item label="车辆类型" prop="type">
              <el-select 
                v-model="vehicleForm.type" 
                placeholder="请选择类型" 
                clearable
                class="type-select"
              >
                <el-option label="自行式" :value="VEHICLE_CONSTANT_DATA.TYPE_A">
                  <el-icon><Van /></el-icon>
                  <span style="margin-left: 8px">自行式</span>
                </el-option>
                <el-option label="拖挂式" :value="VEHICLE_CONSTANT_DATA.TYPE_B">
                  <el-icon><TakeawayBox /></el-icon>
                  <span style="margin-left: 8px">拖挂式</span>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="车辆位置" prop="location">
              <el-input 
                v-model="vehicleForm.location" 
                placeholder="请输入车辆位置"
              >
                <template #prefix>
                  <el-icon><Location /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="车辆价格" prop="price">
              <el-input-number 
                v-model="vehicleForm.price" 
                :min="0" 
                :precision="2" 
                :step="10" 
                placeholder="请输入车辆价格"
                class="price-input"
              >
                <template #prefix>
                  <el-icon><Money /></el-icon>
                </template>
              </el-input-number>
            </el-form-item>
            
            <el-form-item label="车辆描述" prop="description">
              <el-input 
                type="textarea" 
                v-model="vehicleForm.description" 
                placeholder="请输入车辆描述"
                :rows="4"
                resize="none"
              />
            </el-form-item>
            
            <el-form-item label="车辆图片" prop="pictures" class="upload-pictures">
              <el-upload
                ref="vehiclePictureRef"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="handleVehiclePictureChange"
                :on-remove="handleVehiclePictureRemove"
                multiple
                accept="image/*"
                class="upload-area"
              >
                <template #default>
                  <div class="upload-trigger">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span class="upload-text">点击上传</span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            
            <el-form-item class="form-buttons">
              <el-button type="primary" @click="submitVehicleForm">
                <el-icon><Upload /></el-icon>
                上传审核
              </el-button>
              <el-button @click="resetVehicleForm">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Location, House, MapLocation, Money, Upload, Plus, RefreshRight,
  Van, TakeawayBox 
} from '@element-plus/icons-vue'
import { campApi } from '../../api/business/camp.js'
import { vehicleApi } from '../../api/business/vehicle.js'
import { errorHandler } from '../../utils/errorHandler.js'
import { VEHICLE_CONSTANT_DATA } from '../../constant/VehicleConstantData.js'
// 当前激活的标签页
const activeTab = ref('camp')

// 营地表单相关
const campFormRef = ref(null)
const campForm = reactive({
  name: '',
  location: '',
  price: 0,
  facilities: '',
  pictures: []
})
const campPictureRef = ref(null)

// 营地表单验证规则
const campRules = {
  name: [
    { required: true, message: '请输入营地名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入营地位置', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入营地价格', trigger: 'blur' },
    { type: 'number', min: 1, message: '价格必须大于等于1', trigger: 'blur' }
  ],
  facilities: [
    { required: true, message: '请输入营地设备信息', trigger: 'blur' }
  ],
  pictures: [
    { required: true, message: '请上传营地图片', trigger: 'change' }
  ]
}

// 车辆表单相关
const vehicleFormRef = ref(null)
const vehicleForm = reactive({
  type: '',
  location: '',
  price: 0,
  description: '',
  pictures: []
})
const vehiclePictureRef = ref(null)
// 车辆表单验证规则
const vehicleRules = {
  type: [
    { required: true, message: '请选择车辆类型', trigger: 'blur' },
  ],
  location: [
    { required: true, message: '请输入车辆位置', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入车辆价格', trigger: 'blur' },
    { type: 'number', min: 1, message: '价格必须大于等于1', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入车辆描述', trigger: 'blur' }
  ],
  pictures: [
    { required: true, message: '请上传车辆图片', trigger: 'change' }
  ]
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

// 车辆图片处理
const handleVehiclePictureChange = (file) => {
  if (file.raw.type.indexOf('image/') !== 0) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  
  vehicleForm.pictures.push(file)
}

const handleVehiclePictureRemove = (file) => {
  const index = vehicleForm.pictures.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    vehicleForm.pictures.splice(index, 1)
  }
}

// 提交营地表单
const submitCampForm = async () => {
    try{
        campFormRef.value.validate( async (valid) => {
            if (valid) {
                const campground = {
                    campgroundName: campForm.name,
                    campgroundLocation: campForm.location,
                    campgroundPrice: campForm.price,
                    campgroundFacilityDetails: campForm.facilities,
                }
                // 创建一个 Blob，指定内容类型为 application/json
                const campgroundBlob = new Blob(
                    [JSON.stringify(campground)], 
                    { type: 'application/json' }
                )
                const campgroundPictures = campForm.pictures.map(picture => picture.raw)
                const formData = new FormData()
                formData.append('campground', campgroundBlob)
                campgroundPictures.forEach(picture => formData.append('campgroundPictures', picture))

                const res = await campApi.uploadCampground(formData)
                if(res.code === 200){
                    ElMessage.success('营地信息提交成功，等待审核')
                    resetCampForm()
                    console.log("营地信息提交成功", res)
                }else if(res.code === 440){
                    ElMessage.error('用户没有权限')
                }else{
                    errorHandler.showError('营地信息提交失败', res)
                }
            } else {
                ElMessage.error('请完善表单信息')
                return false
            }
        })
    }catch(error){
        errorHandler.showError('营地信息提交失败', error)
    }
}

// 重置营地表单
const resetCampForm = () => {
  campFormRef.value.resetFields()
  campForm.pictures = []
  campPictureRef.value.clearFiles()
}

// 提交车辆表单
const submitVehicleForm = async () => {
  try{
    vehicleFormRef.value.validate( async (valid) => {
        if (valid) {
            const vehicle = {
                vehicleType: vehicleForm.type,
                vehicleLocation: vehicleForm.location,
                vehiclePrice: vehicleForm.price,
                vehicleDescription: vehicleForm.description,
            }
            const vehicleBlob = new Blob(
                [JSON.stringify(vehicle)], 
                { type: 'application/json' }
            )
            const vehiclePictures = vehicleForm.pictures.map(picture => picture.raw)
            const formData = new FormData()
            formData.append('vehicle', vehicleBlob)
            vehiclePictures.forEach(picture => formData.append('vehiclePictures', picture))
            const res = await vehicleApi.uploadVehicle(formData)
            if(res.code === 200){
                ElMessage.success('车辆信息提交成功，等待审核')
                resetVehicleForm()
                console.log("车辆信息提交成功", res)
            }else if(res.code === 440){
                ElMessage.error('用户没有权限')
            }else{
                errorHandler.showError('车辆信息提交失败', res)
            }
        } else {
            ElMessage.error('请完善表单信息')
            return false
        }
    })
  }catch(error){
    errorHandler.showError('车辆信息提交失败', error)
  }
}

// 重置车辆表单
const resetVehicleForm = () => {
  vehicleFormRef.value.resetFields()
  vehicleForm.pictures = []
  vehiclePictureRef.value.clearFiles()
}
</script>

<style scoped>
.upload-container {
  padding: 20px;
  min-height: calc(100vh - 200px);
  background-color: #f5f7fa;
}

.upload-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 8px;
}

.upload-tabs {
  border: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.upload-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.price-input {
  width: 100%;
}

.type-select {
  width: 100%;
}

.upload-pictures {
  margin-bottom: 30px;
}

.upload-area {
  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
    border-radius: 8px;
    border: 1px dashed #d9d9d9;
    transition: all 0.3s;

    &:hover {
      border-color: #409EFF;
    }
  }

  :deep(.el-upload-list__item) {
    border-radius: 8px;
  }
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c939d;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.form-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}

:deep(.el-tabs__nav) {
  border-radius: 8px 8px 0 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
}
</style>
