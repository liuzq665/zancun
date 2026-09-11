<template>
  <div class="cart-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1>🛒 购物车</h1>
        <p>管理您的商品</p>
      </div>
    </div>

    <div class="container">
      <div class="cart-layout" v-loading="loading">
        <!-- 购物车列表 -->
        <div class="cart-main" v-if="cartItems.length > 0">
          <!-- 表头 -->
          <div class="cart-header">
            <el-checkbox v-model="selectAll" @change="handleSelectAll" class="select-all">
              全选
            </el-checkbox>
            <span class="header-product">商品</span>
            <span class="header-price">单价</span>
            <span class="header-quantity">数量</span>
            <span class="header-subtotal">小计</span>
            <span class="header-action">操作</span>
          </div>

          <!-- 商品列表 -->
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <el-checkbox
                v-model="item.selected"
                @change="updateSelectStatus(item)"
                class="item-checkbox"
              />

              <div class="item-product">
                <el-image
                  :src="item.coverImage || 'https://via.placeholder.com/100x100?text=商品'"
                  class="product-image"
                  fit="cover"
                />
                <div class="product-info">
                  <h4 class="product-name">{{ item.name }}</h4>
                  <p class="product-desc">{{ item.heritageDesc || '苗族非遗手工艺品' }}</p>
                </div>
              </div>

              <div class="item-price">
                ¥{{ (item.price / 100).toFixed(2) }}
              </div>

              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.stock || 99"
                  size="small"
                  @change="handleQuantityChange(item)"
                />
              </div>

              <div class="item-subtotal">
                ¥{{ ((item.price * item.quantity) / 100).toFixed(2) }}
              </div>

              <div class="item-action">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  plain
                  @click="handleRemove(item.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 空购物车 -->
        <div class="cart-empty" v-else>
          <div class="empty-icon">🛒</div>
          <h3>购物车是空的</h3>
          <p>快去挑选心仪的商品吧</p>
          <el-button type="primary" @click="$router.push('/products')">
            去购物
          </el-button>
        </div>

        <!-- 结算栏 -->
        <div class="cart-footer" v-if="cartItems.length > 0">
          <div class="footer-left">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">
              全选
            </el-checkbox>
            <span class="selected-count">
              已选 {{ selectedCount }} 件商品
            </span>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span class="total-label">合计：</span>
              <span class="total-price">¥{{ totalPrice }}</span>
            </div>
            <el-button
              type="primary"
              class="checkout-btn"
              :disabled="selectedCount === 0"
              :loading="checkout"
              @click="handleCheckout"
            >
              去结算 ({{ selectedCount }})
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCartList, updateCartItem, removeCartItem, selectAllCart } from '@/api/cart'
import { createOrder } from '@/api/ticket'

const router = useRouter()
const loading = ref(false)
const cartItems = ref([])

// 全选状态
const selectAll = computed({
  get: () => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  },
  set: (val) => {
    cartItems.value.forEach(item => {
      item.selected = val
    })
  }
})

// 已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

// 总价
const totalPrice = computed(() => {
  const total = cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return (total / 100).toFixed(2)
})

// 获取购物车列表
const fetchCartList = async () => {
  loading.value = true
  try {
    const res = await getCartList()
    if (res.code === 0) {
      // 后端 selected 是 0/1，el-checkbox 的 v-model 需要布尔值，否则渲染成未勾选
      cartItems.value = (res.data || []).map((item) => ({ ...item, selected: !!item.selected }))
    } else {
      ElMessage.error(res.message || '获取购物车失败')
    }
  } catch (error) {
    ElMessage.error('获取购物车失败')
  } finally {
    loading.value = false
  }
}

// 全选（要落库，否则刷新后选择状态丢失）
const handleSelectAll = async (val) => {
  selectAll.value = val
  try {
    await selectAllCart({ selected: val ? 1 : 0 })
  } catch (error) {
    console.error('Failed to select all:', error)
  }
}

// 单项勾选落库
const updateSelectStatus = async (item) => {
  try {
    const res = await updateCartItem(item.id, { selected: item.selected ? 1 : 0 })
    if (res.code !== 0) ElMessage.error(res.message || '操作失败')
  } catch (error) {
    console.error('Failed to update selection:', error)
  }
}

