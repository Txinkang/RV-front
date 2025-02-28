<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <el-icon class="logo-icon"><Key /></el-icon>
                <h2 class="login-title">欢迎登录</h2>
                <p class="login-subtitle">房车露营预订平台</p>
            </div>

            <el-tabs v-model="activeName" class="login-tabs">
                <el-tab-pane label="账号登录" name="account">
                    <el-form :model="accountLoginForm" class="login-form">
                        <el-form-item>
                            <el-input
                            v-model="accountLoginForm.userName"
                            :prefix-icon="User"
                            placeholder="请输入用户账号"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input
                            v-model="accountLoginForm.userPassword"
                            :prefix-icon="Lock"
                            placeholder="请输入用户密码"
                            show-password
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <div class="form-actions">
                            <el-button size="large" @click="resetAccountLoginForm">
                                <el-icon><Refresh /></el-icon>
                                重置
                            </el-button>
                            <el-button 
                            type="primary" 
                            size="large" 
                            @click="submitAccountLoginForm"
                            :disabled="!accountLoginForm.userName || !accountLoginForm.userPassword"
                            >
                                <el-icon><Right /></el-icon>
                                登录
                            </el-button>
                        </div>
                    </el-form>
                </el-tab-pane>

                <el-tab-pane label="手机号登录" name="phone">
                    <el-form :model="phoneLoginForm" class="login-form">
                        <el-form-item>
                            <el-input
                            v-model="phoneLoginForm.userPhoneNumber"
                            :prefix-icon="Phone"
                            placeholder="请输入用户手机号"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <div class="code-input-group">
                                <el-input
                                v-model="phoneLoginForm.code"
                                :prefix-icon="Message"
                                placeholder="请输入验证码"
                                clearable
                                size="large"
                                ></el-input>
                                <el-button 
                                type="primary" 
                                size="large" 
                                @click="getPhoneCode"
                                :disabled="phoneLoginForm.codeTime > 0"
                                >
                                    {{ phoneLoginForm.codeTime > 0 ? `${phoneLoginForm.codeTime}s` : '获取验证码' }}
                                </el-button>
                            </div>
                        </el-form-item>
                        <div class="form-actions">
                            <el-button size="large" @click="resetPhoneLoginForm">
                                <el-icon><Refresh /></el-icon>
                                重置
                            </el-button>
                            <el-button 
                            type="primary" 
                            size="large" 
                            @click="submitPhoneLoginForm"
                            :disabled="!phoneLoginForm.userPhoneNumber || !phoneLoginForm.code"
                            >
                                <el-icon><Right /></el-icon>
                                登录
                            </el-button>
                        </div>
                    </el-form>
                </el-tab-pane>

                <el-tab-pane label="邮箱登录" name="email">
                    <el-form :model="emailLoginForm" class="login-form">
                        <el-form-item>
                            <el-input
                            v-model="emailLoginForm.userEmail"
                            :prefix-icon="Message"
                            placeholder="请输入用户邮箱"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <div class="code-input-group">
                                <el-input
                                v-model="emailLoginForm.code"
                                :prefix-icon="Message"
                                placeholder="请输入验证码"
                                clearable
                                size="large"
                                ></el-input>
                                <el-button 
                                type="primary" 
                                size="large" 
                                @click="getEmailCode"
                                :disabled="emailLoginForm.codeTime > 0"
                                >
                                    {{ emailLoginForm.codeTime > 0 ? `${emailLoginForm.codeTime}s` : '获取验证码' }}
                                </el-button>
                            </div>
                        </el-form-item>
                        <div class="form-actions">
                            <el-button size="large" @click="resetEmailLoginForm">
                                <el-icon><Refresh /></el-icon>
                                重置
                            </el-button>
                            <el-button 
                            type="primary" 
                            size="large" 
                            @click="submitEmailLoginForm"
                            :disabled="!emailLoginForm.userEmail || !emailLoginForm.code"
                            >
                                <el-icon><Right /></el-icon>
                                登录
                            </el-button>
                        </div>
                    </el-form>
                </el-tab-pane>

                <el-tab-pane label="注册账号" name="register">
                    <el-form :model="registerForm" class="login-form">
                        <el-form-item>
                            <el-input
                            v-model="registerForm.userName"
                            :prefix-icon="User"
                            placeholder="请输入用户账号"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input
                            v-model="registerForm.userPassword"
                            :prefix-icon="Lock"
                            placeholder="请输入用户密码"
                            show-password
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input
                            v-model="registerForm.userPhoneNumber"
                            :prefix-icon="Phone"
                            placeholder="请输入用户手机号"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input
                            v-model="registerForm.userEmail"
                            :prefix-icon="Message"
                            placeholder="请输入用户邮箱"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <div class="form-actions">
                            <el-button size="large" @click="resetRegisterForm">
                                <el-icon><Refresh /></el-icon>
                                重置
                            </el-button>
                            <el-button type="primary" size="large" @click="submitRegisterForm">
                                <el-icon><Check /></el-icon>
                                注册
                            </el-button>
                        </div>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
  <script setup>
  import {ref, reactive} from "vue";
  import { useUserStore } from '../../store/user.js';
  import router from "../../router/index.js";
  import { errorHandler } from '../../utils/errorHandler.js';
  import { userApi } from '../../api/user/user.js';
  import { ElMessage } from 'element-plus';
  import {
    Key, User, Lock, Phone, Message,
    Refresh, Right, Check
  } from '@element-plus/icons-vue'

  const userStore = useUserStore()

  const activeName = ref('account')

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
            userName: accountLoginForm.userName,
            userPassword: accountLoginForm.userPassword
        }
        console.log("账号登录请求数据：", requestData);
        const response = await userApi.loginAccount(requestData)
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
  // 手机号登录
  const phoneLoginForm = reactive({
    userPhoneNumber: null,
    code: null,
    codeTime: 0,
  });
  const getPhoneCode = async () => {
    try {
        if(!phoneLoginForm.userPhoneNumber){
            ElMessage.warning('请输入手机号')
            return
        }
        if(phoneLoginForm.codeTime > 0){
            ElMessage.warning('请稍后再试')
            return
        }
        const requestData = {
            userPhoneNumber: phoneLoginForm.userPhoneNumber,
            userEmail:"",
        }
        console.log("获取验证码请求数据：", requestData);
        const response = await userApi.getCode(requestData)
        if(response.code === 200){
            ElMessage.success("获取验证码成功")
            console.log("获取验证码响应数据：", response);
            phoneLoginForm.code = response.data
            phoneLoginForm.codeTime = 60
            // 每秒减少1秒
            const interval = setInterval(() => {
                phoneLoginForm.codeTime--
                if(phoneLoginForm.codeTime <= 0){
                    clearInterval(interval)
                }
            }, 1000)
        }else if(response.code === 406){
            errorHandler.showError('手机号未注册', response)
        }else{
            errorHandler.showError('获取验证码失败', response)
        }
    } catch (err) {
      errorHandler.showError('获取验证码错误', err)
    }
  }
  const submitPhoneLoginForm = async () => {
    try {
        if(!phoneLoginForm.userPhoneNumber || !phoneLoginForm.code){
            errorHandler.showError('请输入手机号和验证码')
            return
        }
        const requestData = {
            userPhoneNumber: phoneLoginForm.userPhoneNumber,
            code: phoneLoginForm.code
        }
        console.log("手机号登录请求数据：", requestData);
        const response = await userApi.loginPhoneNumber(requestData)
        if (response.code === 200) {
            // 存储用户信息到本地
            userStore.setUserInfo(response.data)
            router.replace("/booking-vehicle")
            console.log("手机号登录成功,响应数据：", response);
        }else{
            errorHandler.showError('未知错误,请重试', response)
        }
    } catch (err) {
      errorHandler.showError('登录错误', err)
    }
  }
  const resetPhoneLoginForm = () => {
    phoneLoginForm.userPhoneNumber = null;
    phoneLoginForm.code = null;
  }

  // 邮箱登录
  const emailLoginForm = reactive({
    userEmail: null,
    code: null,
    codeTime: 0,
  });
  const getEmailCode = async () => {
    try {
        if(!emailLoginForm.userEmail){
            ElMessage.warning('请输入邮箱')
            return
        }
        if(emailLoginForm.codeTime > 0){
            ElMessage.warning('请稍后再试')
            return
        }
        const requestData = {
            userEmail: emailLoginForm.userEmail,
            userPhoneNumber:"",
        }
        console.log("获取邮箱验证码请求数据：", requestData);
        const response = await userApi.getCode(requestData)
        if(response.code === 200){
            ElMessage.success("获取邮箱验证码成功")
            console.log("获取邮箱验证码响应数据：", response);
            emailLoginForm.code = response.data
            emailLoginForm.codeTime = 60
            // 每秒减少1秒
            const interval = setInterval(() => {
                emailLoginForm.codeTime--
                if(emailLoginForm.codeTime <= 0){
                    clearInterval(interval)
                }
            }, 1000)
        }else if(response.code === 406){
            errorHandler.showError('邮箱未注册', response)
        }else{
            errorHandler.showError('获取邮箱验证码失败', response)
        }
    } catch (err) {
      errorHandler.showError('获取邮箱验证码错误', err)
    }
  }
  const submitEmailLoginForm = async () => {
    try {
        if(!emailLoginForm.userEmail || !emailLoginForm.code){
            errorHandler.showError('请输入邮箱和验证码')
            return
        }
        const requestData = {
            userEmail: emailLoginForm.userEmail,
            code: emailLoginForm.code
        }
        console.log("邮箱登录请求数据：", requestData);
        const response = await userApi.loginEmail(requestData)
        if (response.code === 200) {
            // 存储用户信息到本地
            userStore.setUserInfo(response.data)
            router.replace("/booking-vehicle")
            console.log("邮箱登录成功,响应数据：", response);
        }else{
            errorHandler.showError('未知错误,请重试', response)
        }
    } catch (err) {
      errorHandler.showError('邮箱登录错误', err)
    }
  }
  const resetEmailLoginForm = () => {
    emailLoginForm.userEmail = null;
    emailLoginForm.code = null;
  }

  // 注册账号
  const registerForm = reactive({
    userName: '',
    userPassword: '',
    userPhoneNumber: '',
    userEmail: '',
  });
  const submitRegisterForm = async () => {
    try {
        const requestData = {
            userName: registerForm.userName,
            userPassword: registerForm.userPassword,
            userPhoneNumber: registerForm.userPhoneNumber,
            userEmail: registerForm.userEmail,
        }
        console.log("注册账号请求数据：", requestData);
        const response = await userApi.register(requestData)
        if(response.code === 200){
            ElMessage.success("注册账号成功")
            console.log("注册账号响应数据：", response);
        }else if(response.code === 402){
            errorHandler.showError('账号已被注册', response)
        }else if(response.code === 403){
            errorHandler.showError('手机号已被注册', response)
        }else if(response.code === 404){
            errorHandler.showError('邮箱已被注册', response)
        }else{
            errorHandler.showError('注册账号失败', response)
        }
    } catch (err) {
      errorHandler.showError('注册账号错误', err)
    }
  }
  const resetRegisterForm = () => {
    registerForm.userName = '';
    registerForm.userPassword = '';
    registerForm.userPhoneNumber = '';
    registerForm.userEmail = '';
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: url('/src/assets/image.jpg') no-repeat center center fixed;
    background-size: cover;
    position: relative;
  }
  
  .login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
  
  .login-box {
    position: relative;
    width: 460px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .logo-icon {
    font-size: 48px;
    color: #409EFF;
    margin-bottom: 16px;
  }
  
  .login-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }
  
  .login-subtitle {
    font-size: 16px;
    color: #909399;
    margin: 0;
  }
  
  .login-tabs {
    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }
  
    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px;
    }
  }
  
  .login-form {
    margin-top: 20px;
  }
  
  .code-input-group {
    display: flex;
    gap: 12px;
  
    .el-input {
      flex: 1;
    }
  
    .el-button {
      width: 120px;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    gap: 12px;
  }
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
  
    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
  
    &.is-focus {
      box-shadow: 0 0 0 1px #409EFF inset;
    }
  }
  
  :deep(.el-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 500;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 16px;
    color: #606266;
  
    &.is-active {
      font-weight: 600;
    }
  }
  </style>
  