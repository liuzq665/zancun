<template>
  <div class="dashboard">
    <!-- Hero Banner -->
    <div class="dashboard-hero">
      <div class="hero-content">
        <h1>欢迎回来，管理员</h1>
        <p>实时掌握乌东文旅平台运营状况</p>
      </div>
      <div class="hero-decoration">
        <div class="decoration-icon">📊</div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #1a365d, #2d4a7c)">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.users }}</p>
            <p class="stat-label">用户总数</p>
            <div class="stat-trend up">
              <el-icon><Top /></el-icon>
              <span>+12%</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #166534, #22c55e)">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.orders }}</p>
            <p class="stat-label">订单总数</p>
            <div class="stat-trend up">
              <el-icon><Top /></el-icon>
              <span>+8%</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #d4af37, #f4e4a6)">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">¥{{ (stats.revenue / 100).toFixed(0) }}</p>
            <p class="stat-label">总收入</p>
            <div class="stat-trend up">
              <el-icon><Top /></el-icon>
              <span>+23%</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #991b1b, #ef4444)">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.posts }}</p>
            <p class="stat-label">社区帖子</p>
            <div class="stat-trend down">
              <el-icon><Bottom /></el-icon>
              <span>-3%</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="chart-row">
      <el-col :span="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>订单趋势</h3>
            <el-radio-group v-model="chartPeriod" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-placeholder">
            <div class="mock-chart">
              <div v-for="(value, idx) in orderTrend" :key="idx" class="bar" :style="{ height: value + '%' }">
                <span class="bar-label">{{ days[idx] }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>订单类型分布</h3>
          </div>
          <div class="chart-content">
            <div class="pie-placeholder">
              <div class="pie-chart">
                <div class="pie-segment" style="--percent: 40%; --color: #1a365d">路线</div>
                <div class="pie-segment" style="--percent: 30%; --color: #166534">民宿</div>
                <div class="pie-segment" style="--percent: 20%; --color: #991b1b">餐饮</div>
                <div class="pie-segment" style="--percent: 10%; --color: #2d5a87">其他</div>
              </div>
            </div>
            <div class="legend">
              <div class="legend-item"><span class="dot" style="background: #1a365d"></span>路线订单 40%</div>
              <div class="legend-item"><span class="dot" style="background: #166534"></span>民宿订单 30%</div>
              <div class="legend-item"><span class="dot" style="background: #991b1b"></span>餐饮订单 20%</div>
              <div class="legend-item"><span class="dot" style="background: #2d5a87"></span>其他 10%</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 近期订单 -->
    <div class="recent-section card">
      <div class="section-header">
        <h3>
          <el-icon><Clock /></el-icon>
          近期订单
        </h3>
        <el-button type="primary" plain size="small" @click="$router.push('/admin/orders')">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-table :data="recentOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :style="getTypeStyle(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.amount / 100).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Goods, Money, ChatDotRound, Top, Bottom, Clock, ArrowRight } from '@element-plus/icons-vue'
import { getStatistics, getAdminOrderList } from '@/api/admin'

const chartPeriod = ref('week')

const stats = ref({
  users: 0,
  orders: 0,
  revenue: 0,
  posts: 0,
})

// 近 7 天订单数（按下单日期聚合），后端无趋势接口，这里由订单列表推导
const orderTrend = ref([0, 0, 0, 0, 0, 0, 0])
const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const recentOrders = ref([])

