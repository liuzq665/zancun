import request from '@/utils/request'

// 获取民宿列表
export function getHotelList(params) {
  return request.get('/app/hotel/list', { params })
}

// 获取民宿详情
export function getHotelDetail(id) {
  return request.get('/app/hotel/detail', { params: { id } })
}

// 获取推荐民宿
export function getRecommendHotels(limit = 6) {
  return request.get('/app/hotel/recommend', { params: { limit } })
}

// 获取房间列表
export function getRoomList(hotelId) {
  return request.get('/app/hotel/room/list', { params: { hotelId } })
}

// 获取房间详情
export function getRoomDetail(id) {
  return request.get('/app/hotel/room/detail', { params: { id } })
}

// 检查房间可用性
export function checkRoomAvailability(roomId, checkIn, checkOut) {
  return request.get('/app/hotel/room/check', { params: { roomId, checkIn, checkOut } })
}

// 获取民宿评价
export function getReviewList(hotelId, page = 1, pageSize = 10) {
  return request.get('/app/hotel/review/list', { params: { hotelId, page, pageSize } })
}
