<template>
  <div class="product-detail-page">
    <!-- 顶部导航 -->
    <div class="detail-nav">
      <div class="nav-content container">
        <router-link to="/" class="nav-home">
          <el-icon><HomeFilled /></el-icon>
          首页
        </router-link>
        <span class="nav-sep">/</span>
        <router-link to="/products" class="nav-category">非遗商品</router-link>
        <span class="nav-sep">/</span>
        <span class="nav-current">{{ product.name || '商品详情' }}</span>
      </div>
    </div>

    <div class="container">
      <div class="product-content" v-loading="loading">
        <div class="product-main">
          <!-- 左侧图片展示 -->
          <div class="product-gallery">
            <div class="main-image-wrap">
              <el-image :src="currentImage" fit="cover" class="main-image" :preview-src-list="previewImages" preview-teleported />
              <div class="heritage-badge" v-if="product.heritageLevel > 0">
                <el-icon><Star /></el-icon>
                {{ heritageLabels[product.heritageLevel] }}
              </div>
            </div>
            <div class="thumbnail-list" v-if="product.images && product.images.length > 1">
              <div
                v-for="(img, idx) in product.images"
                :key="idx"
                class="thumbnail"
                :class="{ active: currentImage === img }"
                @click="currentImage = img"
              >
                <el-image :src="img" fit="cover" @click="currentImage = img" />
              </div>
            </div>
          </div>

          <!-- 右侧商品信息 -->
          <div class="product-info">
            <div class="product-header">
              <div class="category-tag" v-if="product.category">
                <el-icon><Goods /></el-icon>
                {{ product.category.name }}
              </div>
              <h1 class="product-name">{{ product.name }}</h1>
              <p class="product-subtitle">{{ product.description }}</p>
            </div>

            <div class="product-highlight">
              <div class="highlight-item">
                <span class="highlight-label">销量</span>
                <span class="highlight-value">{{ product.salesCount || 0 }} 件</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-label">收藏</span>
                <span class="highlight-value">{{ product.collectCount || 0 }}</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-label">评价</span>
                <span class="highlight-value">{{ product.commentCount || 0 }} 条</span>
              </div>
            </div>

            <div class="product-price-section">
              <div class="price-main">
                <span class="price-label">优享价</span>
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ (product.price / 100).toFixed(2) }}</span>
              </div>
              <div class="price-original" v-if="product.originalPrice">
                <span>市场价</span>
                <span class="original-price">¥{{ (product.originalPrice / 100).toFixed(2) }}</span>
              </div>
              <div class="stock-info">
                <el-icon><Box /></el-icon>
                库存 <span class="stock-count">{{ product.stock }}</span> 件
              </div>
            </div>

            <div class="product-specs" v-if="product.specs">
              <h4>
                <el-icon><Document /></el-icon>
                规格参数
              </h4>
              <div class="specs-content" v-html="product.specs"></div>
            </div>

            <div class="product-sku" v-if="skus.length > 0">
              <h4>
                <el-icon><Collection /></el-icon>
                选择规格
              </h4>
              <div class="sku-list">
                <div
                  v-for="sku in skus"
                  :key="sku.id"
                  class="sku-item"
                  :class="{ active: selectedSku === sku.id, disabled: sku.stock <= 0 }"
                  @click="selectSku(sku)"
                >
                  <span class="sku-name">{{ sku.specName }}</span>
                  <span class="sku-price">¥{{ (sku.price / 100).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="product-actions">
              <div class="quantity-section">
                <span class="quantity-label">数量</span>
                <div class="quantity-input">
                  <el-button :disabled="quantity <= 1" @click="quantity--" circle>
                    <el-icon><Minus /></el-icon>
                  </el-button>
                  <el-input-number v-model="quantity" :min="1" :max="product.stock" :controls="false" />
                  <el-button :disabled="quantity >= product.stock" @click="quantity++" circle>
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="action-buttons">
                <el-button type="primary" size="large" class="btn-buy" :loading="buying" @click="handleBuy">
                  <el-icon><ShoppingCart /></el-icon>
                  立即购买
                </el-button>
                <el-button size="large" class="btn-cart" :loading="addingCart" @click="handleAddCart">
                  <el-icon><ShoppingCart /></el-icon>
                  加入购物车
                </el-button>
                <el-button size="large" circle @click="handleCollect">
                  <el-icon><Star :class="{ 'is-collected': collected }" /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="product-service">
              <div class="service-item">
                <el-icon><CircleCheck /></el-icon>
                <span>7天无理由退换</span>
              </div>
              <div class="service-item">
                <el-icon><Medal /></el-icon>
                <span>正品保证</span>
              </div>
              <div class="service-item">
                <el-icon><Van /></el-icon>
                <span>极速发货</span>
              </div>
              <div class="service-item">
                <el-icon><Headset /></el-icon>
                <span>专属客服</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品详情区域 -->
        <div class="product-detail">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-content" v-html="product.detail || '<div class=\'empty-detail\'><p>暂无详细描述</p></div>'"></div>
            </el-tab-pane>
            <el-tab-pane label="非遗介绍" name="heritage" v-if="product.heritageLevel > 0">
              <div class="heritage-content">
                <div class="heritage-header">
                  <div class="heritage-icon">
                    <img src="https://images.pexels.com/photos/33451390/pexels-photo-33451390.jpeg?auto=compress&cs=tinysrgb&w=800" alt="非遗" />
                  </div>
                  <div class="heritage-info">
                    <h3>非遗文化传承</h3>
                    <p>{{ heritageLabels[product.heritageLevel] }} · 传统工艺</p>
                  </div>
                </div>
                <div class="heritage-desc">
                  <p>本产品为{{ heritageLabels[product.heritageLevel] }}项目传承人亲手制作，每一道工序都凝聚着匠人的心血与智慧。</p>
                  <p v-if="product.craftsman">传承人：{{ product.craftsman }}</p>
                  <p>苗族银饰锻造技艺历史悠久，是国家级非物质文化遗产。每一件银饰都承载着苗族人民对美好生活的向往和对祖先的敬仰。</p>
                  <p>这些精美的手工艺品不仅是装饰品，更是苗族文化的载体，是您收藏或送礼的绝佳选择。</p>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="`评价 (${product.commentCount || 0})`" name="comments">
              <div class="comments-section">
                <div class="comments-empty" v-if="!comments.length">
                  <el-empty description="暂无评价，期待您的购买体验！" />
                </div>
                <div v-else class="comments-list">
                  <div v-for="comment in comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <el-avatar :size="40">{{ comment.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
                      <div class="comment-user">
                        <span class="username">{{ comment.user?.nickname || '匿名用户' }}</span>
                        <el-rate v-model="comment.rating" disabled size="small" />
                      </div>
                      <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                    </div>
                    <div class="comment-content">
                      <p>{{ comment.content }}</p>
                      <div class="comment-images" v-if="comment.images && comment.images.length">
                        <el-image
                          v-for="(img, idx) in comment.images"
                          :key="idx"
                          :src="img"
                          fit="cover"
                          class="comment-img"
                          :preview-src-list="comment.images"
                          preview-teleported
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled, Star, Goods, Box, Document, Collection,
  Minus, Plus, ShoppingCart, CircleCheck, Medal, Van, Headset
} from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { addToCart } from '@/api/cart'
import { toggleFavorite } from '@/api/community'
import { createOrder } from '@/api/ticket'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { updateSeo, generateProductSchema, injectSchemaScript } from '@/composables/useSeo'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const addingCart = ref(false)
const buying = ref(false)
const collected = ref(false)
const product = ref({})
const quantity = ref(1)
const activeTab = ref('detail')
const selectedSku = ref(null)
const skus = ref([])
const comments = ref([])

const heritageLabels = ['', '县级非遗', '州级非遗', '省级非遗', '国家级非遗']

const currentImage = computed(() => {
  if (product.value.images && product.value.images.length > 0) {
    return product.value.images[0]
  }
  return product.value.coverImage || '/placeholder.svg'
})

const previewImages = computed(() => {
  if (product.value.images && product.value.images.length > 0) {
    return product.value.images
  }
  return [product.value.coverImage || '/placeholder.svg']
})

const loadProduct = async () => {
  loading.value = true
  try {
    const res = await getProductDetail(route.params.id)
    if (res.code === 0) {
      product.value = res.data
      skus.value = res.data.skus || []
      comments.value = res.data.comments || []

      // 更新页面 SEO
      updateSeo({
        title: product.value.name,
        description: product.value.description,
        image: product.value.coverImage,
        url: `https://wudong.travel/products/${product.value.id}`,
        type: 'product',
      })

      // 注入结构化数据
      injectSchemaScript(generateProductSchema(product.value))
    }
  } catch (error) {
    console.error('Failed to load product:', error)
  } finally {
    loading.value = false
  }
}

const selectSku = (sku) => {
  if (sku.stock <= 0) return
  selectedSku.value = sku.id
}

const handleBuy = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!product.value.id) {
    ElMessage.error('商品信息未加载完成')
    return
  }
  if (product.value.stock !== undefined && product.value.stock <= 0) {
    ElMessage.warning('该商品已售罄')
    return
  }

  buying.value = true
  try {
    // 服务端会按 relatedId 重算价格并扣库存（客户端不传价）
    const res = await createOrder({
      orderType: 'product',
      relatedId: product.value.id,
      quantity: quantity.value,
    })
    if (res.code === 0) {
      ElMessage.success('下单成功，请前往订单中心支付')
      router.push('/orders')
    } else {
      ElMessage.error(res.message || '下单失败')
    }
  } catch (error) {
    console.error('Failed to create order:', error)
  } finally {
    buying.value = false
  }
}

