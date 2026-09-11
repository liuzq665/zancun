import request from '@/utils/request'

// 获取购物车列表
export function getCartList() {
  return request.get('/app/cart/list')
}

// 添加到购物车
export function addToCart(data) {
  return request.post('/app/cart/add', data)
}

// 更新购物车商品数量（后端为 POST 风格，id 放 body）
export function updateCartItem(id, data) {
  return request.put('/app/cart/update', { id, ...data })
}

// 删除购物车商品
export function removeCartItem(id) {
  return request.post('/app/cart/remove', { id })
}

// 清空购物车
export function clearCart() {
  return request.post('/app/cart/clear')
}

// 全选/取消全选
export function selectAllCart(data) {
  return request.post('/app/cart/selectAll', data)
}
