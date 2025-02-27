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
                <el-tab-pane label="手机号登录">
                    <el-form :model="phoneLoginForm" label-width="80px">
                        <el-form-item label="手机号">
                            <el-input
                            v-model="phoneLoginForm.userPhoneNumber"
                            placeholder="请输入用户手机号"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="验证码">
                            <el-input
                            v-model="phoneLoginForm.code"
                            placeholder="请输入验证码"
                            clearable
                            size="large"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label-position="left">
                            <el-button size="large" type="default" @click="resetPhoneLoginForm">
                                重置
                            </el-button>
                            <el-button type="primary" size="large" @click="submitPhoneLoginForm" :disabled="!phoneLoginForm.userPhoneNumber || !phoneLoginForm.code">
                                登录
                            </el-button>
                            <el-button type="primary" size="large" @click="getPhoneCode" :disabled="phoneLoginForm.codeTime > 0">
                                获取验证码
                            </el-button>
                            <span class="code-time">{{ phoneLoginForm.codeTime }}秒</span>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="邮箱登录">
                    <el-form :model="emailLoginForm" label-width="80px">
                        <el-form-item label="邮箱">
                            <el-input v-model="emailLoginForm.userEmail" placeholder="请输入用户邮箱" clearable size="large"></el-input>
                        </el-form-item>
                        <el-form-item label="验证码">
                            <el-input v-model="emailLoginForm.code" placeholder="请输入验证码" clearable size="large"></el-input>
                        </el-form-item>
                        <el-form-item label-position="left">
                            <el-button size="large" type="default" @click="resetEmailLoginForm">
                                重置
                            </el-button>
                            <el-button type="primary" size="large" @click="submitEmailLoginForm" :disabled="!emailLoginForm.userEmail || !emailLoginForm.code">
                                登录
                            </el-button>
                            <el-button type="primary" size="large" @click="getEmailCode" :disabled="emailLoginForm.codeTime > 0">
                                获取验证码
                            </el-button>
                            <span class="code-time">{{ emailLoginForm.codeTime }}秒</span>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="注册账号">
                    <el-form :model="registerForm" label-width="100px">
                        <el-form-item label="用户账号">
                            <el-input v-model="registerForm.userName" placeholder="请输入用户账号" clearable size="large"></el-input>
                        </el-form-item>
                        <el-form-item label="用户密码">
                            <el-input v-model="registerForm.userPassword" placeholder="请输入用户密码" show-password clearable size="large"></el-input>
                        </el-form-item>
                        <el-form-item label="用户手机号">
                            <el-input v-model="registerForm.userPhoneNumber" placeholder="请输入用户手机号" clearable size="large"></el-input>
                        </el-form-item>
                        <el-form-item label="用户邮箱">
                            <el-input v-model="registerForm.userEmail" placeholder="请输入用户邮箱" clearable size="large"></el-input>
                        </el-form-item>
                        <el-form-item label-position="left">
                            <el-button size="large" type="default" @click="resetRegisterForm">
                                重置
                            </el-button>
                            <el-button type="primary" size="large" @click="submitRegisterForm">
                                注册
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
  import { userApi } from '../../api/user/user.js';
  import { ElMessage } from 'element-plus';
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
            errorHandler.showError('请输入手机号')
            return
        }
        if(phoneLoginForm.codeTime > 0){
            errorHandler.showError('请稍后再试')
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
            errorHandler.showError('请输入邮箱')
            return
        }
        if(emailLoginForm.codeTime > 0){
            errorHandler.showError('请稍后再试')
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
  