const handleAddCart = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!product.value.id) {
    ElMessage.error('商品信息未加载完成')
    return
  }
  if (product.value.stock !== undefined && product.value.stock <= 0) {
    ElMessage.warning('该商品已售罄')
    return
  }

  addingCart.value = true
  try {
    const res = await addToCart({ productId: product.value.id, quantity: quantity.value })
    if (res.code === 0) {
      ElMessage.success('已加入购物车')
    } else {
      ElMessage.error(res.message || '加入购物车失败')
    }
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    addingCart.value = false
  }
}

const handleCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    const res = await toggleFavorite(userStore.user.id, 'product', product.value.id)
    if (res.code === 0) {
      collected.value = !!res.data?.favorited
      ElMessage.success(collected.value ? '已收藏' : '已取消收藏')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped lang="scss">
.product-detail-page {
  background: var(--bg-gradient);
  min-height: 100vh;
}

// 顶部导航
.detail-nav {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 16px 0;

  .nav-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .nav-home {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-light);

    &:hover {
      color: var(--accent-color);
    }
  }

  .nav-sep {
    color: var(--text-muted);
  }

  .nav-category {
    color: var(--text-light);

    &:hover {
      color: var(--accent-color);
    }
  }

  .nav-current {
    color: var(--text-color);
    font-weight: 500;
  }
}

