import request from '../config/request.js'

export const vehicleApi = {
    // 上传车辆信息
    uploadVehicle(data){
        return request({
            url: '/business/uploadVehicle',
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: data
        })
    },
    // 查看车辆信息
    checkVehicleList(data){
        return request({
            url: '/business/checkVehicleList',
            method: 'get',
            params: data
        })
    },
    // 修改车辆信息
    updateVehicle(data){
        return request({
            url: '/business/updateVehicle',
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: data
        })
    },
    // 维护车辆信息
    maintenanceVehicle(data){
        return request({
            url: '/business/maintenanceVehicle',
            method: 'post',
            data: data
        })
    },
    // 取消维护车辆信息
    vehicleMaintenanceCancel(data){
        return request({
            url: '/business/vehicleMaintenanceCancel',
            method: 'post',
            data: data
        })
    },
    // 完成维护车辆信息
    vehicleMaintenanceComplete(data){
        return request({
            url: '/business/vehicleMaintenanceComplete',
            method: 'post',
            data: data
        })
    },
    // 删除车辆信息
    deleteVehicle(data){
        return request({
            url: '/business/deleteVehicle',
            method: 'delete',
            data: data
        })
    },
    // 确认归还车辆信息
    returnVehicle(data){
        return request({
            url: '/business/returnVehicle',
            method: 'post',
            data: data
        })
    }
}