const loadStats = async () => {
  try {
    const res = await getStatistics()
    if (res.code === 0) {
      stats.value = {
        users: res.data.totalUsers || 0,
        orders: res.data.totalOrders || 0,
        // 后端统计不含营业额，先按订单金额累加
        revenue: res.data.revenue || 0,
        posts: res.data.totalPosts || 0,
      }
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

const loadRecentOrders = async () => {
  try {
    const res = await getAdminOrderList({ page: 1, pageSize: 5 })
    if (res.code === 0) {
      recentOrders.value = (res.data.list || []).map((o) => ({
        orderNo: o.orderNo,
        userName: o.userName,
        type: o.type,
        amount: o.totalAmount,
        status: o.status,
        createTime: o.createTime,
      }))
    }
    // 趋势 + 营业额：拉最近 100 条订单推导（后端无趋势/营收接口）
    const all = await getAdminOrderList({ page: 1, pageSize: 100 })
    if (all.code === 0) {
      const rows = all.data.list || []
      const buckets = [0, 0, 0, 0, 0, 0, 0]
      rows.forEach((o) => {
        if (!o.createTime) return
        const d = new Date(o.createTime)
        // getDay(): 0=周日 → 映射到「周一…周日」的索引
        const idx = (d.getDay() + 6) % 7
        buckets[idx] += 1
      })
      const max = Math.max(...buckets, 1)
      orderTrend.value = buckets.map((b) => Math.max(8, Math.round((b / max) * 100)))

      // 已支付/已完成的订单金额计为营业额（单位分，与模板 /100 一致）
      stats.value.revenue = rows
        .filter((o) => o.status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  }
}

onMounted(() => {
  loadStats()
  loadRecentOrders()
})

const getTypeText = (type) => {
  const map = { product: '商品', route: '路线', hotel: '民宿', food_seat: '餐饮' }
  return map[type] || type
}

const getTypeStyle = (type) => {
  const map = {
    route: { background: 'rgba(26, 54, 93, 0.1)', color: '#1a365d' },
    hotel: { background: 'rgba(22, 101, 52, 0.1)', color: '#166534' },
    food_seat: { background: 'rgba(153, 27, 27, 0.1)', color: '#991b1b' },
  }
  return map[type] || {}
}

const getStatusText = (status) => {
  const map = { pending: '待支付', paid: '已支付', completed: '已完成', cancelled: '已取消', refunded: '已退款' }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { pending: 'warning', paid: 'success', completed: '', cancelled: 'info', refunded: 'danger' }
  return map[status] || ''
}
</script>

<style scoped lang="scss">
.dashboard {
  .dashboard-hero {
    background: linear-gradient(135deg, #1a365d 0%, #2d1b69 50%, #1a365d 100%);
    background-image: url('https://images.pexels.com/photos/7658310/pexels-photo-7658310.jpeg?auto=compress&cs=tinysrgb&w=800'),
                      linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(45, 27, 105, 0.85) 50%, rgba(26, 54, 93, 0.9) 100%);
    background-size: cover;
    background-position: center;
    border-radius: 20px;
    padding: 32px 40px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(26, 54, 93, 0.85) 0%, rgba(45, 27, 105, 0.8) 100%);
    }

    .hero-content {
      position: relative;
      z-index: 1;

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: white;
        margin-bottom: 8px;
      }

      p {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .hero-decoration {
      position: relative;
      z-index: 1;

      .decoration-icon {
        font-size: 64px;
        opacity: 0.3;
      }
    }
  }
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(26, 54, 93, 0.08);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(26, 54, 93, 0.12);
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 28px;
      color: white;
    }
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      padding: 2px 8px;
      border-radius: 10px;

      &.up {
        background: rgba(22, 163, 74, 0.1);
        color: #166534;
      }

      &.down {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
      }

      .el-icon {
        font-size: 12px;
      }
    }
  }
}

.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  height: 360px;
  box-shadow: 0 4px 20px rgba(26, 54, 93, 0.08);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    :deep(.el-radio-button__inner) {
      border-radius: 20px;
    }
  }
}

.chart-placeholder {
  height: calc(100% - 60px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  height: 100%;
  padding-bottom: 36px;

  .bar {
    width: 56px;
    background: linear-gradient(to top, #1a365d, #2d5a87);
    border-radius: 8px 8px 0 0;
    position: relative;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(to top, #2d4a7c, #7c3aed);
    }

    .bar-label {
      position: absolute;
      bottom: -36px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #909399;
    }
  }
}

.chart-content {
  display: flex;
  align-items: center;
  height: calc(100% - 60px);
  gap: 32px;

  .pie-placeholder {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .pie-chart {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: conic-gradient(
      #1a365d 0deg 144deg,
      #166534 144deg 252deg,
      #991b1b 252deg 324deg,
      #2d5a87 324deg 360deg
    );
    position: relative;
  }

  .pie-segment {
    display: none;
  }

  .legend {
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
      font-size: 14px;
      color: #606266;

      .dot {
        width: 14px;
        height: 14px;
        border-radius: 4px;
      }
    }
  }
}

.recent-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: var(--primary-color);
      }
    }

    .amount {
      color: var(--chinese-red);
      font-weight: 600;
    }
  }
}
</style>