// 数量变化
const handleQuantityChange = async (item) => {
  try {
    const res = await updateCartItem(item.id, { quantity: item.quantity })
    if (res.code === 0) {
      ElMessage.success('数量已更新')
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('Failed to update quantity:', error)
  }
}

// 删除商品
const handleRemove = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这件商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return // 用户取消，不是错误
  }

  try {
    const res = await removeCartItem(id)
    if (res.code === 0) {
      cartItems.value = cartItems.value.filter(item => item.id !== id)
      ElMessage.success('已删除')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    // 以前这里静默失败，删除出问题时用户看不到任何反馈
    console.error('Failed to remove cart item:', error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 去结算
const checkout = ref(false)
const handleCheckout = async () => {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  if (selectedItems.length > 1) {
    // 后端没有订单明细表，一次只能对一件商品下单（与小程序端一致的限制）
    ElMessage.warning('暂不支持多件商品合并结算，请只勾选一件')
    return
  }

  const item = selectedItems[0]
  checkout.value = true
  try {
    const res = await createOrder({
      orderType: 'product',
      relatedId: item.productId,
      quantity: item.quantity,
    })
    if (res.code === 0) {
      // 下单成功后把该商品移出购物车
      await removeCartItem(item.id)
      ElMessage.success('下单成功，请前往订单中心支付')
      router.push('/orders')
    } else {
      ElMessage.error(res.message || '下单失败')
    }
  } catch (error) {
    console.error('Checkout failed:', error)
  } finally {
    checkout.value = false
  }
}

onMounted(() => {
  fetchCartList()
})
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 100px;
}

.page-header {
  background: linear-gradient(135deg, #1a365d 0%, #6b21a8 50%, #1a365d 100%);
  padding: 40px 0;
  color: white;
  text-align: center;

  h1 {
    font-size: 32px;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
  }
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-layout {
  margin-top: 30px;
}

.cart-main {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-light);
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-light);

  .select-all {
    width: 100px;
  }

  .header-product {
    flex: 1;
  }

  .header-price,
  .header-quantity,
  .header-subtotal {
    width: 120px;
    text-align: center;
  }

  .header-action {
    width: 60px;
    text-align: center;
  }
}

.cart-items {
  padding: 0 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  .item-checkbox {
    width: 100px;
  }

  .item-product {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;

    .product-image {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .product-info {
      .product-name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-color);
      }

      .product-desc {
        font-size: 13px;
        color: var(--text-light);
      }
    }
  }

  .item-price {
    width: 120px;
    text-align: center;
    font-weight: 600;
    color: var(--text-color);
  }

  .item-quantity {
    width: 120px;
    display: flex;
    justify-content: center;
  }

  .item-subtotal {
    width: 120px;
    text-align: center;
    font-weight: 600;
    color: var(--chinese-red);
  }

  .item-action {
    width: 60px;
    display: flex;
    justify-content: center;
  }
}

.cart-empty {
  background: white;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;

  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 12px;
    color: var(--text-color);
  }

  p {
    color: var(--text-light);
    margin-bottom: 24px;
  }
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  .footer-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .selected-count {
      color: var(--text-light);
      font-size: 14px;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .total-info {
      text-align: right;

      .total-label {
        font-size: 14px;
        color: var(--text-light);
      }

      .total-price {
        font-size: 24px;
        font-weight: 700;
        color: var(--chinese-red);
        margin-left: 8px;
      }
    }

    .checkout-btn {
      height: 48px;
      padding: 0 40px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
      border-radius: 24px;

      &:disabled {
        background: #ccc;
      }
    }
  }
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
    background: var(--bg-light);
    border-radius: 12px;
    margin-bottom: 12px;

    .item-checkbox {
      position: absolute;
      top: 16px;
      left: 16px;
    }

    .item-product {
      width: calc(100% - 40px);
      padding-left: 30px;
    }

    .item-price,
    .item-quantity,
    .item-subtotal {
      width: auto;
      text-align: left;
    }

    .item-action {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }
}
</style>
