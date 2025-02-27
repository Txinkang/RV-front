import request from '../config/request.js'

export const campApi = {
    // 上传营地
    uploadCampground(data){
        return request({
            url: '/business/uploadCampground',
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: data
        })
    },
    // 查看营地信息
    checkCampgroundList(data){
        return request({
            url: '/business/checkCampgroundList',
            method: 'get',
            params: data
        })
    },
    // 修改营地信息
    updateCampground(data){
        return request({
            url: '/business/updateCampground',
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: data
        })
    },
    // 维护营地信息
    maintenanceCampground(data){
        return request({
            url: '/business/maintenanceCampground',
            method: 'post',
            data: data
        })
    },
    // 取消维护营地信息
    campMaintenanceCancel(data){
        return request({
            url: '/business/campMaintenanceCancel',
            method: 'post',
            data: data
        })
    },
    // 完成营地维护信息
    campMaintenanceComplete(data){
        return request({
            url: '/business/campMaintenanceComplete',
            method: 'post',
            data: data
        })
    },
    // 删除营地信息
    deleteCampground(data){
        return request({
            url: '/business/deleteCampground',
            method: 'delete',
            data: data
        })
    }
}