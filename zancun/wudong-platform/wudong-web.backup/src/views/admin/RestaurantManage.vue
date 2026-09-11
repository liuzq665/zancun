<template>
  <div class="restaurant-manage">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><Food /></el-icon>
          餐厅管理
        </h2>
        <p class="header-subtitle">管理特色餐饮和美食店铺</p>
      </div>
      <el-button type="primary" @click="openDialog(false)" class="add-btn">
        <el-icon><Plus /></el-icon>
        添加餐厅
      </el-button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <el-input
        v-model="keyword"
        placeholder="搜索餐厅名称"
        clearable
        @clear="loadRestaurants"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="loadRestaurants" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <el-table :data="restaurants" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="餐厅名称" min-width="200">
          <template #default="{ row }">
            <div class="restaurant-cell">
              <img :src="row.coverImage || '/placeholder.svg'" class="restaurant-thumb" />
              <span class="restaurant-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="人均" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ (row.avgPrice / 100).toFixed(0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="businessHours" label="营业时间" width="120" />
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
          @current-change="loadRestaurants"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑餐厅' : '添加餐厅'" width="700px" class="restaurant-dialog">
      <el-form :model="form" label-width="100px" class="restaurant-form">
        <el-form-item label="餐厅名称">
          <el-input v-model="form.name" placeholder="请输入餐厅名称" />
        </el-form-item>
        <el-form-item label="餐厅地址">
          <el-input v-model="form.address" placeholder="请输入餐厅地址" />
        </el-form-item>
        <el-form-item label="人均价格">
          <el-input-number v-model="priceValue" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="form.phone"
            placeholder="手机号或座机（如 0855-8234567）"
            maxlength="20"
            @input="form.phone = sanitizeBusinessPhone($event)"
          />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.businessHours" placeholder="如：09:00-21:00" />
        </el-form-item>
        <el-form-item label="餐厅描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入餐厅描述" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="form.coverImage" placeholder="请输入图片URL" />
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
import { getAdminRestaurantList, saveBusiness, deleteBusiness } from '@/api/admin'
import { sanitizeBusinessPhone, validateBusinessPhone } from '@/utils/validate'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Food, Search, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const restaurants = ref([])
const showDialog = ref(false)
const isEdit = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const keyword = ref('')

const form = reactive({
  id: null,
  name: '',
  address: '',
  avgPrice: 0,
  phone: '',
  businessHours: '',
  description: '',
  coverImage: '',
})

const priceValue = computed({
  get: () => form.avgPrice / 100,
  set: (val) => { form.avgPrice = Math.round(val * 100) },
})

const loadRestaurants = async () => {
  loading.value = true
  try {
    const res = await getAdminRestaurantList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: keyword.value,
    })
    if (res.code === 0) {
      restaurants.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Failed to load restaurants:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = (edit, row = null) => {
  isEdit.value = edit
  if (edit && row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, { id: null, name: '', address: '', avgPrice: 0, phone: '', businessHours: '', description: '', coverImage: '' })
  }
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.name) {
    ElMessage.warning('请填写餐厅名称')
    return
  }
  const phoneErr = validateBusinessPhone(form.phone)
  if (phoneErr) {
    ElMessage.warning(phoneErr)
    return
  }
  try {
    const res = await saveBusiness('restaurant', { ...form })
    if (res.code === 0) {
      ElMessage.success('保存成功')
      showDialog.value = false
      loadRestaurants()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('Failed to save restaurant:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该餐厅？此操作不可恢复。', '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await deleteBusiness('restaurant', row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadRestaurants()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete restaurant:', error)
  }
}

onMounted(() => {
  loadRestaurants()
})
</script>

<style scoped lang="scss">
.restaurant-manage {
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
      width: 280px;
    }

    .search-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
    }
  }

  .table-card {
    padding: 0;

    .restaurant-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .restaurant-thumb {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
      }

      .restaurant-name {
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

  :deep(.restaurant-dialog) {
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
