<template>
  <div class="restaurant-detail-page">
    <!-- Hero Section -->
    <div class="detail-hero" :style="{ backgroundImage: `url(${restaurant.coverImage || 'https://images.pexels.com/photos/34156954/pexels-photo-34156954.jpeg?auto=compress&cs=tinysrgb&w=800'})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>{{ restaurant.name }}</h1>
        <div class="hero-meta">
          <el-rate v-model="restaurant.rating" disabled show-score />
          <span class="avg-price">人均 ¥{{ (restaurant.avgPrice / 100).toFixed(0) }}</span>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/restaurants' }">特色美食</el-breadcrumb-item>
          <el-breadcrumb-item>{{ restaurant.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="restaurant-content" v-loading="loading" v-if="restaurant.id">
        <!-- 基本信息 -->
        <div class="restaurant-header card">
          <div class="header-info">
            <div class="restaurant-tags">
              <el-tag v-for="tag in restaurant.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            </div>
            <p class="restaurant-desc">{{ restaurant.description }}</p>
            <div class="restaurant-meta">
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ restaurant.address }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ restaurant.businessHours }}</span>
              </div>
              <div class="meta-item" v-if="restaurant.phone">
                <el-icon><Phone /></el-icon>
                <span>{{ restaurant.phone }}</span>
              </div>
              <div class="meta-item location-action" v-if="restaurant.latitude && restaurant.longitude">
                <el-button type="primary" @click="fetchUserLocation" :loading="!showUserLocation && userLocation !== null" size="small">
                  <el-icon><Position /></el-icon>
                  {{ showUserLocation ? '已定位' : '显示我的位置' }}
                </el-button>
                <span v-if="distance" class="distance-badge">距您 {{ formatDistance(distance) }}</span>
                <el-button type="success" @click="navigateToRestaurant" size="small">
                  <el-icon><MapLocation /></el-icon>
                  导航
                </el-button>
                <el-button @click="startNavigation" size="small">
                  <el-icon><Position /></el-icon>
                  一键导航
                </el-button>
              </div>
            </div>
          </div>
          <div class="header-image">
            <el-image
              :src="restaurant.coverImage || '/placeholder.svg'"
              :alt="restaurant.name"
              fit="cover"
              class="cover-image"
            />
          </div>
        </div>

        <!-- 特色推荐 -->
        <div class="restaurant-section" v-if="dishes.length > 0">
          <div class="section-header">
            <h2>特色菜品</h2>
            <span class="count">共 {{ dishes.length }} 道</span>
          </div>
          <div class="dish-grid">
            <div v-for="dish in dishes" :key="dish.id" class="dish-card card">
              <div class="dish-image">
                <img :src="dish.coverImage || '/placeholder.svg'" :alt="dish.name" />
                <span class="dish-category">{{ dish.category }}</span>
              </div>
              <div class="dish-info">
                <h4>{{ dish.name }}</h4>
                <p class="dish-desc">{{ dish.description }}</p>
                <div class="dish-footer">
                  <span class="dish-price">¥{{ (dish.price / 100).toFixed(0) }}</span>
                  <el-button
                    :type="selectedDishes.some(d => d.id === dish.id) ? 'warning' : 'primary'"
                    size="small"
                    @click="handleOrderDish(dish)"
                    class="order-btn"
                  >
                    <el-icon><ShoppingCart /></el-icon>
                    {{ selectedDishes.some(d => d.id === dish.id) ? `已选 ¥${(dish.price / 100).toFixed(0)}` : '点餐' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订座服务 -->
        <div class="restaurant-section">
          <div class="section-header">
            <h2>在线订座</h2>
          </div>
          <div class="booking-card card">
            <div class="booking-header">
              <el-icon><Calendar /></el-icon>
              <span>预约用餐时间</span>
            </div>
            <div class="booking-form">
              <el-form :model="bookingForm" label-width="100px">
                <el-row :gutter="24">
                  <el-col :span="8">
                    <el-form-item label="用餐日期">
                      <el-date-picker v-model="bookingForm.date" type="date" placeholder="选择日期" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="用餐时间">
                      <el-time-select v-model="bookingForm.time" placeholder="选择时间" start="10:00" step="00:30" end="21:00" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="用餐人数">
                      <el-input-number v-model="bookingForm.guests" :min="1" :max="20" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="联系人">
                      <el-input v-model="bookingForm.contact" placeholder="请输入联系人姓名" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="联系电话">
                      <el-input
                        v-model="bookingForm.phone"
                        placeholder="请输入 11 位手机号"
                        maxlength="11"
                        @input="bookingForm.phone = sanitizePhone($event)"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="预点菜" v-if="selectedDishes.length">
                  <div class="selected-dishes">
                    <el-tag
                      v-for="d in selectedDishes"
                      :key="d.id"
                      closable
                      type="warning"
                      @close="removeDish(d)"
                    >
                      {{ d.name }} ¥{{ (d.price / 100).toFixed(0) }}
                    </el-tag>
                    <span class="dishes-tip">将随订座一并提交</span>
                  </div>

                  <!-- 费用明细 -->
                  <div class="bill">
                    <div class="bill-row" v-for="d in selectedDishes" :key="'b' + d.id">
                      <span class="bill-name">{{ d.name }}</span>
                      <span class="bill-price">¥{{ (d.price / 100).toFixed(2) }}</span>
                    </div>
                    <div class="bill-total">
                      <span>合计（{{ selectedDishes.length }} 道菜）</span>
                      <span class="total">¥{{ dishesTotal }}</span>
                    </div>
                    <p class="bill-tip">餐位免费预约，费用以到店实际消费为准</p>
                  </div>
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="bookingForm.remark" type="textarea" :rows="2" placeholder="其他要求（选填）" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="large" :loading="booking" @click="handleBooking" class="book-btn">
                    <el-icon><Calendar /></el-icon>
                    立即预订
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>

        <!-- 用户评价 -->
        <div class="restaurant-section">
          <div class="section-header">
            <h2>用户评价</h2>
            <span class="count">共 {{ reviews.length }} 条</span>
          </div>
          <div class="reviews-list" v-if="reviews.length > 0">
            <div v-for="review in reviews" :key="review.id" class="review-item card">
              <div class="review-header">
                <el-avatar :size="44" class="review-avatar">{{ review.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
                <div class="review-user">
                  <span class="username">{{ review.user?.nickname || '匿名用户' }}</span>
                  <el-rate v-model="review.rating" disabled size="small" />
                </div>
                <span class="review-time">{{ formatTime(review.createTime) }}</span>
              </div>
              <div class="review-content">
                <p>{{ review.content }}</p>
                <div class="review-images" v-if="review.images && review.images.length">
                  <el-image
                    v-for="(img, idx) in review.images"
                    :key="idx"
                    :src="img"
                    :preview-src-list="review.images"
                    fit="cover"
                    class="review-image"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-reviews card">
            <div class="empty-icon">🍽️</div>
            <p>暂无评价，期待您的光临！</p>
          </div>
        </div>
      </div>

      <!-- 餐厅不存在 / 已下架时的兜底，避免出现空白页 -->
      <div v-else-if="!loading" class="detail-empty">
        <el-empty description="餐厅不存在或已下架">
          <el-button type="primary" @click="$router.push('/restaurants')">返回餐饮美食</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Location, Clock, Phone, Calendar, ShoppingCart, MapLocation, Position } from '@element-plus/icons-vue'
import { getRestaurantDetail, getDishList, getReviewList } from '@/api/restaurant'
import { createOrder } from '@/api/ticket'
import { useUserStore } from '@/stores/user'
import { sanitizePhone, validatePhone } from '@/utils/validate'
import { ElMessage } from 'element-plus'
import { updateSeo, generateBusinessSchema, injectSchemaScript } from '@/composables/useSeo'
import { getUserLocation, calculateDistance, formatDistance as formatDistanceUtil, getNavigationUrl } from '@/utils/geo'

const route = useRoute()

const loading = ref(false)
const booking = ref(false)
const router = useRouter()
const userStore = useUserStore()
const restaurant = ref({})
const dishes = ref([])
const reviews = ref([])
const userLocation = ref(null)
const showUserLocation = ref(false)
const distance = computed(() => {
  if (!userLocation.value || !restaurant.value.latitude || !restaurant.value.longitude) return null
  return calculateDistance(
    userLocation.value.latitude,
    userLocation.value.longitude,
    parseFloat(restaurant.value.latitude),
    parseFloat(restaurant.value.longitude)
  )
})

const bookingForm = reactive({
  date: '',
  time: '',
  guests: 2,
  contact: '',
  phone: '',
  remark: '',
})

// 获取用户位置
const fetchUserLocation = async () => {
  try {
    userLocation.value = await getUserLocation()
    showUserLocation.value = true
  } catch (error) {
    ElMessage.warning('无法获取您的位置，请开启定位权限')
  }
}

// 导航到餐厅
const navigateToRestaurant = () => {
  if (!restaurant.value.latitude || !restaurant.value.longitude) return
  const destLat = parseFloat(restaurant.value.latitude)
  const destLng = parseFloat(restaurant.value.longitude)
  const url = getNavigationUrl(destLat, destLng, restaurant.value.name)
  window.open(url, '_blank')
}

// 一键导航
const startNavigation = async () => {
  if (!restaurant.value.latitude || !restaurant.value.longitude) return
  try {
    const loc = await getUserLocation()
    const destLat = parseFloat(restaurant.value.latitude)
    const destLng = parseFloat(restaurant.value.longitude)
    const url = getNavigationUrl(destLat, destLng, restaurant.value.name, loc.latitude, loc.longitude)
    window.open(url, '_blank')
  } catch (error) {
    navigateToRestaurant()
  }
}

// 格式化距离
const formatDistance = (dist) => {
  return formatDistanceUtil(dist)
}

const loadRestaurant = async () => {
  loading.value = true
  try {
    const res = await getRestaurantDetail(route.params.id)
    if (res.code === 0) {
      restaurant.value = res.data

      // 更新页面 SEO
      updateSeo({
        title: `${restaurant.value.name} - 乌东村特色美食`,
        description: `${restaurant.value.description || restaurant.value.name}。人均¥${(restaurant.value.avgPrice / 100).toFixed(0)}，地址：${restaurant.value.address}。乌东文旅平台提供在线预订服务。`,
        keywords: `${restaurant.value.name},乌东村美食,${(restaurant.value.tags || []).join(',')}`,
        image: restaurant.value.coverImage,
        url: `https://wudong.travel/restaurants/${restaurant.value.id}`,
        type: 'restaurant',
      })

      // 注入结构化数据
      injectSchemaScript(generateBusinessSchema(restaurant.value, 'Restaurant'))
    }
    // 菜品接口返回的是裸数组（不是 {list}）
    const dishRes = await getDishList(route.params.id)
    if (dishRes.code === 0) {
      dishes.value = Array.isArray(dishRes.data) ? dishRes.data : dishRes.data?.list || []
    }
    const reviewRes = await getReviewList(route.params.id)
    if (reviewRes.code === 0) {
      reviews.value = reviewRes.data?.list || []
    }
  } catch (error) {
    console.error('Failed to load restaurant:', error)
  } finally {
    loading.value = false
  }
}

// 点餐清单：后端没有「按菜品下单」的模型，预选的菜会随订座一并提交为备注
const selectedDishes = ref([])

// 预点菜合计（价格是「分」，展示成元）
const dishesTotal = computed(() => {
  const fen = selectedDishes.value.reduce((sum, d) => sum + (d.price || 0), 0)
  return (fen / 100).toFixed(2)
})

const handleOrderDish = (dish) => {
  const exist = selectedDishes.value.find((d) => d.id === dish.id)
  if (exist) {
    selectedDishes.value = selectedDishes.value.filter((d) => d.id !== dish.id)
    ElMessage.info(`已移除「${dish.name}」`)
  } else {
    selectedDishes.value.push(dish)
    ElMessage.success(`已添加「${dish.name}」，共 ${selectedDishes.value.length} 道`)
  }
}

const removeDish = (dish) => {
  selectedDishes.value = selectedDishes.value.filter((d) => d.id !== dish.id)
}

const handleBooking = async () => {
  if (!bookingForm.contact) {
    ElMessage.warning('请填写联系人姓名')
    return
  }
  const phoneErr = validatePhone(bookingForm.phone)
  if (phoneErr) {
    ElMessage.warning(phoneErr)
    return
  }
  if (!bookingForm.date || !bookingForm.time) {
    ElMessage.warning('请选择用餐时间')
    return
  }
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  booking.value = true
  try {
    const dishNote = selectedDishes.value.length
      ? `预点菜：${selectedDishes.value.map((d) => d.name).join('、')}；`
      : ''
    // 预点菜只传 id，价格由服务端查菜品表重算（ADR-5，客户端不传价）
    const res = await createOrder({
      orderType: 'food_seat',
      relatedId: restaurant.value.id,
      quantity: bookingForm.guests,
      dishIds: selectedDishes.value.map((d) => d.id),
      bookDate: bookingForm.date,
      contactName: bookingForm.contact,
      contactPhone: bookingForm.phone,
      remark: `${dishNote}${bookingForm.time}${bookingForm.remark ? ' ' + bookingForm.remark : ''}`,
    })
    if (res.code === 0) {
      ElMessage.success(
        selectedDishes.value.length
          ? `预订成功！预点菜合计 ¥${dishesTotal.value}，请前往订单中心查看`
          : '预订成功！我们将尽快与您确认'
      )
      selectedDishes.value = []
    } else {
      ElMessage.error(res.message || '预订失败')
    }
  } catch (error) {
    console.error('Failed to book restaurant:', error)
  } finally {
    booking.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString()
}

onMounted(() => {
  loadRestaurant()
})
</script>

<style scoped lang="scss">
.restaurant-detail-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.detail-hero {
  height: 320px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(153, 27, 27, 0.3) 0%, rgba(26, 54, 93, 0.9) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    padding: 40px;
    color: white;

    h1 {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 16px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .hero-meta {
      display: flex;
      align-items: center;
      gap: 24px;

      .avg-price {
        font-size: 20px;
        color: #fbbf24;
        font-weight: 600;
      }
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  padding: 20px 0;
}

.restaurant-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.restaurant-header {
  display: flex;
  gap: 32px;
  padding: 32px;

  .header-info {
    flex: 1;

    .restaurant-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;

      .el-tag {
        background: rgba(153, 27, 27, 0.1);
        border: none;
        color: var(--chinese-red);
      }
    }

    .restaurant-desc {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-color);
      margin-bottom: 24px;
    }

    .restaurant-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--text-color);

        .el-icon {
          font-size: 18px;
          color: var(--chinese-red);
        }
      }

      .location-action {
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px;
        background: rgba(22, 101, 52, 0.05);
        border-radius: 8px;
        margin-top: 8px;

        .el-button {
          margin: 0;
        }

        .distance-badge {
          color: var(--nature-green);
          font-weight: 600;
          font-size: 14px;
        }
      }
    }
  }

  .header-image {
    width: 360px;
    height: 280px;
    flex-shrink: 0;
    border-radius: 16px;
    overflow: hidden;

    .cover-image {
      width: 100%;
      height: 100%;
    }
  }
}

.restaurant-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    h2 {
      font-size: 22px;
      color: var(--primary-color);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(90deg, var(--chinese-red), transparent);
        border-radius: 2px;
      }
    }

    .count {
      color: var(--text-light);
      font-size: 14px;
      margin-left: auto;
    }
  }
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.dish-card {
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(153, 27, 27, 0.15);
  }

  .dish-image {
    height: 160px;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .dish-category {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  .dish-info {
    padding: 16px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-color);
    }

    .dish-desc {
      font-size: 13px;
      color: var(--text-light);
      margin-bottom: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dish-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .dish-price {
        color: var(--chinese-red);
        font-size: 18px;
        font-weight: 700;
      }

      .order-btn {
        background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
        border: none;
      }
    }
  }
}

