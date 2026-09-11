<template>
  <div class="orders-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>我的订单</h1>
        <p>查看和管理您的预订行程</p>
      </div>
    </div>

    <div class="container">
      <!-- 订单类型切换 -->
      <div class="tabs-section">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'all' }"
          @click="handleTabChange('all')"
        >
          <span>全部订单</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'goods' }"
          @click="handleTabChange('goods')"
        >
          <span>商品订单</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'route' }"
          @click="handleTabChange('route')"
        >
          <span>路线订单</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'hotel' }"
          @click="handleTabChange('hotel')"
        >
          <span>民宿订单</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'restaurant' }"
          @click="handleTabChange('restaurant')"
        >
          <span>餐饮订单</span>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="order-list" v-loading="loading">
        <div v-if="orders.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>暂无订单</p>
          <el-button type="primary" @click="$router.push('/')">去预订</el-button>
        </div>

        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card card"
        >
          <div class="order-header">
            <div class="order-meta">
              <span class="order-no">{{ order.orderNo }}</span>
              <span class="order-time">{{ formatTime(order.createTime) }}</span>
            </div>
            <el-tag :type="getStatusType(order.status)" effect="dark" class="status-tag">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>

          <div class="order-body" @click="goToDetail(order)">
            <div class="order-main">
              <div class="order-item" v-for="item in order.items" :key="item.id">
                <el-image
                  :src="item.image || '/placeholder.svg'"
                  :alt="item.name"
                  fit="cover"
                  class="item-image"
                />
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="item-desc">{{ item.description || '乌东特色服务' }}</p>
                  <p class="item-meta">
                    <el-icon><Calendar /></el-icon>
                    {{ item.date || order.travelDate }}
                    <span class="divider">|</span>
                    <el-icon><User /></el-icon>
                    {{ item.count || order.count || 1 }}人
                  </p>
                </div>
              </div>
            </div>
            <div class="order-price">
              <span class="price-label">应付金额</span>
              <span class="price">¥{{ (order.totalAmount / 100).toFixed(2) }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-actions">
              <el-button size="small" v-if="order.status === 'pending'" type="danger" @click.stop="handlePay(order)">
                <el-icon><Wallet /></el-icon>
                立即支付
              </el-button>
              <el-button size="small" v-if="order.status === 'pending'" @click.stop="handleCancel(order)">
                取消订单
              </el-button>
              <el-button size="small" v-if="order.status === 'paid'" plain @click.stop="handleRefund(order)">
                申请退款
              </el-button>
              <el-button size="small" type="primary" plain @click.stop="goToDetail(order)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="pagination.total > pagination.pageSize">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList, cancelOrder, payOrder, refundOrder } from '@/api/ticket'
import { getRoomDetail } from '@/api/hotel'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, User, Wallet } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const orders = ref([])
const activeTab = ref('all')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 后端 orderType：product / route / hotel / ticket / food_seat
const orderTypeMap = {
  all: null,
  goods: 'product',
  route: 'route',
  hotel: 'hotel',
  restaurant: 'food_seat',
}

const loadOrders = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const res = await getOrderList(
      userStore.user.id,
      orderTypeMap[activeTab.value],
      pagination.page,
      pagination.pageSize
    )
    if (res.code === 0) {
      orders.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  pagination.page = 1
  loadOrders()
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'info',
    refunded: 'danger',
    completed: '',
  }
  return map[status] || ''
}

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    refunded: '已退款',
    completed: '已完成',
  }
  return map[status] || status
}

const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm('确认支付该订单？', '支付确认', {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await payOrder(order.id, userStore.user.id, 'wechat')
    if (res.code === 0) {
      ElMessage.success('支付成功')
      loadOrders()
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Failed to pay:', e)
    }
  }
}

const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm('确认取消该订单？', '取消订单', {
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想',
      type: 'warning',
    })
    const res = await cancelOrder(order.id, userStore.user.id, '用户主动取消')
    if (res.code === 0) {
      ElMessage.success('订单已取消')
      loadOrders()
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Failed to cancel:', e)
    }
  }
}

