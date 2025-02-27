import request from '../config/request.js'

export const userApi = {
    // 账号登录
    loginAccount(data) {
        return request({
        url: '/user/loginAccount',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
        })
    },
    // 手机号登录
    loginPhoneNumber(data) {
        return request({
        url: '/user/loginPhoneNumber',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
        })
    },
    // 邮箱登录
    loginEmail(data) {
        return request({
        url: '/user/loginEmail',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
        })
    },
    // 获取验证码
    getCode(data) {
        return request({
        url: '/user/getCode',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
        })
    },
    // 登出
    logout() {
        return request({
        url: '/user/logout',
        method: 'get',
        })
    },
    // 注册
    register(data) {
        return request({
        url: '/user/register',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
        })
    },
    // 获取用户信息
    userInfo() {
        return request({
        url: '/user/userInfo',
        method: 'get',
        })
    },
    // 更新用户信息
    updateUserInfo(data) {
        return request({
        url: '/user/updateUserInfo',
        method: 'patch',
        data: data
        })
    },
    // 升级角色
    upgradeRole(data) {
        return request({
        url: '/user/upgradeRole',
        method: 'patch',
        data: data
        })
    },
    // 充值
    recharge(data) {
        return request({
        url: '/user/recharge',
        method: 'post',
        params: data
        })
    },
    // 修改密码
    updatePassword(data) {
        return request({
        url: '/user/updatePassword',
        method: 'patch',
        data: data
        })
    }
}