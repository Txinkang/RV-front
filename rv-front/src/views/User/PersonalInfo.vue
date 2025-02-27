<template>
  <div class="personal-info">
    <h2>个人信息</h2>
    <div class="content-placeholder">
      <el-form :model="userDisplay" label-width="80px" class="user-form">
        <el-form-item label="用户名">
          <el-input v-model="userDisplay.userName" :disabled="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userDisplay.userEmail" :disabled="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userDisplay.userPhoneNumber" :disabled="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="积分">
          <el-input v-model="userDisplay.userPoints" disabled></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-button type="primary" size="small" @click="handleChangePasswordDialog">修改密码</el-button>
        </el-form-item>
        <el-form-item label="角色">
          <span style="width: 100px;margin-right: 10px;" v-if="userDisplay.userRole === 0">普通用户</span>
          <span style="width: 100px;margin-right: 10px;" v-else-if="userDisplay.userRole === 1">商家用户</span>
          <el-button v-if="userDisplay.userRole === 0" type="primary" size="small" @click="handleUpgradeRole">升级</el-button>
        </el-form-item>
        <el-form-item label="余额">
          <el-input style="width: 100px;margin-right: 10px;" v-model="userDisplay.userBalance" disabled></el-input>
          <el-button type="primary" size="small" @click="handleRechargeDialog">充值</el-button>
        </el-form-item>
        <el-form-item>
          <template #label>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </template>
          <el-button v-if="isEditing" @click="handleConfirm">确认</el-button>
          <el-button v-if="isEditing" @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 充值弹窗 -->
    <el-dialog 
    v-model="rechargeDialog" 
    title="充值" width="30%" 
    @close="handleRechargeDialogClose"
    style="height: 200px;"
    >
      <el-input-number 
        v-model="rechargeAmount" 
        placeholder="请输入充值金额" 
        style="width: 300px;margin-right: 10px;"
        :min="0.01"
        :max="100000000"
        clearable
      />
      <el-button type="primary" @click="handleRecharge">充值</el-button>
    </el-dialog>
    <!-- 修改密码弹窗 -->
    <el-dialog 
      v-model="changePasswordDialog" 
      title="修改密码" 
      width="30%"
      @close="handleChangePasswordDialogClose"
      style="height: 300px;"
      >
      <el-form :model="changePasswordForm" label-width="80px" class="change-password-form">
        <el-form-item label="旧密码">
          <el-input v-model="changePasswordForm.oldPassword" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="changePasswordForm.newPassword" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="changePasswordForm.confirmPassword" placeholder="请确认新密码"></el-input>
        </el-form-item>
        <el-form-item>  
          <el-button type="primary" @click="handleChangePassword">修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {errorHandler} from "../../utils/errorHandler.js";
import { userApi } from '../../api/user/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from "../../router/index.js";
const isEditing = ref(false);
const userForm = ref({
  userName: null,
  userEmail: null,
  userPhoneNumber: null,
  userPoints: null,
  userBalance: null,
  userRole: null
});
const userDisplay = ref({
  userName: null,
  userEmail: null,
  userPhoneNumber: null,
  userPoints: null,
  userBalance: null,
  userRole: null
});
const rechargeAmount = ref(0);
const changePasswordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});


const getUserInfo = async () => {
  try {
    const res = await userApi.userInfo();
    if (res.code === 200) {
      ElMessage.success("获取用户信息成功");
      userForm.value = JSON.parse(JSON.stringify(res.data));
      userDisplay.value = JSON.parse(JSON.stringify(res.data));
      console.log("获取用户信息成功", res);
    } else {
      errorHandler.showError("获取用户信息失败,请刷新页面重试", res);
    }
  } catch (error) {
    errorHandler.showError("获取用户信息失败,请刷新页面重试", error);
  }
};
const handleEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  userDisplay.value = JSON.parse(JSON.stringify(userForm.value));
  isEditing.value = false;
};

const handleConfirm = async () => {
  try {
    const requestData = {
      userName: userDisplay.value.userName !== userForm.value.userName ? userDisplay.value.userName : '',
      userEmail: userDisplay.value.userEmail !== userForm.value.userEmail ? userDisplay.value.userEmail : '',
      userPhoneNumber: userDisplay.value.userPhoneNumber !== userForm.value.userPhoneNumber ? userDisplay.value.userPhoneNumber : '',
    };
    console.log("修改个人信息请求数据", requestData);
    const res = await userApi.updateUserInfo(requestData);
    if (res.code === 200) {
      ElMessage.success("更新用户信息成功");
      isEditing.value = false;
      await getUserInfo();
    } else if(res.code === 402){
      ElMessage.error("用户名已被注册");
    } else if(res.code === 403){
      ElMessage.error("邮箱已被注册");
    } else if(res.code === 404){
      ElMessage.error("手机号已被注册");
    } else {
      errorHandler.showError("更新用户信息失败", res);
    }
  } catch (error) {
    errorHandler.showError("更新用户信息失败", error);
  }
};

const handleUpgradeRole = async () => {
  try {
    const res = await userApi.upgradeRole();
    if (res.code === 200) {
      ElMessage.success("升级角色成功");
      await getUserInfo();
    } else {
      errorHandler.showError("升级角色失败", res);
    }
  } catch (error) {
    errorHandler.showError("升级角色失败", error);
  }
};

const handleRecharge = async () => {
  try {
    const requestData = {
      amount: rechargeAmount.value
    };
    console.log("充值请求数据", requestData);
    const res = await userApi.recharge(requestData);
    if (res.code === 200) {
      ElMessage.success("充值成功");
      await getUserInfo();
      rechargeDialog.value = false;
    } else {
      errorHandler.showError("充值失败", res);
    }
  } catch (error) {
    errorHandler.showError("充值失败", error);
  }
};
const handleChangePassword = async () => {
  try {
    if(changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword){
      ElMessage.error("新密码与确认密码不一致");
      return;
    }
    const requestData = {
      oldPassword: changePasswordForm.value.oldPassword,
      newPassword: changePasswordForm.value.newPassword,
      confirmNewPassword: changePasswordForm.value.confirmPassword
    };
    console.log("修改密码请求数据", requestData);
    const res = await userApi.updatePassword(requestData);
    if (res.code === 200) {
      ElMessage.success("修改密码成功");
      changePasswordDialog.value = false;
      // 清除本地存储的用户信息
      localStorage.removeItem('user_token')
      localStorage.removeItem('token_expiry')
      // 显示提示框
      ElMessageBox.alert('请登录', '提示', {
        confirmButtonText: '确定',
        showClose: false,
        callback: () => {
          router.replace('/login')
        }
      })
    } else if(res.code === 407){
      ElMessage.error("旧密码错误");
    } else {
      errorHandler.showError("修改密码失败", res);
    }
  } catch (error) {
    errorHandler.showError("修改密码失败", error);
  }
};
const rechargeDialog = ref(false);
const handleRechargeDialog = () => {
  rechargeDialog.value = true;
};
const handleRechargeDialogClose = () => {
  rechargeAmount.value = 0;
  rechargeDialog.value = false;
};

const changePasswordDialog = ref(false);
const handleChangePasswordDialog = () => {
  changePasswordDialog.value = true;
};
const handleChangePasswordDialogClose = () => {
  changePasswordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  changePasswordDialog.value = false;
};

onMounted(async () => {
  await getUserInfo();
});
</script>

<style scoped>
.personal-info {
  padding: 20px;
}

.content-placeholder {
  margin-top: 20px;
  min-height: 300px;
}
</style> 