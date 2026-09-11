<template>
  <div class="user-manage">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><User /></el-icon>
          用户管理
        </h2>
        <p class="header-subtitle">管理平台注册用户</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <el-input
        v-model="keyword"
        placeholder="用户名/手机号"
        clearable
        @clear="loadUsers"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="status" placeholder="用户状态" clearable style="width: 140px" @change="loadUsers">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="loadUsers" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" class="user-avatar">{{ row.nickname?.slice(0, 1) || '游' }}</el-avatar>
              <span>{{ row.nickname || '游客' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="150">
          <template #default="{ row }">
            {{ formatPhone(row.phone) }}
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ { male: '男', female: '女', secret: '保密' }[row.gender] || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100">
          <template #default="{ row }">
            <span class="count-badge">{{ row.orderCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="favoriteCount" label="收藏数" width="100">
          <template #default="{ row }">
            <span class="count-badge">{{ row.favoriteCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small" effect="dark">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="viewUser(row)">详情</el-button>
            <el-button size="small" :type="row.status === 1 ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
          @current-change="loadUsers"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserList, setUserStatus } from '@/api/admin'
import { ElMessage } from 'element-plus'
import { User, Search } from '@element-plus/icons-vue'

const loading = ref(false)
const users = ref([])
const keyword = ref('')
const status = ref('')

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const formatPhone = (phone) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({ page: pagination.page, pageSize: pagination.pageSize, keyword: keyword.value, status: status.value })
    if (res.code === 0) {
      users.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const viewUser = (user) => {
  ElMessage.info(
    `用户：${user.nickname || '-'}｜手机号：${user.phone || '-'}｜订单数：${user.orderCount ?? 0}｜收藏数：${user.favoriteCount ?? 0}`
  )
}

const toggleStatus = async (user) => {
  const next = user.status === 1 ? 0 : 1
  try {
    const res = await setUserStatus(user.id, next)
    if (res.code === 0) {
      user.status = next
      ElMessage.success(`用户已${next === 1 ? '启用' : '封禁'}`)
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to toggle user status:', error)
  }
}

onMounted(() => { loadUsers() })
</script>

<style scoped lang="scss">
.user-manage {
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
      gap: 10px;

      .user-avatar {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }
    }

    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      background: var(--bg-light);
      border-radius: 14px;
      font-size: 13px;
      color: var(--text-color);
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
