import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminLogin, getAdminInfo } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const admin = ref(null)
  const token = ref(localStorage.getItem('admin_token') || '')

  const isLoggedIn = ref(!!token.value)

  const login = async (username, password) => {
    try {
      const res = await adminLogin(username, password)
      if (res.code === 0) {
        token.value = res.data.token
        admin.value = res.data.admin
        isLoggedIn.value = true
        localStorage.setItem('admin_token', res.data.token)
        localStorage.setItem('admin_info', JSON.stringify(res.data.admin))
        return { success: true }
      }
      return { success: false, message: res.message || '登录失败' }
    } catch (error) {
      return { success: false, message: '登录失败，请检查网络' }
    }
  }

  const logout = () => {
    admin.value = null
    token.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }

  const fetchAdminInfo = async () => {
    if (!token.value) return
    try {
      const res = await getAdminInfo()
      if (res.code === 0) {
        admin.value = res.data
        localStorage.setItem('admin_info', JSON.stringify(res.data))
      }
    } catch (error) {
      console.error('Failed to fetch admin info:', error)
    }
  }

  // 初始化时恢复登录状态
  const initAdmin = () => {
    const savedAdmin = localStorage.getItem('admin_info')
    if (savedAdmin) {
      admin.value = JSON.parse(savedAdmin)
      isLoggedIn.value = true
    }
  }

  return {
    admin,
    token,
    isLoggedIn,
    login,
    logout,
    fetchAdminInfo,
    initAdmin,
  }
})