.booking-card {
  padding: 32px;

  .booking-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px dashed var(--border-color);

    .el-icon {
      font-size: 24px;
      color: var(--chinese-red);
    }

    span {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .book-btn {
    background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
    border: none;
    padding: 12px 40px;
  }

  .selected-dishes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .dishes-tip {
    font-size: 12px;
    color: var(--text-light);
  }

  // 预点菜费用明细
  .bill {
    width: 100%;
    margin-top: 12px;
    padding: 16px 18px;
    background: var(--bg-light);
    border-radius: var(--radius-md);
    border: 1px dashed var(--border-color);

    .bill-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text-color);
      padding: 4px 0;

      .bill-price {
        color: var(--chinese-red);
        font-weight: 500;
      }
    }

    .bill-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
      font-size: 14px;
      color: var(--text-color);

      .total {
        font-size: 20px;
        font-weight: 700;
        color: var(--chinese-red);
      }
    }

    .bill-tip {
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-light);
    }
  }
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 24px;

  .review-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;

    .review-avatar {
      background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
    }

    .review-user {
      flex: 1;

      .username {
        font-weight: 600;
        margin-right: 12px;
        color: var(--text-color);
      }
    }

    .review-time {
      color: var(--text-light);
      font-size: 13px;
    }
  }

  .review-content {
    padding-left: 58px;

    p {
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 14px;
      color: var(--text-color);
    }

    .review-images {
      display: flex;
      gap: 10px;

      .review-image {
        width: 120px;
        height: 90px;
        border-radius: 8px;
      }
    }
  }
}

.empty-reviews {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    color: var(--text-light);
    font-size: 15px;
  }
}

@media (max-width: 1024px) {
  .restaurant-header {
    flex-direction: column;

    .header-image {
      width: 100%;
      height: 250px;
    }
  }

  .dish-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .detail-hero {
    height: 240px;

    .hero-content {
      padding: 24px;

      h1 {
        font-size: 28px;
      }
    }
  }

  .dish-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .review-item .review-content {
    padding-left: 0;
  }
}
</style>
