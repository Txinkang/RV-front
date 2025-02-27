import request from '../config/request.js'

export const campApi = {
    // 获取营地列表
    checkCampgroundList(data){
        return request({
            url: '/user/checkCampgroundList',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        })
    },
    // 营地预约
    campgroundReservation(data){
        return request({
            url: '/user/campgroundReservation',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        })
    },
    // 获取已预约营地
    checkBookedCampground(data){
        return request({
            url: '/user/checkBookedCampground',
            method: 'get',
            params: data
        })
    },
    // 取消营地
    campgroundCancelReservation(data){
        return request({
            url: '/user/campgroundCancelReservation',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        })
    }
}