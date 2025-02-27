import request from '../config/request.js'

export const vehicleApi = {
  // 搜索车辆
  checkVehicleList(data) {
    return request({
      url: '/user/checkVehicleList',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },
  // 预定车辆
  vehicleReservation(data) {
    return request({
      url: '/user/vehicleReservation',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },
  // 获取图片
  getVehicleImage(data) {
    return request({
      url: '/images/campgroundPictures',
      method: 'get',
      params: data
    })
  },
  // 获取已预约车辆
  checkBookedVehicle(data){
    return request({
      url: '/user/checkBookedVehicle',
      method: 'get',
      params: data
    })
  },
  // 取消车辆
  vehicleCancelReservation(data){
    return request({
      url: '/user/vehicleCancelReservation',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },
  // 更新位置
  uploadVehicleLocation(data){
    return request({
      url: '/user/uploadVehicleLocation',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  }
}