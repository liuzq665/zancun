import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/MainLayout.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import { updateSeo } from '@/composables/useSeo'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: { title: '非遗商品' },
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: { title: '商品详情' },
      },
      {
        path: 'restaurants',
        name: 'Restaurants',
        component: () => import('@/views/Restaurants.vue'),
        meta: { title: '餐饮美食' },
      },
      {
        path: 'restaurants/:id',
        name: 'RestaurantDetail',
        component: () => import('@/views/RestaurantDetail.vue'),
        meta: { title: '餐厅详情' },
      },
      {
        path: 'hotels',
        name: 'Hotels',
        component: () => import('@/views/Hotels.vue'),
        meta: { title: '住宿预订' },
      },
      {
        path: 'hotels/:id',
        name: 'HotelDetail',
        component: () => import('@/views/HotelDetail.vue'),
        meta: { title: '民宿详情' },
      },
      {
        path: 'tickets',
        name: 'Tickets',
        component: () => import('@/views/Tickets.vue'),
        meta: { title: '线路订票' },
      },
      {
        path: 'scenics/:id',
        name: 'ScenicDetail',
        component: () => import('@/views/ScenicDetail.vue'),
        meta: { title: '景区详情' },
      },
      {
        path: 'routes/:id',
        name: 'RouteDetail',
        component: () => import('@/views/RouteDetail.vue'),
        meta: { title: '路线详情' },
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/views/Community.vue'),
        meta: { title: '社区' },
      },
      {
        path: 'community/post/:id',
        name: 'PostDetail',
        component: () => import('@/views/PostDetail.vue'),
        meta: { title: '帖子详情' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '我的订单', requiresAuth: true },
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue'),
        meta: { title: '购物车', requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  // Admin routes
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '数据概览', requiresAdmin: true },
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/ProductManage.vue'),
        meta: { title: '商品管理', requiresAdmin: true },
      },
      {
        path: 'restaurants',
        name: 'AdminRestaurants',
        component: () => import('@/views/admin/RestaurantManage.vue'),
        meta: { title: '餐厅管理', requiresAdmin: true },
      },
      {
        path: 'hotels',
        name: 'AdminHotels',
        component: () => import('@/views/admin/HotelManage.vue'),
        meta: { title: '民宿管理', requiresAdmin: true },
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: () => import('@/views/admin/TicketManage.vue'),
        meta: { title: '路线管理', requiresAdmin: true },
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/OrderManage.vue'),
        meta: { title: '订单管理', requiresAdmin: true },
      },
      {
        path: 'community',
        name: 'AdminCommunity',
        component: () => import('@/views/admin/CommunityManage.vue'),
        meta: { title: '社区管理', requiresAdmin: true },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理', requiresAdmin: true },
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { title: '系统设置', requiresAdmin: true },
      },
    ],
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '管理员登录' },
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 每次路由跳转把页面拉回顶部（用户端与管理端都是 window 滚动）
  scrollBehavior(to, from, savedPosition) {
    // 浏览器前进/后退：恢复原来的位置，符合预期
    if (savedPosition) return savedPosition
    // 带锚点的跳转：滚到锚点
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    // 其余跳转一律回到顶部。显式 behavior:'auto' 是为了避开 global.scss 里
    // 的 html{scroll-behavior:smooth}，否则长页面会先滚一段动画再到位
    return { left: 0, top: 0, behavior: 'auto' }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title || '乌东文旅'
  const canonicalUrl = new URL(to.fullPath, window.location.origin).href
  updateSeo({
    title: pageTitle,
    description: to.meta.requiresAdmin
      ? '乌东文旅综合服务平台管理后台。'
      : '乌东村文化旅游综合服务平台，提供苗族非遗商品、精品民宿、特色美食与景区线路服务。',
    url: canonicalUrl,
  })

  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !adminToken) {
    // 如果没有管理员token，重定向到管理员登录页
    if (!to.path.startsWith('/admin/login')) {
      next('/admin/login')
      return
    }
  }

  // 检查是否需要用户登录
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  next()
})

export default router