.product-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px;
  margin: 30px auto;
  box-shadow: var(--shadow-md);
}

.product-main {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 60px;
  margin-bottom: 60px;
}

// 左侧图片展示
.product-gallery {
  .main-image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-light);
    margin-bottom: 20px;

    .main-image {
      width: 100%;
      height: 100%;
    }

    .heritage-badge {
      position: absolute;
      top: 20px;
      left: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
      color: white;
      padding: 10px 20px;
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--accent-color);
      }

      &.active {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
      }

      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

// 右侧商品信息
.product-info {
  .product-header {
    margin-bottom: 24px;

    .category-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(26, 54, 93, 0.08);
      color: var(--primary-color);
      padding: 6px 16px;
      border-radius: var(--radius-full);
      font-size: 13px;
      margin-bottom: 16px;
    }

    .product-name {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .product-subtitle {
      font-size: 16px;
      color: var(--text-light);
      line-height: 1.8;
    }
  }

  .product-highlight {
    display: flex;
    gap: 40px;
    padding: 16px 0;
    border-top: 1px dashed var(--border-color);
    border-bottom: 1px dashed var(--border-color);
    margin-bottom: 24px;

    .highlight-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .highlight-label {
        font-size: 13px;
        color: var(--text-muted);
      }

      .highlight-value {
        font-size: 16px;
        color: var(--text-color);
        font-weight: 600;
      }
    }
  }

  .product-price-section {
    background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
    padding: 24px;
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
    border: 1px solid rgba(212, 175, 55, 0.2);

    .price-main {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;

      .price-label {
        font-size: 14px;
        color: var(--text-light);
      }

      .price-symbol {
        font-size: 24px;
        color: var(--chinese-red);
        font-weight: 600;
      }

      .price-value {
        font-size: 42px;
        color: var(--chinese-red);
        font-weight: 700;
      }
    }

    .price-original {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--text-muted);

      .original-price {
        text-decoration: line-through;
      }
    }

    .stock-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--nature-green);

      .stock-count {
        font-weight: 600;
      }
    }
  }

  .product-specs,
  .product-sku {
    margin-bottom: 24px;

    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      color: var(--text-color);
      margin-bottom: 16px;
      font-weight: 600;

      .el-icon {
        color: var(--accent-color);
      }
    }
  }

  .specs-content {
    font-size: 14px;
    color: var(--text-light);
    line-height: 2;
  }

  .sku-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .sku-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 24px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover:not(.disabled) {
        border-color: var(--accent-color);
      }

      &.active {
        border-color: var(--accent-color);
        background: rgba(212, 175, 55, 0.08);
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .sku-name {
        font-size: 14px;
        color: var(--text-color);
        margin-bottom: 4px;
      }

      .sku-price {
        font-size: 16px;
        color: var(--chinese-red);
        font-weight: 600;
      }
    }
  }

  .product-actions {
    margin-bottom: 30px;

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;

      .quantity-label {
        font-size: 14px;
        color: var(--text-light);
      }

      .quantity-input {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.el-input-number) {
          width: 80px;

          .el-input__wrapper {
            padding: 0 12px;
            text-align: center;
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 16px;

      .btn-buy {
        flex: 1;
        background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
        border: none;
        font-size: 18px;
        padding: 18px 40px;
        border-radius: var(--radius-lg);

        &:hover {
          background: linear-gradient(135deg, var(--chinese-red-light), var(--chinese-red));
        }
      }

      .btn-cart {
        flex: 1;
        background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
        border: none;
        color: white;
        font-size: 18px;
        padding: 18px 40px;
        border-radius: var(--radius-lg);

        &:hover {
          background: linear-gradient(135deg, var(--accent-light), var(--accent-color));
        }
      }

      :deep(.el-button.is-circle) {
        width: 52px;
        height: 52px;
        border: 2px solid var(--border-color);

        &:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }
      }
    }
  }

  .product-service {
    display: flex;
    gap: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);

    .service-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-light);

      .el-icon {
        color: var(--nature-green);
        font-size: 18px;
      }
    }
  }
}

