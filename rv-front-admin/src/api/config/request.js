import axios from 'axios'
import { ElMessageBox, ElLoading } from 'element-plus'
import router from "../../router/index.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { API_CONFIG } from './config.js';
// 创建 axios 实例
const request = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: true  // 允许跨域请求携带认证信息
})
let loadingInstance = null;


//=========================服务器请求========================================
// 请求拦截器
request.interceptors.request.use(
  config => {
    // 显示全屏加载动画
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    //获取 token
    const token = localStorage.getItem('user_token')
    const expiry = localStorage.getItem('token_expiry')
    if (token && expiry) {
      if (new Date().getTime() <= parseInt(expiry)) {
        // 确保 token 添加到请求头
        config.headers['Authorization'] = token
      } else {
        // 关闭加载动画
        loadingInstance?.close()
        handleTokenExpired()
      }
    }
    return config
  },
  error => {
    // 发生错误时关闭加载动画
    loadingInstance?.close()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 关闭加载动画
    loadingInstance?.close()

    const res = response.data
    // 处理401错误
    if(response.status === 401){
      handleTokenExpired()
    }
    if(response.status !== 200){
      errorHandler.showError('请求错误请重试', response)
    }
    return res
  },
  error => {
    // 发生错误时关闭加载动画
    loadingInstance?.close()

    if (error.response && error.response.status === 401) {
      handleTokenExpired()
    }
    return Promise.reject(error)
  }
)

// 处理 token 过期
const handleTokenExpired = () => {
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
}

export default request
