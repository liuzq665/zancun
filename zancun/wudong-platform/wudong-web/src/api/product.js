import request from '@/utils/request'

// 获取商品分类
export function getCategoryList() {
  return request.get('/app/product/category/list')
}

// 获取商品列表
export function getProductList(params) {
  return request.get('/app/product/list', { params })
}

// 获取商品详情
export function getProductDetail(id) {
  return request.get('/app/product/detail', { params: { id } })
}

// 获取推荐商品
export function getRecommendProducts(limit = 6) {
  return request.get('/app/product/recommend', { params: { limit } })
}
