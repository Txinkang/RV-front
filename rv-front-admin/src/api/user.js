import request from '../api/config/request.js'

export default {
    // 登录
    login (data) {
        return request({
            url: '/admin/login',
            method: 'post',
            data
        })
    },
    // 退出
    logout () {
        return request({
            url: '/admin/logout',
            method: 'get'
        })
    },
    // 数据分析
    dataAnalyze () {
        return request({
            url: '/admin/dataAnalyze',
            method: 'get'
        })
    }
}
