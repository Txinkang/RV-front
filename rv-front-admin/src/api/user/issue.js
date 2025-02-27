import request from '../config/request'

export default {
    // 查看使用问题
    questionsInfo(data){
        return request({
            url: '/user/questionsInfo',
            method: 'get',
            data: data
        })
    },
    // 提交使用问题
    askQuestions(data){
        return request({
            url: '/user/askQuestions',
            method: 'post',
            data: data
        })
    },
    // 反馈
    feedback(data){
        return request({
            url: '/user/feedback',
            method: 'post',
            data: data
        })
    }
}