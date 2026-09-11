<template>
  <div class="main-layout">
    <!-- 顶部导航 - 苗族风格 -->
    <header class="header">
      <!-- 苗族装饰纹样顶部 -->
      <div class="miao-pattern-top"></div>

      <div class="header-content container">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <!-- 苗族银饰风格图标 -->
            <svg viewBox="0 0 50 50" class="logo-svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#d4af37"/>
                  <stop offset="100%" style="stop-color:#b8860b"/>
                </linearGradient>
              </defs>
              <!-- 苗族银饰蝴蝶纹样 -->
              <path d="M25 8 C15 8 10 18 10 25 C10 32 15 38 25 42 C35 38 40 32 40 25 C40 18 35 8 25 8"
                    fill="none" stroke="url(#logoGrad)" stroke-width="2"/>
              <circle cx="25" cy="25" r="6" fill="url(#logoGrad)"/>
              <path d="M25 15 L25 35 M15 25 L35 25" stroke="url(#logoGrad)" stroke-width="1.5"/>
              <circle cx="18" cy="18" r="2" fill="url(#logoGrad)"/>
              <circle cx="32" cy="18" r="2" fill="url(#logoGrad)"/>
              <circle cx="18" cy="32" r="2" fill="url(#logoGrad)"/>
              <circle cx="32" cy="32" r="2" fill="url(#logoGrad)"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">乌东文旅</span>
            <span class="logo-subtitle">苗寨风情 · 非遗传承</span>
          </div>
        </router-link>

        <nav class="nav">
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' || $route.path === '/home' }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2L2 12h3v9h6v-6h2v6h6v-9h3L12 2z"/>
              </svg>
            </span>
            <span class="nav-text">首页</span>
          </router-link>
          <router-link to="/products" class="nav-item" :class="{ active: $route.path.startsWith('/products') }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </span>
            <span class="nav-text">非遗好物</span>
          </router-link>
          <router-link to="/restaurants" class="nav-item" :class="{ active: $route.path.startsWith('/restaurants') }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
              </svg>
            </span>
            <span class="nav-text">苗家风味</span>
          </router-link>
          <router-link to="/hotels" class="nav-item" :class="{ active: $route.path.startsWith('/hotels') }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
              </svg>
            </span>
            <span class="nav-text">吊脚楼宿</span>
          </router-link>
          <router-link to="/tickets" class="nav-item" :class="{ active: $route.path.startsWith('/tickets') }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/>
              </svg>
            </span>
            <span class="nav-text">山水胜境</span>
          </router-link>
          <router-link to="/community" class="nav-item" :class="{ active: $route.path.startsWith('/community') }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </span>
            <span class="nav-text">人文纪行</span>
          </router-link>

          <a
            class="nav-item nav-item-external"
            :href="guideUrl"
            target="_blank"
            rel="noopener"
            title="在新标签页打开 AI 向导"
            @click="openGuide"
          >
            <span class="nav-icon">
              <el-icon :size="20"><MagicStick /></el-icon>
            </span>
            <span class="nav-text">AI 向导</span>
          </a>
        </nav>

        <div class="header-actions">
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索非遗好物..."
              size="default"
              @keyup.enter="handleSearch"
              class="miao-search"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <template v-if="userStore.isLoggedIn">
            <el-popover
              placement="bottom-end"
              :width="340"
              trigger="click"
              popper-class="notice-popover"
              @show="loadMessages"
            >
              <template #reference>
                <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="header-badge">
                  <el-button circle class="miao-btn">
                    <el-icon><Bell /></el-icon>
                  </el-button>
                </el-badge>
              </template>

              <div class="notice-panel">
                <div class="notice-header">
                  <span>通知中心</span>
                  <el-button
                    v-if="unreadCount > 0"
                    link
                    type="primary"
                    size="small"
                    @click="handleReadAll"
                  >
                    全部已读
                  </el-button>
                </div>

                <div v-if="messages.length === 0" class="notice-empty">暂无通知</div>

                <div v-else class="notice-list">
                  <div
                    v-for="m in messages"
                    :key="m.id"
                    class="notice-item"
                    :class="{ unread: !m.isRead }"
                    @click="handleReadMessage(m)"
                  >
                    <div class="notice-title">
                      <span class="dot" v-if="!m.isRead"></span>
                      {{ m.title || '通知' }}
                    </div>
                    <div class="notice-content">{{ m.content }}</div>
                  </div>
                </div>
              </div>
            </el-popover>

            <el-dropdown trigger="click" class="user-dropdown">
              <span class="user-info">
                <el-avatar :size="36" :src="userStore.user?.avatar" class="miao-avatar">
                  {{ userStore.user?.nickname?.slice(0, 1) || '游' }}
                </el-avatar>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="miao-dropdown">
                  <div class="dropdown-user-info">
                    <el-avatar :size="48" :src="userStore.user?.avatar" class="miao-avatar-lg">{{ userStore.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
                    <div class="dropdown-user-detail">
                      <span class="dropdown-username">{{ userStore.user?.nickname || '游客' }}</span>
                      <span class="dropdown-userphone">{{ userStore.user?.phone || '' }}</span>
                    </div>
                  </div>
                  <el-dropdown-item divided @click="$router.push('/user')">
                    <el-icon><User /></el-icon> 个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/orders')">
                    <el-icon><List /></el-icon> 我的订单
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/cart')">
                    <el-icon><ShoppingCart /></el-icon> 购物车
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/admin')" v-if="userStore.user?.role === 'admin'">
                    <el-icon><Setting /></el-icon> 管理后台
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')" class="login-btn">
              <el-icon><User /></el-icon>
              登录
            </el-button>
          </template>
        </div>
      </div>

      <!-- 苗族装饰纹样底部 -->
      <div class="miao-pattern-bottom">
        <div class="pattern-line"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="brand-logo">
                <img src="https://images.pexels.com/photos/36709521/pexels-photo-36709521.jpeg?auto=compress&cs=tinysrgb&w=800" alt="乌东文旅" />
              </div>
              <h3>乌东文旅</h3>
              <p>传承千年苗寨文化<br/>体验独特民族风情</p>
              <div class="social-links">
                <a href="#" class="social-link">
                  <el-icon><ChatDotRound /></el-icon>
                </a>
                <a href="#" class="social-link">
                  <el-icon><Message /></el-icon>
                </a>
                <a href="#" class="social-link">
                  <el-icon><Share /></el-icon>
                </a>
              </div>
            </div>
            <div class="footer-links">
              <div class="link-group">
                <h4>探索</h4>
                <router-link to="/products">非遗商品</router-link>
                <router-link to="/restaurants">餐饮美食</router-link>
                <router-link to="/hotels">住宿预订</router-link>
                <router-link to="/tickets">线路订票</router-link>
              </div>
              <div class="link-group">
                <h4>关于</h4>
                <a href="#">关于我们</a>
                <a href="#">联系方式</a>
                <a href="#">商家入驻</a>
                <a href="#">人才招聘</a>
              </div>
              <div class="link-group">
                <h4>帮助</h4>
                <a href="#">常见问题</a>
                <a href="#">用户协议</a>
                <a href="#">隐私政策</a>
                <a href="#">退款说明</a>
              </div>
            </div>
            <div class="footer-contact">
              <h4>联系我们</h4>
              <div class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>0855-8234567</span>
              </div>
              <div class="contact-item">
                <el-icon><Message /></el-icon>
                <span>info@wudong.village</span>
              </div>
              <div class="contact-item">
                <el-icon><Location /></el-icon>
                <span>贵州黔东南苗族侗族自治州</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <div class="footer-bottom-content">
            <p>© 2024 乌东文旅平台 版权所有 | 黔ICP备XXXXXXXX号</p>
            <div class="footer-tags">
              <span class="footer-tag">苗族文化</span>
              <span class="footer-tag">非遗传承</span>
              <span class="footer-tag">黔东南旅游</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Bell, User, List, ShoppingCart, Setting, SwitchButton,
  ChatDotRound, Message, Share, Phone, Location, MagicStick
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getMessageList, getUnreadCount, readMessage, readAllMessages } from '@/api/message'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')

// AI 向导是独立部署的 DSH 页面（见 wudong-guide/），不在本站的路由里，
// 所以用普通 <a> 新标签页打开，而不是 router-link。
const guideUrl = import.meta.env.VITE_GUIDE_URL || 'http://127.0.0.1:3080'

// DSH 的会话 Cookie 是 SameSite=Strict，跨站点击不会被浏览器带上；
// 又因为 SameSite 只比较「站点」、不比较端口，所以只要 host 相同（端口不同没关系）
// 就能正常打开但 localhost 与 127.0.0.1 在浏览器眼里是两个站点。
// 这里提前拦下来给出明确指引，免得用户撞到一句英文的 401。
const openGuide = (event) => {
  let guideHost
  try {
    guideHost = new URL(guideUrl).hostname
  } catch {
    return
  }
  if (location.hostname !== guideHost) {
    event.preventDefault()
    ElMessage.warning(`AI 向导需要与本站同 host 访问，请改用 http://${guideHost}:${location.port} 打开本站后再点击`)
  }
}

// 未登录时搜索也应能跳转（逛商品不需要登录）
const handleSearch = () => {
  const kw = searchKeyword.value.trim()
  if (!kw) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({ path: '/products', query: { keyword: kw } })
}

// ===== 通知中心 =====
const messages = ref([])
const unreadCount = ref(0)

const refreshUnread = async () => {
  if (!userStore.isLoggedIn) {
    unreadCount.value = 0
    return
  }
  try {
    const res = await getUnreadCount()
    if (res.code === 0) unreadCount.value = res.data.unread
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

const loadMessages = async () => {
  try {
    const res = await getMessageList(1, 10)
    if (res.code === 0) {
      messages.value = res.data.list || []
      unreadCount.value = res.data.unread ?? 0
    }
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
}

const handleReadMessage = async (m) => {
  if (m.isRead) return
  try {
    const res = await readMessage(m.id)
    if (res.code === 0) {
      m.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('Failed to read message:', error)
  }
}

const handleReadAll = async () => {
  try {
    const res = await readAllMessages()
    if (res.code === 0) {
      messages.value = messages.value.map((m) => ({ ...m, isRead: 1 }))
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('Failed to read all messages:', error)
  }
}

// 登录状态变化时刷新未读
watch(() => userStore.isLoggedIn, refreshUnread, { immediate: true })

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gradient);
}

// 顶部导航 - 苗族风格
.header {
  background: linear-gradient(135deg, #fff 0%, #faf8f5 100%);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(26, 54, 93, 0.08);

  // 顶部苗族纹样
  .miao-pattern-top {
    height: 6px;
    background: linear-gradient(90deg,
      #1a365d 0%,
      #d4af37 20%,
      #8b4513 40%,
      #d4af37 60%,
      #1a365d 80%,
      #d4af37 100%
    );
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(212, 175, 55, 0.5) 50%,
        transparent 100%
      );
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    height: 72px;
    gap: 28px;
  }

  // 底部苗族装饰
  .miao-pattern-bottom {
    height: 4px;
    background: linear-gradient(90deg,
      #d4af37 0%,
      #1a365d 25%,
      #d4af37 50%,
      #1a365d 75%,
      #d4af37 100%
    );
    position: relative;

    .pattern-line {
      position: absolute;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 8px;
      background: linear-gradient(135deg, #d4af37, #b8860b);
      border-radius: 0 0 50% 50%;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 0;
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #d4af37, #b8860b);
        border-radius: 50%;
      }

      &::before {
        left: -20px;
      }

      &::after {
        right: -20px;
      }
    }
  }
}

// Logo
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  text-decoration: none;

  .logo-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    background: linear-gradient(135deg, #1a365d, #2d4a7c);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;

    .logo-svg {
      width: 100%;
      height: 100%;
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    .logo-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-color);
      font-family: 'Noto Serif SC', 'Songti SC', serif;
      letter-spacing: 2px;
      white-space: nowrap;
    }

    .logo-subtitle {
      font-size: 11px;
      color: var(--accent-color);
      letter-spacing: 1px;
      white-space: nowrap;
    }
  }
}

// 导航
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    // 不允许被 flex 压缩，否则中文会逐字折行
    flex-shrink: 0;
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition-base);
    color: var(--text-color);
    font-size: 15px;
    position: relative;
    overflow: hidden;

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--primary-color);
      transition: all var(--transition-base);
    }

    // 导航文字必须单行排列
    .nav-text {
      white-space: nowrap;
    }

    // AI 向导是本站之外的独立页面，给一点强调色以便与新功能区分。
    // 放在 &:hover 之前，让悬停时的背景色能覆盖它。
    &.nav-item-external {
      background: rgba(212, 175, 55, 0.12);

      .nav-icon {
        color: var(--accent-color);
      }
    }

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 60%;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-color), #b8860b);
      border-radius: 3px 3px 0 0;
      transition: transform 0.3s ease;
    }

    &:hover {
      background: rgba(212, 175, 55, 0.08);
      color: var(--primary-color);

      .nav-icon {
        color: var(--accent-color);
        transform: translateY(-2px);
      }

      &::before {
        transform: translateX(-50%) scaleX(1);
      }
    }

    &.active {
      background: linear-gradient(135deg, var(--primary-color), #2d5a87);
      color: white;
      box-shadow: 0 4px 15px rgba(26, 54, 93, 0.25);

      .nav-icon {
        color: var(--accent-color);
        transform: translateY(-2px);
      }

      &::before {
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(1);
      }
    }
  }
}

