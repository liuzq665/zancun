<template>
  <div class="order-manage">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><Document /></el-icon>
          订单管理
        </h2>
        <p class="header-subtitle">管理用户订单和交易记录</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <el-input
        v-model="keyword"
        placeholder="订单号/用户名"
        clearable
        @clear="loadOrders"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="status" placeholder="订单状态" clearable style="width: 140px" @change="loadOrders">
        <el-option label="待支付" value="pending" />
        <el-option label="已支付" value="paid" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-select v-model="orderType" placeholder="订单类型" clearable style="width: 140px" @change="loadOrders">
        <el-option label="路线" value="route" />
        <el-option label="民宿" value="hotel" />
        <el-option label="餐饮" value="restaurant" />
      </el-select>
      <el-button type="primary" @click="loadOrders" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <el-table :data="orders" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" class="user-avatar">{{ row.userName?.slice(0, 1) || '游' }}</el-avatar>
              <span>{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :style="getTypeStyle(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="items[0].name" label="订单内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="totalAmount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.totalAmount / 100).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="viewDetail(row)">详情</el-button>
            <el-button size="small" type="success" v-if="row.status === 'pending'" @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAdminOrderList, processOrder } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Search } from '@element-plus/icons-vue'

const loading = ref(false)
const orders = ref([])
const keyword = ref('')
const status = ref('')
const orderType = ref('')

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const getTypeText = (type) => ({ route: '路线', hotel: '民宿', restaurant: '餐饮' }[type] || type)
const getTypeStyle = (type) => {
  const map = {
    route: { background: 'rgba(26, 54, 93, 0.1)', color: '#1a365d' },
    hotel: { background: 'rgba(22, 101, 52, 0.1)', color: '#166534' },
    restaurant: { background: 'rgba(153, 27, 27, 0.1)', color: '#991b1b' },
  }
  return map[type] || {}
}
const getStatusText = (status) => ({ pending: '待支付', paid: '已支付', completed: '已完成', cancelled: '已取消' }[status] || status)
const getStatusType = (status) => ({ pending: 'warning', paid: 'success', completed: '', cancelled: 'info' }[status] || '')

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await getAdminOrderList({
      page: pagination.page, pageSize: pagination.pageSize, keyword: keyword.value, status: status.value, type: orderType.value
    })
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

const viewDetail = (order) => {
  ElMessage.info(
    `订单 ${order.orderNo}｜类型：${order.type}｜金额：¥${((order.totalAmount || 0) / 100).toFixed(2)}｜状态：${order.status}`
  )
}

// 按当前状态推进到下一个合理状态
const nextAction = (status) => {
  if (status === 'pending') return { action: 'cancel', label: '取消订单' }
  if (status === 'paid') return { action: 'complete', label: '完成订单' }
  if (status === 'completed') return { action: 'refund', label: '退款' }
  return null
}

const handleProcess = async (order) => {
  const next = nextAction(order.status)
  if (!next) {
    ElMessage.info('该订单无需处理')
    return
  }
  try {
    await ElMessageBox.confirm(`确认${next.label}？`, '订单处理', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await processOrder(order.id, next.action)
    if (res.code === 0) {
      ElMessage.success(`${next.label}成功`)
      loadOrders()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to process order:', error)
  }
}

onMounted(() => { loadOrders() })
</script>

<style scoped lang="scss">
.order-manage {
  .page-header {
    margin-bottom: 24px;

    .header-title {
      h2 {
        font-size: 22px;
        font-weight: 600;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;

        .el-icon {
          color: var(--secondary-color);
        }
      }

      .header-subtitle {
        font-size: 14px;
        color: var(--text-light);
      }
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;

    .search-input {
      width: 240px;
    }

    .search-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
    }
  }

  .table-card {
    padding: 0;

    .user-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .user-avatar {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }
    }

    .amount {
      color: var(--chinese-red);
      font-weight: 600;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid var(--border-color);
    }
  }
}
</style>
