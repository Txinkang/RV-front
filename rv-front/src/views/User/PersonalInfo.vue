<template>
  <div class="personal-info">
    <div class="page-header">
      <div class="header-left">
        <el-icon><User /></el-icon>
        <h2>个人信息</h2>
      </div>
    </div>

    <div class="content-wrapper">
      <el-card shadow="hover" class="info-card">
        <el-form :model="userDisplay" label-width="100px" class="user-form">
          <div class="form-header">
            <el-avatar :size="80" class="user-avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <div class="user-role">
              <el-tag :type="userDisplay.userRole === 1 ? 'success' : 'info'" effect="light">
                <el-icon><Shop v-if="userDisplay.userRole === 1" /></el-icon>
                <el-icon><User v-if="userDisplay.userRole === 0" /></el-icon>
                {{ userDisplay.userRole === 1 ? '商家用户' : '普通用户' }}
              </el-tag>
            </div>
          </div>

          <el-form-item label="用户名">
            <el-input 
              v-model="userDisplay.userName" 
              :disabled="!isEditing"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input 
              v-model="userDisplay.userEmail" 
              :disabled="!isEditing"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="手机号">
            <el-input 
              v-model="userDisplay.userPhoneNumber" 
              :disabled="!isEditing"
              :prefix-icon="Phone"
            />
          </el-form-item>

          <el-form-item label="积分">
            <el-input 
              v-model="userDisplay.userPoints" 
              disabled
              :prefix-icon="Star"
            >
              <template #append>积分</template>
            </el-input>
          </el-form-item>

          <el-form-item label="余额">
            <div class="balance-wrapper">
              <el-input 
                v-model="userDisplay.userBalance" 
                disabled
                :prefix-icon="Wallet"
              >
                <template #prepend>¥</template>
              </el-input>
              <el-button type="primary" @click="handleRechargeDialog">
                <el-icon><Plus /></el-icon>
                充值
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="账户安全">
            <el-button type="warning" @click="handleChangePasswordDialog">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
          </el-form-item>

          <el-form-item label="账户类型" v-if="userDisplay.userRole === 0">
            <el-button type="primary" @click="handleUpgradeRole">
              <el-icon><Promotion /></el-icon>
              升级为商家
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="edit-buttons">
              <el-button type="primary" @click="handleEdit" v-if="!isEditing">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
              <template v-else>
                <el-button type="success" @click="handleConfirm">
                  <el-icon><Check /></el-icon>
                  确认
                </el-button>
                <el-button @click="handleCancel">
                  <el-icon><Close /></el-icon>
                  取消
                </el-button>
              </template>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 充值对话框 -->
    <el-dialog 
      v-model="rechargeDialog" 
      title="账户充值" 
      width="400px"
      class="recharge-dialog"
    >
      <div class="recharge-content">
        <el-input-number 
          v-model="rechargeAmount" 
          :min="0.01"
          :max="100000000"
          :precision="2"
          :step="100"
          placeholder="请输入充值金额"
          class="recharge-input"
        >
          <template #prefix>¥</template>
        </el-input-number>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleRechargeDialogClose">取消</el-button>
          <el-button type="primary" @click="handleRecharge">
            <el-icon><Wallet /></el-icon>
            确认充值
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog 
      v-model="changePasswordDialog" 
      title="修改密码" 
      width="400px"
      class="password-dialog"
    >
      <el-form :model="changePasswordForm" class="password-form">
        <el-form-item label="旧密码">
          <el-input 
            v-model="changePasswordForm.oldPassword" 
            type="password"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input 
            v-model="changePasswordForm.newPassword" 
            type="password"
            show-password
            :prefix-icon="Key"
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input 
            v-model="changePasswordForm.confirmPassword" 
            type="password"
            show-password
            :prefix-icon="Key"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleChangePasswordDialogClose">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">
            <el-icon><Check /></el-icon>
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {errorHandler} from "../../utils/errorHandler.js";
import { userApi } from '../../api/user/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from "../../router/index.js";
import {
  User, UserFilled, Message, Phone, Star, 
  Wallet, Lock, Key, Edit, Check, Close,
  Plus, Promotion, Shop
} from '@element-plus/icons-vue'

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

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.content-wrapper {
  background-color: #f5f7fa;
  border-radius: 8px;
  min-height: calc(100vh - 180px);
  padding: 20px;
}

.info-card {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.user-avatar {
  background-color: #409EFF;
  margin-bottom: 16px;
}

.user-role {
  margin-top: 8px;
}

.balance-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-buttons {
  display: flex;
  gap: 12px;
}

.recharge-content {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.recharge-input {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-tag) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.recharge-dialog,
.password-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}
</style> 