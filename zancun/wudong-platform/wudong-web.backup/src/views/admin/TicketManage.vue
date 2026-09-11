<template>
  <div class="ticket-manage">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><Ticket /></el-icon>
          路线管理
        </h2>
        <p class="header-subtitle">管理旅游路线和门票服务</p>
      </div>
      <el-button type="primary" @click="openDialog(false)" class="add-btn">
        <el-icon><Plus /></el-icon>
        添加路线
      </el-button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <el-input
        v-model="keyword"
        placeholder="搜索路线名称"
        clearable
        @clear="loadRoutes"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="routeType" placeholder="路线类型" clearable style="width: 150px" @change="loadRoutes">
        <el-option label="一日游" value="一日游" />
        <el-option label="两日游" value="两日游" />
        <el-option label="三日游" value="三日游" />
      </el-select>
      <el-button type="primary" @click="loadRoutes" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <el-table :data="routes" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="路线名称" min-width="200">
          <template #default="{ row }">
            <div class="route-cell">
              <img :src="row.coverImage || '/placeholder.svg'" class="route-thumb" />
              <span class="route-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="routeType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="warning" effect="plain">{{ row.routeType || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ (row.price / 100).toFixed(0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="meetingPoint" label="集合地点" min-width="150" show-overflow-tooltip />
        <el-table-column prop="meetingTime" label="集合时间" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#166534"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="openDialog(true, row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
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
          @current-change="loadRoutes"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑路线' : '添加路线'" width="800px" class="ticket-dialog">
      <el-form :model="form" label-width="100px" class="ticket-form">
        <el-form-item label="路线名称">
          <el-input v-model="form.name" placeholder="请输入路线名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路线类型">
              <el-select v-model="form.routeType" style="width: 100%">
                <el-option label="一日游" value="一日游" />
                <el-option label="两日游" value="两日游" />
                <el-option label="三日游" value="三日游" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格(元)">
              <el-input-number v-model="priceValue" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="集合地点">
              <el-input v-model="form.meetingPoint" placeholder="请输入集合地点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="集合时间">
              <el-input v-model="form.meetingTime" placeholder="如：08:00" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="路线描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="form.coverImage" placeholder="图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" class="save-btn">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAdminRouteList, saveBusiness, deleteBusiness } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Ticket, Search, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const routes = ref([])
const showDialog = ref(false)
const isEdit = ref(false)
const keyword = ref('')
const routeType = ref('')

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  id: null, name: '', routeType: '一日游', price: 0, meetingPoint: '', meetingTime: '', description: '', coverImage: ''
})

const priceValue = computed({
  get: () => form.price / 100,
  set: (val) => { form.price = Math.round(val * 100) },
})

const loadRoutes = async () => {
  loading.value = true
  try {
    const res = await getAdminRouteList({ page: pagination.page, pageSize: pagination.pageSize, keyword: keyword.value, routeType: routeType.value })
    if (res.code === 0) {
      routes.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Failed to load routes:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = (edit, row = null) => {
  isEdit.value = edit
  if (edit && row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, { id: null, name: '', routeType: '一日游', price: 0, meetingPoint: '', meetingTime: '', description: '', coverImage: '' })
  }
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.name) {
    ElMessage.warning('请填写路线名称')
    return
  }
  try {
    const res = await saveBusiness('route', { ...form })
    if (res.code === 0) {
      ElMessage.success('保存成功')
      showDialog.value = false
      loadRoutes()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('Failed to save route:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该路线？此操作不可恢复。', '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await deleteBusiness('route', row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadRoutes()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete route:', error)
  }
}

onMounted(() => { loadRoutes() })
</script>

<style scoped lang="scss">
.ticket-manage {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

    .add-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
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

    .route-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .route-thumb {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
      }

      .route-name {
        font-weight: 500;
      }
    }

    .price {
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

  :deep(.ticket-dialog) {
    .el-dialog__header {
      border-bottom: 1px solid var(--border-color);
    }

    .save-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
    }
  }
}
</style>
