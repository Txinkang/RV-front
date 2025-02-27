import request from '../api/config/request.js'

export const auditApi = {
    // 获取营地列表
    getAuditCampgroundList(){
        return request({
            url: '/admin/getAuditCampgroundList',
            method: 'get',
        })
    },
    // 通过
    auditCampground(data){
        return request({
            url: '/admin/auditCampground',
            method: 'post',
            data: data
        })
    },
    // 获取车辆列表
    getAuditVehicleList(){
        return request({
            url: '/admin/getAuditVehicleList',
            method: 'get',
        })
    },
    // 通过
    auditVehicle(data){
        return request({
            url: '/admin/auditVehicle',
            method: 'post',
            data: data
        })
    }
    
}