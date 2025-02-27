<template>
    <div class="login-container">
        <div class="login-box">
            <h2 class="login-title">登录页面</h2>
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="账号登录">
                    <el-form :model="accountLoginForm" label-width="80px">
                        <el-form-item label="账号">
                            <el-input
                            v-model="accountLoginForm.userName"
                            placeholder="请输入用户账号"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="密码">
                            <el-input
                            v-model="accountLoginForm.userPassword"
                            placeholder="请输入用户密码"
                            show-password
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label-position="left">
                            <el-button size="large" type="default" @click="resetAccountLoginForm">
                                重置
                            </el-button>
                            <el-button type="primary" size="large" @click="submitAccountLoginForm" :disabled="!accountLoginForm.userName || !accountLoginForm.userPassword">
                                登录
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
  <script setup>
  import {reactive} from "vue";
  import { useUserStore } from '../../store/user.js';
  import router from "../../router/index.js";
  import { errorHandler } from '../../utils/errorHandler.js';
  import userApi from '../../api/user.js';
  defineOptions({
    name: 'LoginView'
  })

  const userStore = useUserStore()

  // 账号登录
  const accountLoginForm = reactive({
    userName: "",
    userPassword: "",
  });
  const submitAccountLoginForm = async () => {
    try {
        if(!accountLoginForm.userName || !accountLoginForm.userPassword){
            errorHandler.showError('请输入账号和密码')
            return
        }
        const requestData = {
            adminAccount: accountLoginForm.userName,
            adminPassword: accountLoginForm.userPassword
        }
        console.log("账号登录请求数据：", requestData);
        const response = await userApi.login(requestData)
        if (response.code === 200) {
            // 存储用户信息到本地
            userStore.setUserInfo(response.data)
            router.replace("/booking-vehicle")
            console.log("账号登录成功,响应数据：", response);
        }else if(response.code === 405){
            errorHandler.showError('密码错误', response)
        }else if(response.code === 406){
            errorHandler.showError('账号不存在', response)
        }else{
            errorHandler.showError('未知错误,请重试', response)
        }
    } catch (err) {
      errorHandler.showError('登录错误', err)
    }
  }
  const resetAccountLoginForm = () => {
    accountLoginForm.userName = "";
    accountLoginForm.userPassword = "";
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url('/src/assets/a.png') no-repeat center center fixed;
    background-size: cover;
  }
  
  
  .login-box {
    width: 500px;
    padding: 40px 20px;
    background: #ffffff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  
  .login-title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }
  
  .el-input {
    font-size: 14px;
  }
  
  </style>
  