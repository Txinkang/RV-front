import request from './config/request.js'

export const vehicleApi = {
    // 查看车辆信息
    checkVehicleList(data) {
        return request({
          url: '/admin/checkVehicleList',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: data
        })
    },
    // 修改车辆信息
    updateVehicle(data){
        return request({
            url: '/admin/updateVehicle',
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
            url: '/admin/maintenanceVehicle',
            method: 'post',
            data: data
        })
    },
    // 取消维护车辆信息
    vehicleMaintenanceCancel(data){
        return request({
            url: '/admin/vehicleMaintenanceCancel',
            method: 'post',
            data: data
        })
    },
    // 完成维护车辆信息
    vehicleMaintenanceComplete(data){
        return request({
            url: '/admin/vehicleMaintenanceComplete',
            method: 'post',
            data: data
        })
    },
    // 删除车辆信息
    deleteVehicle(data){
        return request({
            url: '/admin/deleteVehicle',
            method: 'delete',
            data: data
        })
    },
    // 确认归还车辆信息
    returnVehicle(data){
        return request({
            url: '/admin/returnVehicle',
            method: 'post',
            data: data
        })
    }
}