import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getUserInfo, updateProfile } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  async function loginAction(phone, password) {
    try {
      const res = await login(phone, password)
      if (res.code === 0) {
        token.value = res.data.token
        user.value = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function registerAction(phone, password, nickname) {
    try {
      const res = await register(phone, password, nickname)
      if (res.code === 0) {
        // 注册后自动登录
        return loginAction(phone, password)
      }
      return false
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await getUserInfo()
      if (res.code === 0) {
        user.value = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
      }
    } catch (error) {
      console.error('Fetch user info error:', error)
    }
  }

  async function updateProfileAction(data) {
    try {
      const res = await updateProfile(data)
      if (res.code === 0) {
        await fetchUserInfo()
        return true
      }
      return false
    } catch (error) {
      console.error('Update profile error:', error)
      return false
    }
  }

  function initUser() {
    // 从 localStorage 恢复用户状态
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken) token.value = savedToken
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        user.value = null
      }
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isLoggedIn,
    loginAction,
    registerAction,
    fetchUserInfo,
    updateProfileAction,
    logout,
    initUser,
  }
})
