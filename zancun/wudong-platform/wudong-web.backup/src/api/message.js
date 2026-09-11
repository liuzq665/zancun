import request from '@/utils/request'

// 站内消息列表（返回 { list, unread, pagination }）
export function getMessageList(page = 1, pageSize = 10) {
  return request.get('/app/message/list', { params: { page, pageSize } })
}

// 未读数（铃铛角标）
export function getUnreadCount() {
  return request.get('/app/message/unread')
}

// 标记单条已读
export function readMessage(id) {
  return request.put('/app/message/read', null, { params: { id } })
}

// 全部标记已读
export function readAllMessages() {
  return request.put('/app/message/readAll')
}
