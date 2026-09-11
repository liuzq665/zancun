<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { useAdminStore } from './stores/admin'

const userStore = useUserStore()
const adminStore = useAdminStore()

onMounted(() => {
  // 初始化用户状态
  userStore.initUser()
  // 初始化管理员状态
  adminStore.initAdmin()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background: var(--bg-color);
}
</style>
