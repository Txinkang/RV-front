import request from '../config/request'

export default {
    // 查看使用问题
    questionsInfo(){
        return request({
            url: '/admin/questionsInfo',
            method: 'get',
        })
    },
    // 提交使用问题
    answer(data){
        return request({
            url: '/admin/answer',
            method: 'post',
            data: data
        })
    },
    // 反馈
    getFeedback(){
        return request({
            url: '/admin/getFeedback',
            method: 'get',
        })
    }
}