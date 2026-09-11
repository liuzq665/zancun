import request from '@/utils/request'

// 管理员登录
export function adminLogin(username, password) {
  return request.post('/adminapi/login', { username, password })
}

// 获取管理员信息
export function getAdminInfo() {
  return request.get('/adminapi/info')
}

// 获取统计数据
export function getStatistics() {
  return request.get('/adminapi/statistics')
}

// 获取用户列表
export function getUserList(params) {
  return request.get('/adminapi/user/list', { params })
}

// 获取订单列表
export function getAdminOrderList(params) {
  return request.get('/adminapi/order/list', { params })
}

// 获取商品列表
export function getAdminProductList(params) {
  return request.get('/adminapi/product/list', { params })
}

// 创建/更新商品
export function saveProduct(data) {
  return request.post('/adminapi/product/save', data)
}

// 删除商品
export function deleteProduct(id) {
  return request.post('/adminapi/product/delete', { id })
}

// 获取餐厅列表
export function getAdminRestaurantList(params) {
  return request.get('/adminapi/restaurant/list', { params })
}

// 获取民宿列表
export function getAdminHotelList(params) {
  return request.get('/adminapi/hotel/list', { params })
}

// 获取路线列表
export function getAdminRouteList(params) {
  return request.get('/adminapi/route/list', { params })
}

// 获取帖子列表
export function getAdminPostList(params) {
  return request.get('/adminapi/post/list', { params })
}

// 获取配置
export function getConfigs() {
  return request.get('/adminapi/config/list')
}

// 更新配置
export function updateConfig(key, value) {
  return request.post('/adminapi/config', { key, value })
}

// ===== 业务数据写操作（module: hotel | restaurant | route | post）=====
export function saveBusiness(module, data) {
  return request.post('/adminapi/business/save', { module, ...data })
}

export function deleteBusiness(module, id) {
  return request.post('/adminapi/business/delete', { module, id })
}

// 用户封禁/解封
export function setUserStatus(id, status) {
  return request.post('/adminapi/user/status', { id, status })
}

// 订单处理（action: confirm | complete | cancel | refund）
export function processOrder(id, action) {
  return request.post('/adminapi/order/process', { id, action })
}

// 帖子设为/取消精华
export function setPostFeatured(id, isFeatured) {
  return request.post('/adminapi/post/featured', { id, isFeatured })
}

// 帖子上下架
export function setPostStatus(id, status) {
  return request.post('/adminapi/post/status', { id, status })
}
