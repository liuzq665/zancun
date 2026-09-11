import request from '@/utils/request'

// 获取景区列表
export function getScenicList(params) {
  return request.get('/app/ticket/scenic/list', { params })
}

// 获取景区详情
export function getScenicDetail(id) {
  return request.get('/app/ticket/scenic/detail', { params: { id } })
}

// 获取路线列表
export function getRouteList(params) {
  return request.get('/app/ticket/route/list', { params })
}

// 获取路线详情
export function getRouteDetail(id) {
  return request.get('/app/ticket/route/detail', { params: { id } })
}

// 获取推荐路线
export function getRecommendRoutes(limit = 6) {
  return request.get('/app/ticket/route/recommend', { params: { limit } })
}

// 创建订单
export function createOrder(data) {
  return request.post('/app/ticket/order', data)
}

// 后端订单是「单个资源 + 整型状态码」，视图需要字符串状态和 items 列表。
// 后端无订单明细表（base_order_item 未落地），故由订单本身合成单条明细。
const ORDER_STATUS_TEXT = { 0: 'cancelled', 1: 'pending', 2: 'paid', 3: 'completed', 4: 'refunded' }

export function normalizeOrder(o) {
  if (!o) return o
  return {
    ...o,
    status: ORDER_STATUS_TEXT[o.orderStatus] ?? String(o.orderStatus),
    totalAmount: o.totalPrice,
    travelDate: o.bookDate,
    count: o.quantity,
    items: [
      {
        id: o.id,
        name: o.relatedName || '乌东文旅订单',
        image: null,
        description: '',
        date: o.bookDate,
        count: o.quantity,
      },
    ],
  }
}

// 获取订单列表
export async function getOrderList(userId, orderType, page = 1, pageSize = 10) {
  const res = await request.get('/app/ticket/order/list', { params: { userId, orderType, page, pageSize } })
  if (res.code === 0 && res.data?.list) {
    res.data.list = res.data.list.map(normalizeOrder)
  }
  return res
}

// 获取订单详情
export async function getOrderDetail(id, userId) {
  const res = await request.get('/app/ticket/order/detail', { params: { id, userId } })
  if (res.code === 0 && res.data) {
    res.data = normalizeOrder(res.data)
  }
  return res
}

// 取消订单
export function cancelOrder(id, userId, reason) {
  return request.post('/app/ticket/order/cancel', { id, userId, reason })
}

// 支付订单
export function payOrder(id, userId, payMethod) {
  return request.post('/app/ticket/order/pay', { id, userId, payMethod })
}

// 申请退款
export function refundOrder(id, userId) {
  return request.post('/app/ticket/order/refund', { id, userId })
}
