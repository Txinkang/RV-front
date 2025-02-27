import request from '../api/config/request.js'

export const campApi = {
    // 获取营地列表
    checkCampgroundList(data){
        return request({
            url: '/admin/checkCampgroundList',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        })
    },
    // 修改营地信息
    updateCampground(data){
        return request({
            url: '/admin/updateCampground',
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
            url: '/admin/maintenanceCampground',
            method: 'post',
            data: data
        })
    },
    // 取消维护营地信息
    campMaintenanceCancel(data){
        return request({
            url: '/admin/campMaintenanceCancel',
            method: 'post',
            data: data
        })
    },
    // 完成营地维护信息
    campMaintenanceComplete(data){
        return request({
            url: '/admin/campMaintenanceComplete',
            method: 'post',
            data: data
        })
    },
    // 删除营地信息
    deleteCampground(data){
        return request({
            url: '/admin/deleteCampground',
            method: 'delete',
            data: data
        })
    }
}