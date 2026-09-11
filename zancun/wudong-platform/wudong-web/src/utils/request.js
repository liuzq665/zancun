import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 管理后台接口走 admin_token，用户侧接口走 token
    // 管理端实际接口前缀为 /adminapi，页面路由 /admin 不会经过该请求实例。
    const isAdmin = (config.url || '').startsWith('/adminapi')
    const token = localStorage.getItem(isAdmin ? 'admin_token' : 'token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const handleAuthExpired = (isAdmin) => {
  if (isAdmin) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    if (router.currentRoute.value.path !== '/admin/login') {
      ElMessage.error('管理员登录已过期，请重新登录')
      router.push('/admin/login')
    }
    return
  }

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  if (router.currentRoute.value.path !== '/login') {
    ElMessage.error('登录已过期，请重新登录')
    router.push('/login')
  }
}

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0 && res.code !== undefined) {
      const isAdmin = (response.config.url || '').startsWith('/adminapi')
      const isAuthError = isAdmin
        ? res.code === 40101 || res.code === 401
        : res.code === 10101 || res.code === 401
      if (isAuthError) {
        handleAuthExpired(isAdmin)
      } else {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    const config = error.config || {}
    const isAdmin = (config.url || '').startsWith('/adminapi')
    const responseData = error.response?.data
    const responseCode = responseData?.code
    if (
      error.response?.status === 401 ||
      (isAdmin && responseCode === 40101) ||
      (!isAdmin && responseCode === 10101)
    ) {
      handleAuthExpired(isAdmin)
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
