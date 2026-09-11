<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🌾</div>
          <div class="logo-text">
            <h2>乌东文旅</h2>
            <p>管理后台</p>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </router-link>
        <router-link to="/admin/products" class="nav-item" :class="{ active: route.path.startsWith('/admin/products') }">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </router-link>
        <router-link to="/admin/restaurants" class="nav-item" :class="{ active: route.path.startsWith('/admin/restaurants') }">
          <el-icon><Food /></el-icon>
          <span>餐厅管理</span>
        </router-link>
        <router-link to="/admin/hotels" class="nav-item" :class="{ active: route.path.startsWith('/admin/hotels') }">
          <el-icon><House /></el-icon>
          <span>民宿管理</span>
        </router-link>
        <router-link to="/admin/tickets" class="nav-item" :class="{ active: route.path.startsWith('/admin/tickets') }">
          <el-icon><Ticket /></el-icon>
          <span>路线管理</span>
        </router-link>
        <router-link to="/admin/orders" class="nav-item" :class="{ active: route.path.startsWith('/admin/orders') }">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </router-link>
        <router-link to="/admin/community" class="nav-item" :class="{ active: route.path.startsWith('/admin/community') }">
          <el-icon><ChatDotRound /></el-icon>
          <span>社区管理</span>
        </router-link>
        <router-link to="/admin/users" class="nav-item" :class="{ active: route.path.startsWith('/admin/users') }">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/settings" class="nav-item" :class="{ active: route.path.startsWith('/admin/settings') }">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容 -->
    <div class="admin-main">
      <!-- 顶部导航 -->
      <header class="admin-header">
        <div class="header-left">
          <el-icon class="toggle-btn" @click="isCollapse = !isCollapse"><Fold /></el-icon>
          <span class="breadcrumb">{{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="admin-user">
              <el-avatar :size="32" class="admin-avatar">{{ adminStore.admin?.username?.slice(0, 1) || '管' }}</el-avatar>
              <span>{{ adminStore.admin?.username || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Goods, Food, House, Ticket, Document, ChatDotRound, User, Setting, Fold } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const isCollapse = ref(false)

const currentTitle = computed(() => {
  const map = {
    '/admin': '数据概览',
    '/admin/products': '商品管理',
    '/admin/restaurants': '餐厅管理',
    '/admin/hotels': '民宿管理',
    '/admin/tickets': '路线管理',
    '/admin/orders': '订单管理',
    '/admin/community': '社区管理',
    '/admin/users': '用户管理',
    '/admin/settings': '系统设置',
  }
  return map[route.path] || '管理后台'
})

const handleCommand = (command) => {
  if (command === 'logout') {
    adminStore.logout()
    router.push('/admin/login')
    ElMessage.success('已退出登录')
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1a365d 0%, #2d1b69 100%);
  color: #bfcbd9;
  transition: width 0.3s;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;

  &.collapse {
    width: 64px;
  }

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo {
      display: flex;
      align-items: center;
      gap: 14px;

      .logo-icon {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #d4af37, #f4e4a6);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
      }

      .logo-text {
        h2 {
          font-size: 18px;
          color: #fff;
          margin-bottom: 4px;
          font-weight: 600;
        }

        p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }

  .sidebar-nav {
    padding: 16px 0;
    flex: 1;
    overflow-y: auto;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 24px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.3s;
      cursor: pointer;
      border-left: 3px solid transparent;

      .el-icon {
        font-size: 20px;
      }

      span {
        font-size: 14px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }

      &.active {
        background: rgba(212, 175, 55, 0.15);
        color: #d4af37;
        border-left-color: #d4af37;

        .el-icon {
          color: #d4af37;
        }
      }
    }
  }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  margin-left: 260px;
  min-height: 100vh;
}

.admin-header {
  height: 64px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  border-bottom: 1px solid rgba(26, 54, 93, 0.08);
  box-shadow: 0 2px 12px rgba(26, 54, 93, 0.06);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .toggle-btn {
      font-size: 22px;
      cursor: pointer;
      color: var(--text-light);
      transition: color 0.3s;

      &:hover {
        color: var(--primary-color);
      }
    }

    .breadcrumb {
      font-size: 15px;
      color: var(--text-color);
      font-weight: 500;
    }
  }

  .header-right {
    .admin-user {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 24px;
      transition: background 0.3s;

      .admin-avatar {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }

      &:hover {
        background: var(--bg-light);
      }
    }
  }
}

.admin-content {
  flex: 1;
  padding: 28px;
  overflow: auto;
}
</style>
