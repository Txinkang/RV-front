import request from '../config/request.js'

export const payApi = {
    // 支付
    payment(data){
        return request({
            url: '/user/payment',
            method: 'post',
            data: data
        })
    },
    // 退款
    refund(data){
        return request({
            url: '/user/refund',
            method: 'post',
            data: data
        })
    },
    // 订单
    checkOrder(data){
        return request({
            url: '/user/checkOrder',
            method: 'get',
            data: data
        })
    },
    // 开具发票
    generateInvoice(data){
        return request({
            url: '/user/generateInvoice',
            method: 'post',
            data: data
        })
    },
    // 查看发票
    checkInvoice(data){
        return request({
            url: '/user/checkInvoice',
            method: 'post',
            data: data
        })
    }
}