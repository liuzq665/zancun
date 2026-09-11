import request from '@/utils/request'

// 获取餐厅列表
export function getRestaurantList(params) {
  return request.get('/app/restaurant/list', { params })
}

// 获取餐厅详情
export function getRestaurantDetail(id) {
  return request.get('/app/restaurant/detail', { params: { id } })
}

// 获取推荐餐厅
export function getRecommendRestaurants(limit = 6) {
  return request.get('/app/restaurant/recommend', { params: { limit } })
}

// 获取餐厅菜品
export function getDishList(restaurantId) {
  return request.get('/app/restaurant/dish/list', { params: { restaurantId } })
}

// 获取菜品详情
export function getDishDetail(id) {
  return request.get('/app/restaurant/dish/detail', { params: { id } })
}

// 获取餐桌列表
export function getTableList(restaurantId) {
  return request.get('/app/restaurant/table/list', { params: { restaurantId } })
}

// 获取餐厅评价
export function getReviewList(restaurantId, page = 1, pageSize = 10) {
  return request.get('/app/restaurant/review/list', { params: { restaurantId, page, pageSize } })
}