// 商品详情区域
.product-detail {
  border-top: 1px solid var(--border-color);
  padding-top: 40px;

  .detail-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 30px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 2px;
      background: var(--border-color);
    }

    :deep(.el-tabs__item) {
      font-size: 16px;
      font-weight: 500;
      padding: 0 30px;

      &.is-active {
        color: var(--accent-color);
      }
    }

    :deep(.el-tabs__active-bar) {
      height: 3px;
      background: var(--accent-color);
    }
  }

  .detail-content {
    font-size: 15px;
    line-height: 2;
    color: var(--text-color);

    :deep(img) {
      max-width: 100%;
      border-radius: var(--radius-md);
      margin: 16px 0;
    }

    :deep(p) {
      margin-bottom: 16px;
    }

    .empty-detail {
      text-align: center;
      padding: 60px;
      color: var(--text-muted);
    }
  }

  .heritage-content {
    .heritage-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 30px;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
      border-radius: var(--radius-lg);
      margin-bottom: 30px;

      .heritage-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--accent-color);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .heritage-info {
        h3 {
          font-size: 24px;
          color: var(--primary-color);
          margin-bottom: 8px;
        }

        p {
          color: var(--accent-dark);
          font-size: 15px;
        }
      }
    }

    .heritage-desc {
      p {
        font-size: 16px;
        line-height: 2;
        color: var(--text-color);
        margin-bottom: 16px;
      }
    }
  }

  .comments-section {
    .comments-empty {
      padding: 60px;
    }

    .comment-item {
      padding: 24px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .comment-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;

        .comment-user {
          flex: 1;

          .username {
            font-weight: 600;
            margin-right: 12px;
          }
        }

        .comment-time {
          color: var(--text-muted);
          font-size: 13px;
        }
      }

      .comment-content {
        padding-left: 56px;

        p {
          font-size: 15px;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .comment-images {
          display: flex;
          gap: 12px;

          .comment-img {
            width: 100px;
            height: 100px;
            border-radius: var(--radius-md);
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .product-main {
    grid-template-columns: 400px 1fr;
    gap: 40px;
  }
}

@media (max-width: 992px) {
  .product-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .product-gallery {
    .main-image-wrap {
      max-width: 500px;
      margin: 0 auto;
    }
  }
}

@media (max-width: 768px) {
  .product-content {
    padding: 20px;
    margin: 16px auto;
    border-radius: var(--radius-lg);
  }

  .product-info {
    .product-header {
      .product-name {
        font-size: 24px;
      }
    }

    .product-price-section {
      .price-value {
        font-size: 32px;
      }
    }

    .product-actions {
      .action-buttons {
        flex-wrap: wrap;

        .btn-buy,
        .btn-cart {
          flex: 1 1 45%;
        }
      }
    }

    .product-service {
      flex-wrap: wrap;
      gap: 16px;
    }
  }
}
</style>