const handleRefund = async (order) => {
  try {
    await ElMessageBox.confirm('确认申请退款？退款后不可撤销。', '申请退款', {
      confirmButtonText: '确认退款',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await refundOrder(order.id, userStore.user.id)
    if (res.code === 0) {
      ElMessage.success('退款成功')
      loadOrders()
    } else {
      ElMessage.error(res.message || '退款失败')
    }
  } catch (e) {
    if (e !== 'cancel') console.error('Failed to refund:', e)
  }
}

// 按订单类型跳到对应详情页
const DETAIL_PATH = {
  product: (id) => `/products/${id}`,
  route: (id) => `/routes/${id}`,
  ticket: (id) => `/scenics/${id}`,
  food_seat: (id) => `/restaurants/${id}`,
}

const goToDetail = async (order) => {
  if (!order.relatedId) return

  // 酒店订单的 relatedId 是「房型 id」（下单时按房型取价），
  // 直接当民宿 id 用会跳到错误的民宿、或落到不存在的民宿变成空页面。
  // 这里先由房型反查所属民宿。
  if (order.orderType === 'hotel') {
    try {
      const res = await getRoomDetail(order.relatedId)
      const hotelId = res?.data?.hotelId
      if (hotelId) {
        router.push(`/hotels/${hotelId}`)
        return
      }
    } catch (error) {
      console.error('Failed to resolve hotel for order:', error)
    }
    ElMessage.warning('该房型对应的民宿已下架')
    return
  }

  const build = DETAIL_PATH[order.orderType]
  if (build) router.push(build(order.relatedId))
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.orders-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-hero {
  position: relative;
  height: 220px;
  background: linear-gradient(135deg, #1a365d 0%, #6b21a8 50%, #1a365d 100%);
  background-image: url('https://images.pexels.com/photos/8828439/pexels-photo-8828439.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(107, 33, 168, 0.85) 50%, rgba(26, 54, 93, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(26, 54, 93, 0.8) 0%, rgba(107, 33, 168, 0.7) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;

    h1 {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      font-size: 16px;
      opacity: 0.9;
    }
  }
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.tabs-section {
  display: flex;
  gap: 12px;
  margin-top: -30px;
  position: relative;
  z-index: 10;
  margin-bottom: 30px;
  background: white;
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(26, 54, 93, 0.12);

  .tab-item {
    flex: 1;
    padding: 12px 16px;
    text-align: center;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.3s;

    span {
      font-size: 14px;
      color: var(--text-light);
      transition: color 0.3s;
    }

    &:hover {
      background: var(--bg-light);
    }

    &.active {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));

      span {
        color: white;
        font-weight: 500;
      }
    }
  }
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  p {
    font-size: 16px;
    color: var(--text-light);
    margin-bottom: 20px;
  }
}

.order-card {
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 12px 40px rgba(26, 54, 93, 0.15);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(26, 54, 93, 0.03), rgba(107, 33, 168, 0.03));
    border-bottom: 1px dashed var(--border-color);

    .order-meta {
      display: flex;
      align-items: center;
      gap: 16px;

      .order-no {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-color);
      }

      .order-time {
        font-size: 13px;
        color: var(--text-light);
      }
    }

    .status-tag {
      border-radius: 20px;
    }
  }

  .order-body {
    display: flex;
    padding: 20px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: var(--bg-light);
    }

    .order-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .order-item {
      display: flex;
      gap: 16px;

      .item-image {
        width: 120px;
        height: 90px;
        border-radius: 12px;
        flex-shrink: 0;
      }

      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-color);
        }

        .item-desc {
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 8px;
          flex: 1;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-light);

          .el-icon {
            font-size: 14px;
            color: var(--primary-color);
          }

          .divider {
            color: var(--border-color);
          }
        }
      }
    }

    .order-price {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 24px;
      border-left: 1px dashed var(--border-color);

      .price-label {
        font-size: 12px;
        color: var(--text-light);
        margin-bottom: 8px;
      }

      .price {
        color: var(--chinese-red);
        font-size: 24px;
        font-weight: 700;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-light);

    .order-actions {
      display: flex;
      gap: 12px;

      .el-button {
        border-radius: 20px;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .order-card {
    .order-body {
      flex-direction: column;

      .order-item {
        flex-direction: column;

        .item-image {
          width: 100%;
          height: 160px;
        }
      }

      .order-price {
        border-left: none;
        border-top: 1px dashed var(--border-color);
        padding: 16px 0 0;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
      }
    }

    .order-footer .order-actions {
      flex-wrap: wrap;
    }
  }
}
</style>
