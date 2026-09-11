<template>
  <div class="product-manage">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><Goods /></el-icon>
          商品管理
        </h2>
        <p class="header-subtitle">管理特色产品和手工艺品</p>
      </div>
      <el-button type="primary" @click="openDialog(false)" class="add-btn">
        <el-icon><Plus /></el-icon>
        添加商品
      </el-button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <el-input
        v-model="keyword"
        placeholder="搜索商品名称"
        clearable
        @clear="loadProducts"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="categoryId" placeholder="选择分类" clearable style="width: 160px" @change="loadProducts">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-button type="primary" @click="loadProducts" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <el-table :data="products" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <img :src="row.coverImage || '/placeholder.svg'" class="product-thumb" />
              <span class="product-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category?.name || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ (row.price / 100).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="salesCount" label="销量" width="100" />
        <el-table-column prop="heritageLevel" label="非遗等级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.heritageLevel > 0" type="warning" size="small" effect="dark">
              {{ heritageLabels[row.heritageLevel] }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
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
          @current-change="loadProducts"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑商品' : '添加商品'" width="700px" class="product-dialog">
      <el-form :model="form" label-width="100px" class="product-form">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格(元)">
          <el-input-number v-model="priceValue" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="非遗等级">
          <el-select v-model="form.heritageLevel" placeholder="选择非遗等级" style="width: 100%">
            <el-option :value="0" label="无" />
            <el-option :value="1" label="县级非遗" />
            <el-option :value="2" label="州级非遗" />
            <el-option :value="3" label="省级非遗" />
            <el-option :value="4" label="国家级非遗" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
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
import { getAdminProductList, saveProduct, deleteProduct } from '@/api/admin'
import { getCategoryList } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Goods, Search, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const products = ref([])
const categories = ref([])
const showDialog = ref(false)
const isEdit = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const keyword = ref('')
const categoryId = ref('')

const form = reactive({
  id: null,
  name: '',
  categoryId: '',
  price: 0,
  stock: 100,
  heritageLevel: 0,
  description: '',
  coverImage: '',
})

const heritageLabels = ['', '县级', '州级', '省级', '国家级']

const priceValue = computed({
  get: () => form.price / 100,
  set: (val) => { form.price = Math.round(val * 100) },
})

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getAdminProductList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: keyword.value,
      categoryId: categoryId.value,
    })
    if (res.code === 0) {
      products.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 0) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const openDialog = (edit, row = null) => {
  isEdit.value = edit
  if (edit && row) {
    Object.assign(form, {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      price: row.price,
      stock: row.stock,
      heritageLevel: row.heritageLevel,
      description: row.description,
      coverImage: row.coverImage,
    })
  } else {
    Object.assign(form, {
      id: null, name: '', categoryId: '', price: 0, stock: 100, heritageLevel: 0, description: '', coverImage: ''
    })
  }
  showDialog.value = true
}

const handleSave = async () => {
  try {
    const res = await saveProduct(form)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      showDialog.value = false
      loadProducts()
    }
  } catch (error) {
    console.error('Failed to save:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该商品？此操作不可恢复。', '删除确认', { type: 'warning' })
    const res = await deleteProduct(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadProducts()
    }
  } catch (e) {
    if (e !== 'cancel') console.error('Failed to delete:', e)
  }
}

const handleStatusChange = (row) => {
  saveProduct({ id: row.id, status: row.status })
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped lang="scss">
.product-manage {
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

    .product-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .product-thumb {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
      }

      .product-name {
        font-weight: 500;
      }
    }

    .price {
      color: var(--chinese-red);
      font-weight: 600;
    }

    .text-muted {
      color: var(--text-light);
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid var(--border-color);
    }
  }

  :deep(.product-dialog) {
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
