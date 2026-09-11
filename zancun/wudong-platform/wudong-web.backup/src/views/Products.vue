<template>
  <div class="products-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>非遗商品</h1>
        <p>苗族银饰、蜡染、刺绣等传统手工艺品</p>
      </div>
    </div>

    <div class="container">
      <!-- 分类筛选 -->
      <div class="category-section">
        <div class="category-header">
          <h2>商品分类</h2>
        </div>
        <div class="category-tabs">
          <div
            class="category-tab"
            :class="{ active: selectedCategory === null }"
            @click="handleCategoryChange(null)"
          >
            <div class="tab-icon">🏺</div>
            <span>全部</span>
          </div>
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-tab"
            :class="{ active: selectedCategory === cat.id }"
            @click="handleCategoryChange(cat.id)"
          >
            <div class="tab-icon">{{ getCategoryIcon(cat.icon) }}</div>
            <span>{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="product-section">
        <div class="section-header">
          <h2>精选商品</h2>
          <div class="header-right">
            <el-tag v-if="keyword" closable type="warning" size="large" @close="clearKeyword">
              搜索：{{ keyword }}
            </el-tag>
            <span class="product-count">共 {{ pagination.total }} 件</span>
          </div>
        </div>

        <div class="product-list" v-loading="loading">
          <div v-if="products.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🎨</div>
            <p>{{ keyword ? `没有找到与「${keyword}」相关的商品` : '暂无商品' }}</p>
            <el-button v-if="keyword" type="primary" plain @click="clearKeyword">清除搜索</el-button>
          </div>

          <div class="product-grid">
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card card"
              @click="$router.push(`/products/${product.id}`)"
            >
              <div class="product-image">
                <el-image
                  :src="product.coverImage || '/placeholder.svg'"
                  :alt="product.name"
                  fit="cover"
                  class="image"
                />
                <div class="image-overlay">
                  <el-icon><View /></el-icon>
                  <span>查看详情</span>
                </div>
                <span class="heritage-badge" v-if="product.heritageLevel > 0">
                  <el-icon><Medal /></el-icon>
                  {{ heritageLabels[product.heritageLevel] }}
                </span>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-desc">{{ product.description }}</p>
                <div class="product-meta">
                  <span class="category-tag">{{ product.category?.name }}</span>
                  <span class="sales">已售 {{ product.salesCount || 0 }}</span>
                </div>
                <div class="product-price-row">
                  <div class="price-info">
                    <span class="current-price">¥{{ (product.price / 100).toFixed(2) }}</span>
                    <span class="original-price" v-if="product.originalPrice">
                      ¥{{ (product.originalPrice / 100).toFixed(2) }}
                    </span>
                  </div>
                  <span class="unit">/{{ product.unit }}</span>
                </div>
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
            @current-change="loadProducts"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { View, Medal } from '@element-plus/icons-vue'
import { getCategoryList, getProductList } from '@/api/product'

const route = useRoute()
const loading = ref(false)
const categories = ref([])
const selectedCategory = ref(null)
const keyword = ref('')
const products = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0,
})

const heritageLabels = ['', '县级非遗', '州级非遗', '省级非遗', '国家级非遗']

const getCategoryIcon = (icon) => {
  const icons = {
    yinshi: '✨',
    laran: '🎨',
    cixiu: '🧵',
    lusheng: '🎵',
    zhubian: '🪢',
    qita: '🏺',
  }
  return icons[icon] || '🏺'
}

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 0) categories.value = res.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      categoryId: selectedCategory.value,
      keyword: keyword.value || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    if (res.code === 0) {
      products.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId
  pagination.page = 1
  loadProducts()
}

const clearKeyword = () => {
  keyword.value = ''
  pagination.page = 1
  loadProducts()
}

// 顶栏搜索会跳到 /products?keyword=xxx，这里要读 query 才真正筛得出来
const syncKeywordFromRoute = () => {
  keyword.value = route.query.keyword ? String(route.query.keyword) : ''
  pagination.page = 1
  loadProducts()
}

watch(() => route.query.keyword, syncKeywordFromRoute)

onMounted(() => {
  loadCategories()
  syncKeywordFromRoute()
})
</script>

<style scoped lang="scss">
.products-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-hero {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #6b21a8 0%, #1a365d 50%, #6b21a8 100%);
  background-image: url('https://images.pexels.com/photos/29737163/pexels-photo-29737163.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(107, 33, 168, 0.9) 0%, rgba(26, 54, 93, 0.85) 50%, rgba(107, 33, 168, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(107, 33, 168, 0.8) 0%, rgba(26, 54, 93, 0.7) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;

    h1 {
      font-size: 42px;
      font-weight: 600;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    p {
      font-size: 18px;
      opacity: 0.9;
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.category-section {
  margin-top: -50px;
  position: relative;
  z-index: 10;
  margin-bottom: 40px;

  .category-header {
    margin-bottom: 16px;

    h2 {
      font-size: 20px;
      color: var(--primary-color);
    }
  }

  .category-tabs {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 8px 0;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .category-tab {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    background: white;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 16px rgba(26, 54, 93, 0.08);
    border: 2px solid transparent;

    .tab-icon {
      font-size: 32px;
    }

    span {
      font-size: 14px;
      color: var(--text-color);
      font-weight: 500;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(26, 54, 93, 0.15);
    }

    &.active {
      border-color: var(--accent-color);
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));

      span {
        color: var(--accent-color);
      }
    }
  }
}

.product-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      color: var(--primary-color);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, var(--accent-color), transparent);
        border-radius: 2px;
      }
    }

    .header-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .product-count {
      color: var(--text-light);
      font-size: 14px;
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.product-card {
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 48px rgba(26, 54, 93, 0.18);

    .image-overlay {
      opacity: 1;
    }

    .image {
      transform: scale(1.08);
    }
  }

  .product-image {
    position: relative;
    height: 220px;
    overflow: hidden;

    .image {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 54, 93, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: white;
      opacity: 0;
      transition: opacity 0.3s;

      .el-icon {
        font-size: 32px;
      }

      span {
        font-size: 14px;
      }
    }

    .heritage-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #d4af37, #b8960c);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .product-info {
    padding: 20px;

    .product-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-desc {
      font-size: 13px;
      color: var(--text-light);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 12px;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .category-tag {
        background: rgba(26, 54, 93, 0.08);
        color: var(--primary-color);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
      }

      .sales {
        color: var(--text-light);
        font-size: 12px;
      }
    }

    .product-price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .price-info {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .current-price {
        color: var(--chinese-red);
        font-size: 22px;
        font-weight: 700;
      }

      .original-price {
        color: var(--text-light);
        font-size: 13px;
        text-decoration: line-through;
      }

      .unit {
        color: var(--text-light);
        font-size: 13px;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  p {
    font-size: 16px;
    color: var(--text-light);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .category-section {
    margin-top: -30px;

    .category-tab {
      padding: 12px 16px;

      .tab-icon {
        font-size: 24px;
      }
    }
  }
}
</style>