// 头部操作区
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .search-box {
    :deep(.miao-search) {
      .el-input__wrapper {
        border-radius: 24px;
        padding: 8px 16px;
        background: var(--bg-light);
        border: 2px solid transparent;
        transition: all var(--transition-fast);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        &:hover,
        &.is-focus {
          border-color: var(--accent-color);
          background: white;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
        }

        .el-input__inner {
          color: var(--text-color);
        }
      }
    }
  }

  .header-badge {
    :deep(.el-badge__content) {
      background: var(--chinese-red);
    }
  }

  .miao-btn {
    background: var(--bg-light);
    border: 1px solid var(--border-color);

    &:hover {
      background: white;
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
  }

  .user-dropdown {
    cursor: pointer;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.miao-avatar) {
      border: 3px solid var(--accent-color);
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
    }
  }

  .login-btn {
    background: linear-gradient(135deg, var(--primary-color), #2d5a87);
    border: none;
    padding: 10px 24px;
    border-radius: var(--radius-lg);
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(26, 54, 93, 0.2);

    &:hover {
      background: linear-gradient(135deg, #2d5a87, var(--primary-color));
      box-shadow: 0 6px 16px rgba(26, 54, 93, 0.3);
      transform: translateY(-1px);
    }
  }
}

// 苗族装饰条（兼容旧代码）
.miao-decoration {
  height: 4px;
  background: var(--bg-color);

  .decoration-line {
    height: 100%;
    background: linear-gradient(90deg,
      var(--primary-color) 0%,
      var(--accent-color) 25%,
      var(--secondary-color) 50%,
      var(--accent-color) 75%,
      var(--primary-color) 100%
    );
  }
}

// 主内容区
.main-content {
  flex: 1;
}

// 底部
.footer {
  background: linear-gradient(180deg, #0f1729 0%, #1a365d 100%);
  color: white;
  margin-top: 80px;

  .footer-main {
    padding: 80px 0 60px;

    .footer-grid {
      display: grid;
      grid-template-columns: 300px 1fr 280px;
      gap: 80px;
    }

    .footer-brand {
      .brand-logo {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 20px;
        border: 2px solid var(--accent-color);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      h3 {
        font-size: 24px;
        font-family: 'Noto Serif SC', serif;
        margin-bottom: 12px;
        background: linear-gradient(135deg, #fff, var(--accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 14px;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 24px;
      }

      .social-links {
        display: flex;
        gap: 12px;

        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);

          .el-icon {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.7);
          }

          &:hover {
            background: var(--accent-color);

            .el-icon {
              color: white;
            }
          }
        }
      }
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;

      .link-group {
        h4 {
          font-size: 16px;
          color: var(--accent-color);
          margin-bottom: 20px;
          font-weight: 600;
        }

        a {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 12px;
          transition: all var(--transition-fast);

          &:hover {
            color: white;
            padding-left: 4px;
          }
        }
      }
    }

    .footer-contact {
      h4 {
        font-size: 16px;
        color: var(--accent-color);
        margin-bottom: 20px;
        font-weight: 600;
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin-bottom: 14px;

        .el-icon {
          color: var(--accent-color);
          font-size: 16px;
        }
      }
    }
  }

  .footer-bottom {
    background: rgba(0, 0, 0, 0.3);
    padding: 20px 0;

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      p {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
      }

      .footer-tags {
        display: flex;
        gap: 12px;

        .footer-tag {
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .footer {
    .footer-main {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }

      .footer-brand {
        grid-column: 1 / -1;
        text-align: center;

        .social-links {
          justify-content: center;
        }
      }
    }
  }
}

// PC 端设计目标为 1280px+（见技术文档 2.2.4）：
// 更窄时导航只保留图标，避免中文导航被压缩成逐字折行。
@media (max-width: 1279.98px) {
  .nav {
    .nav-item {
      padding: 8px 12px;

      .nav-text {
        display: none;
      }
    }
  }
}

@media (max-width: 992px) {
  .header {
    .header-content {
      gap: 20px;
    }
  }

  .footer {
    .footer-main {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
      }

      .footer-links {
        grid-template-columns: repeat(3, 1fr);
      }

      .footer-contact {
        .contact-item {
          justify-content: center;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .header {
    .header-content {
      height: 60px;
    }

    .miao-pattern-top,
    .miao-pattern-bottom {
      display: none;
    }

    .logo {
      .logo-icon {
        width: 40px;
        height: 40px;
      }

      .logo-text {
        .logo-title {
          font-size: 18px;
        }

        .logo-subtitle {
          display: none;
        }
      }
    }

    .search-box {
      display: none;
    }
  }

  .footer {
    .footer-main {
      padding: 60px 0 40px;
    }

    .footer-links {
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .footer-bottom {
      .footer-bottom-content {
        flex-direction: column;
        gap: 12px;

        .footer-tags {
          display: none;
        }
      }
    }
  }
}
</style>

<style lang="scss">
/* 非 scoped：el-popover 内容会被 teleport 到 body，scoped 样式够不到 */
.miao-dropdown {
  min-width: 258px !important;
  padding: 8px 0 !important;
  overflow: hidden;
  border: 1px solid #e7ebf0 !important;
  border-radius: 16px !important;
  box-shadow: 0 18px 44px rgba(15, 23, 41, 0.16) !important;

  .dropdown-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px 18px 14px;
    margin: -8px 0 6px;
    background: linear-gradient(135deg, #fbfaf6 0%, #fff 72%);
    border-bottom: 2px solid var(--accent-color);

    .miao-avatar-lg {
      flex-shrink: 0;
      border: 3px solid var(--accent-color);
      background: linear-gradient(135deg, #b9c0ca, #d3d7dd);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.24);
    }

    .dropdown-user-detail {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
      gap: 3px;

      .dropdown-username {
        overflow: hidden;
        color: var(--primary-color);
        font-size: 16px;
        font-weight: 700;
        line-height: 1.25;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dropdown-userphone {
        color: #9aa3af;
        font-size: 12px;
        line-height: 1.3;
      }
    }
  }

  .el-dropdown-menu__item {
    height: 42px;
    margin: 2px 8px;
    padding: 0 12px;
    border-radius: 9px;
    color: #4b5563;
    font-size: 14px;
    line-height: 42px;
    transition: background 0.2s, color 0.2s;

    .el-icon {
      width: 22px;
      margin-right: 9px;
      color: #727b87;
      font-size: 18px;
      vertical-align: -3px;
    }

    &:hover,
    &:focus {
      background: rgba(212, 175, 55, 0.1);
      color: var(--primary-color);

      .el-icon {
        color: var(--accent-color);
      }
    }

    &.is-disabled {
      color: #c5cad1;
    }

    &.el-dropdown-menu__item--divided {
      margin-top: 8px;
      border-top: 1px solid #edf0f3;

      &::before {
        display: none;
      }
    }

    &:last-child {
      color: #66707d;

      .el-icon {
        color: #7d8792;
      }
    }
  }
}

.notice-popover {
  padding: 12px 14px !important;

  .notice-panel {
    .notice-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      margin-bottom: 6px;
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
      color: var(--primary-color);
      font-size: 14px;
    }

    .notice-empty {
      padding: 28px 0;
      text-align: center;
      color: var(--text-light);
      font-size: 13px;
    }

    .notice-list {
      max-height: 340px;
      overflow-y: auto;
    }

    .notice-item {
      padding: 10px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #faf8f4;
      }

      &.unread .notice-title {
        font-weight: 600;
        color: #1a365d;
      }

      .notice-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #303133;
        margin-bottom: 4px;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #991b1b;
          flex-shrink: 0;
        }
      }

      .notice-content {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
}
</style>
