import request from '@/utils/request'

// 用户登录
export function login(phone, password) {
  return request.post('/app/user/login', { phone, password })
}

// 用户注册
export function register(phone, password, nickname) {
  return request.post('/app/user/register', { phone, password, nickname })
}

// 获取用户信息
export function getUserInfo() {
  return request.get('/app/user/info')
}

// 更新用户资料
export function updateProfile(data) {
  return request.put('/app/user/profile', data)
}

// 修改密码
export function changePassword(data) {
  return request.put('/app/user/password', data)
}

// 我的收藏（type: product | hotel | restaurant）
export function getFavorites(type = 'product') {
  return request.get('/app/user/favorites', { params: { type } })
}
