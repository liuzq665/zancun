<template>
  <div class="hotel-detail-page">
    <!-- 顶部导航 -->
    <div class="detail-nav">
      <div class="nav-content container">
        <router-link to="/" class="nav-home">
          <el-icon><HomeFilled /></el-icon>
          首页
        </router-link>
        <span class="nav-sep">/</span>
        <router-link to="/hotels" class="nav-category">住宿预订</router-link>
        <span class="nav-sep">/</span>
        <span class="nav-current">{{ hotel.name || '民宿详情' }}</span>
      </div>
    </div>

    <div class="container">
      <div class="hotel-content" v-loading="loading" v-if="hotel.id">
        <!-- 民宿头图展示 -->
        <div class="hotel-header">
          <div class="hotel-gallery">
            <div class="main-image-wrap">
              <el-image
                :src="currentImage"
                fit="cover"
                class="main-image"
                :preview-src-list="previewImages"
                :initial-index="Math.max(0, previewImages.indexOf(currentImage))"
                preview-teleported
              />
              <div class="gallery-badges">
                <el-tag v-if="hotel.isRecommend" type="danger" effect="dark" size="large">
                  <el-icon><Star /></el-icon> 推荐民宿
                </el-tag>
                <el-tag size="large" effect="dark">
                  {{ hotel.hotelType }}
                </el-tag>
              </div>
            </div>
            <div class="thumbnail-list" v-if="hotel.images && hotel.images.length > 1">
              <button
                v-for="(img, idx) in hotel.images"
                :key="idx"
                type="button"
                class="thumbnail"
                :class="{ active: currentImage === img }"
                :aria-label="`查看第 ${idx + 1} 张图片`"
                @click="currentImage = img"
              >
                <el-image
                  :src="img"
                  fit="cover"
                  :preview-src-list="previewImages"
                  :initial-index="idx"
                  preview-teleported
                />
              </button>
            </div>
          </div>

          <div class="hotel-basic">
            <h1 class="hotel-name">{{ hotel.name }}</h1>

            <div class="hotel-rating" v-if="hotel.rating">
              <el-rate v-model="hotel.rating" disabled show-score />
              <span class="review-count">{{ hotel.reviewCount || 0 }}条评价</span>
            </div>

            <p class="hotel-desc">{{ hotel.description }}</p>

            <div class="hotel-tags" v-if="hotel.tags && hotel.tags.length">
              <el-tag v-for="tag in hotel.tags" :key="tag" type="warning" effect="plain">{{ tag }}</el-tag>
            </div>

            <div class="hotel-meta">
              <div class="meta-item">
                <el-icon><LocationFilled /></el-icon>
                <span>{{ hotel.address }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>入住时间：14:00 / 退房时间：12:00</span>
              </div>
              <div class="meta-item" v-if="hotel.phone">
                <el-icon><Phone /></el-icon>
                <span>{{ hotel.phone }}</span>
              </div>
            </div>

            <!-- 快速预订入口 -->
            <div class="quick-book">
              <div class="price-info">
                <span class="from-label">起</span>
                <span class="price">¥{{ ((hotel.minPrice || 0) / 100).toFixed(0) }}</span>
                <span class="unit">/晚</span>
              </div>
              <el-button type="primary" size="large" @click="scrollToRooms">
                <el-icon><Calendar /></el-icon>
                查看房型
              </el-button>
            </div>

            <!-- 地理位置展示 -->
            <div class="hotel-location" v-if="hotel.latitude && hotel.longitude">
              <h4>
                <el-icon><LocationFilled /></el-icon>
                位置导航
                <span v-if="distance" class="distance-badge">
                  距您 {{ formatDistance(distance) }}
                </span>
              </h4>
              <MapView
                :height="'280px'"
                :markers="locationMarkers"
                :zoom="15"
                :clickable="false"
                :userLocation="userLocation"
              />
              <div class="location-actions">
                <el-button type="primary" @click="fetchUserLocation" :loading="!showUserLocation && userLocation !== null">
                  <el-icon><Position /></el-icon>
                  {{ showUserLocation ? '已定位' : '显示我的位置' }}
                </el-button>
                <el-button type="success" @click="navigateToHotel">
                  <el-icon><Position /></el-icon>
                  导航到这里
                </el-button>
                <el-button @click="startNavigation">
                  <el-icon><Position /></el-icon>
                  一键导航
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 房型列表 -->
        <div class="hotel-section" ref="roomsSection">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            房型预订
            <span class="title-en">ROOM TYPES</span>
          </h2>
          <div class="room-list">
            <div v-for="room in rooms" :key="room.id" class="room-card">
              <div class="room-image">
                <el-image :src="room.coverImage || hotel.coverImage || '/placeholder.svg'" fit="cover" />
              </div>
              <div class="room-info">
                <h3 class="room-name">{{ room.name }}</h3>
                <div class="room-features">
                  <span><el-icon><User /></el-icon> {{ room.capacity }}人</span>
                  <span><el-icon><House /></el-icon> {{ room.area }}㎡</span>
                  <span v-if="room.hasBreakfast"><el-icon><Coffee /></el-icon> 含早餐</span>
                  <span v-if="room.hasWifi"><el-icon><Connection /></el-icon> WiFi</span>
                </div>
                <p class="room-desc">{{ room.description }}</p>
              </div>
              <div class="room-action">
                <div class="room-price">
                  <span class="price">¥{{ (room.price / 100).toFixed(0) }}</span>
                  <span class="unit">/晚</span>
                </div>
                <div class="room-stock">
                  <span :class="{ 'low-stock': room.stock < 5 }">
                    剩余 {{ room.stock }} 间
                  </span>
                </div>
                <el-button type="primary" @click="handleBook(room)">立即预订</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 民宿设施 -->
        <div class="hotel-section" v-if="hotel.facilities && hotel.facilities.length">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            设施服务
            <span class="title-en">FACILITIES</span>
          </h2>
          <div class="facilities-grid">
            <div v-for="facility in hotel.facilities" :key="facility" class="facility-item">
              <el-icon><CircleCheck /></el-icon>
              <span>{{ facility }}</span>
            </div>
          </div>
        </div>

        <!-- 用户评价 -->
        <div class="hotel-section">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            住客评价
            <span class="title-en">REVIEWS</span>
          </h2>
          <div class="reviews-list" v-if="reviews.length > 0">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <el-avatar :size="44">{{ review.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
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
                    fit="cover"
                    class="review-img"
                    :preview-src-list="review.images"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-reviews">
            <el-empty description="暂无评价，期待您的光临！" />
          </div>
        </div>
      </div>

      <!-- 民宿不存在 / 已下架时的兜底，避免出现空白页 -->
      <div v-else-if="!loading" class="detail-empty">
        <el-empty description="民宿不存在或已下架">
          <el-button type="primary" @click="$router.push('/hotels')">返回住宿预订</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 预订对话框 -->
    <el-dialog v-model="showBookingDialog" title="预订房间" width="550px" class="booking-dialog">
      <div class="booking-hotel-info">
        <el-image :src="hotel.coverImage || '/placeholder.svg'" fit="cover" class="booking-hotel-img" />
        <div class="booking-hotel-detail">
          <h3>{{ hotel.name }}</h3>
          <p>{{ selectedRoom?.name }}</p>
        </div>
      </div>
      <el-form :model="bookingForm" label-width="100px" class="booking-form">
        <el-form-item label="入住日期">
          <el-date-picker v-model="bookingForm.checkIn" type="date" placeholder="选择入住日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="退房日期">
          <el-date-picker v-model="bookingForm.checkOut" type="date" placeholder="选择退房日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入住人数">
          <el-input-number v-model="bookingForm.guests" :min="1" :max="selectedRoom?.capacity || 10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="bookingForm.contact" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="bookingForm.phone"
            placeholder="请输入 11 位手机号"
            maxlength="11"
            @input="bookingForm.phone = sanitizePhone($event)"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bookingForm.remark" type="textarea" :rows="2" placeholder="其他要求（选填）" />
        </el-form-item>
        <div class="booking-price-summary">
          <div class="price-row">
            <span>房费</span>
            <span class="price">¥{{ calculatedPrice }}</span>
          </div>
          <div class="total-row">
            <span>合计</span>
            <span class="total-price">¥{{ calculatedPrice }}</span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showBookingDialog = false">取消</el-button>
        <el-button type="primary" size="large" :loading="booking" @click="confirmBooking" class="btn-confirm-booking">
          确认预订
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled, Star, LocationFilled, Clock, Phone, User, House,
  Coffee, Connection, Calendar, CircleCheck, Position
} from '@element-plus/icons-vue'
import { getHotelDetail, getRoomList, getReviewList } from '@/api/hotel'
import { createOrder } from '@/api/ticket'
import { useUserStore } from '@/stores/user'
import { sanitizePhone, validatePhone } from '@/utils/validate'
import { ElMessage } from 'element-plus'
import { updateSeo, generateBusinessSchema, injectSchemaScript } from '@/composables/useSeo'
import MapView from '@/components/MapView.vue'
import { getUserLocation, calculateDistance, formatDistance, getNavigationUrl } from '@/utils/geo'

const route = useRoute()

const loading = ref(false)
const booking = ref(false)
const router = useRouter()
const userStore = useUserStore()
const hotel = ref({})
const rooms = ref([])
const reviews = ref([])
const showBookingDialog = ref(false)
const selectedRoom = ref(null)
const roomsSection = ref(null)
const userLocation = ref(null)
const showUserLocation = ref(false)
const distance = computed(() => {
  if (!userLocation.value || !hotel.value.latitude || !hotel.value.longitude) return null
  return calculateDistance(
    userLocation.value.latitude,
    userLocation.value.longitude,
    parseFloat(hotel.value.latitude),
    parseFloat(hotel.value.longitude)
  )
})

// 获取用户位置并显示
const fetchUserLocation = async () => {
  try {
    userLocation.value = await getUserLocation()
    showUserLocation.value = true
  } catch (error) {
    ElMessage.warning('无法获取您的位置，请开启定位权限')
  }
}

// 导航到目的地
const navigateToHotel = () => {
  if (!hotel.value.latitude || !hotel.value.longitude) return
  const destLat = parseFloat(hotel.value.latitude)
  const destLng = parseFloat(hotel.value.longitude)
  const url = getNavigationUrl(destLat, destLng, hotel.value.name)
  window.open(url, '_blank')
}

// 一键导航（获取用户位置后导航）
const startNavigation = async () => {
  if (!hotel.value.latitude || !hotel.value.longitude) return
  try {
    const loc = await getUserLocation()
    const destLat = parseFloat(hotel.value.latitude)
    const destLng = parseFloat(hotel.value.longitude)
    const url = getNavigationUrl(destLat, destLng, hotel.value.name, loc.latitude, loc.longitude)
    window.open(url, '_blank')
  } catch (error) {
    // 无法获取用户位置，直接导航
    navigateToHotel()
  }
}

// 地图标记点
const locationMarkers = computed(() => {
  const markers = []
  if (hotel.value.latitude && hotel.value.longitude) {
    markers.push({
      lat: parseFloat(hotel.value.latitude),
      lng: parseFloat(hotel.value.longitude),
      title: hotel.value.name,
      content: hotel.value.address,
    })
  }
  return markers
})

// 当前展示图必须是可写状态；之前使用只读 computed，点击缩略图无法切换到第二张。
const currentImage = ref('/placeholder.svg')

const previewImages = computed(() => {
  if (hotel.value.images && hotel.value.images.length > 0) {
    return hotel.value.images
  }
  return [hotel.value.coverImage || '/placeholder.svg']
})

const bookingForm = reactive({
  checkIn: '',
  checkOut: '',
  guests: 1,
  contact: '',
  phone: '',
  remark: '',
})

const calculatedPrice = computed(() => {
  if (!selectedRoom.value || !bookingForm.checkIn || !bookingForm.checkOut) return 0
  const days = Math.ceil((new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) / (1000 * 60 * 60 * 24))
  return ((selectedRoom.value.price * Math.max(1, days)) / 100).toFixed(2)
})

const loadHotel = async () => {
  loading.value = true
  try {
    const res = await getHotelDetail(route.params.id)
    if (res.code === 0) {
      hotel.value = res.data
      currentImage.value = res.data.images?.[0] || res.data.coverImage || '/placeholder.svg'

      // 更新页面 SEO
      updateSeo({
        title: hotel.value.name,
        description: hotel.value.description,
        image: hotel.value.coverImage,
        url: `https://wudong.travel/hotels/${hotel.value.id}`,
        type: 'hotel',
      })

      // 注入结构化数据
      injectSchemaScript(generateBusinessSchema(hotel.value, 'Hotel'))
    }
    // 房型接口返回的是裸数组（不是 {list}）
    const roomRes = await getRoomList(route.params.id)
    if (roomRes.code === 0) {
      rooms.value = Array.isArray(roomRes.data) ? roomRes.data : roomRes.data?.list || []
    }
    const reviewRes = await getReviewList(route.params.id)
    if (reviewRes.code === 0) {
      reviews.value = reviewRes.data?.list || []
    }
  } catch (error) {
    console.error('Failed to load hotel:', error)
  } finally {
    loading.value = false
  }
}

const scrollToRooms = () => {
  roomsSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const handleBook = (room) => {
  selectedRoom.value = room
  showBookingDialog.value = true
}

const confirmBooking = async () => {
  if (!bookingForm.checkIn || !bookingForm.checkOut) {
    ElMessage.warning('请选择入住和退房日期')
    return
  }
  if (!selectedRoom.value) {
    ElMessage.warning('请选择房型')
    return
  }
  if (!bookingForm.contact) {
    ElMessage.warning('请填写联系人姓名')
    return
  }
  const phoneErr = validatePhone(bookingForm.phone)
  if (phoneErr) {
    ElMessage.warning(phoneErr)
    return
  }
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  booking.value = true
  try {
    // 服务端按 roomTypeId 取价并扣房态库存
    const res = await createOrder({
      orderType: 'hotel',
      relatedId: selectedRoom.value.id,
      quantity: 1,
      bookDate: bookingForm.checkIn,
      endDate: bookingForm.checkOut,
      contactName: bookingForm.contact,
      contactPhone: bookingForm.phone,
      remark: bookingForm.remark,
    })
    if (res.code === 0) {
      ElMessage.success('预订成功，请前往订单中心支付')
      showBookingDialog.value = false
      router.push('/orders')
    } else {
      ElMessage.error(res.message || '预订失败')
    }
  } catch (error) {
    console.error('Failed to book hotel:', error)
  } finally {
    booking.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadHotel()
})
</script>

<style scoped lang="scss">
.hotel-detail-page {
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

.hotel-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px;
  margin: 30px auto;
  box-shadow: var(--shadow-md);
}

.hotel-header {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 50px;
  margin-bottom: 60px;
}

.hotel-gallery {
  .main-image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-light);
    margin-bottom: 16px;

    .main-image {
      width: 100%;
      height: 100%;
    }

    .gallery-badges {
      position: absolute;
      top: 16px;
      left: 16px;
      display: flex;
      gap: 8px;

      :deep(.el-tag) {
        padding: 8px 16px;
        font-size: 13px;
      }
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 10px;

    .thumbnail {
      width: 80px;
      height: 60px;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      padding: 0;
      background: transparent;
      display: block;
      transition: all var(--transition-base);

      &:hover, &.active {
        border-color: var(--accent-color);
      }

      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.hotel-basic {
  .hotel-name {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 16px;
  }

  .hotel-rating {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .review-count {
      color: var(--text-light);
      font-size: 14px;
    }
  }

  .hotel-desc {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-color);
    margin-bottom: 20px;
  }

  .hotel-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  .hotel-meta {
    margin-bottom: 30px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--text-light);

      .el-icon {
        color: var(--accent-color);
        font-size: 18px;
      }
    }
  }

  .quick-book {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(153, 27, 27, 0.08) 0%, rgba(153, 27, 27, 0.04) 100%);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(153, 27, 27, 0.1);

    .price-info {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .from-label {
        font-size: 14px;
        color: var(--text-light);
      }

      .price {
        font-size: 36px;
        font-weight: 700;
        color: var(--chinese-red);
      }

      .unit {
        font-size: 14px;
        color: var(--text-light);
      }
    }

    :deep(.el-button) {
      background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
      border: none;
      padding: 14px 32px;
      font-size: 16px;

      &:hover {
        background: linear-gradient(135deg, var(--chinese-red-light), var(--chinese-red));
      }
    }
  }

  .hotel-location {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed var(--border-color);

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

      .distance-badge {
        font-size: 13px;
        color: var(--accent-color);
        font-weight: 500;
        background: rgba(212, 175, 55, 0.1);
        padding: 2px 10px;
        border-radius: 12px;
        margin-left: 8px;
      }
    }

    :deep(.map-view) {
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 12px;
    }

    .location-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 120px;

        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }
}

// 通用区域标题
.hotel-section {
  margin-bottom: 60px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 28px;
    color: var(--primary-color);
    margin-bottom: 30px;
    font-weight: 600;

    .title-icon {
      color: var(--accent-color);
    }

    .title-en {
      font-size: 14px;
      font-weight: 400;
      color: var(--text-light);
      font-family: 'Noto Sans SC', sans-serif;
      letter-spacing: 2px;
    }
  }
}

// 房型列表
.room-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.room-card {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--accent-color);
    box-shadow: var(--shadow-md);
  }

  .room-image {
    width: 280px;
    height: 200px;
    flex-shrink: 0;

    .el-image {
      width: 100%;
      height: 100%;
    }
  }

  .room-info {
    flex: 1;
    padding: 24px;

    .room-name {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 12px;
    }

    .room-features {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--text-light);

        .el-icon {
          color: var(--accent-color);
        }
      }
    }

    .room-desc {
      font-size: 14px;
      color: var(--text-light);
      line-height: 1.6;
    }
  }

  .room-action {
    width: 180px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-left: 1px solid var(--border-color);
    background: var(--bg-light);

    .room-price {
      text-align: center;

      .price {
        font-size: 32px;
        font-weight: 700;
        color: var(--chinese-red);
      }

      .unit {
        font-size: 14px;
        color: var(--text-light);
      }
    }

    .room-stock {
      font-size: 13px;
      color: var(--text-light);

      .low-stock {
        color: var(--chinese-red);
        font-weight: 500;
      }
    }

    :deep(.el-button) {
      width: 100%;
      background: var(--accent-color);
      border: none;

      &:hover {
        background: var(--accent-dark);
      }
    }
  }
}

// 设施服务
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  .facility-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    background: var(--bg-light);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--text-color);

    .el-icon {
      color: var(--nature-green);
      font-size: 20px;
    }
  }
}

// 用户评价
.reviews-list {
  .review-item {
    padding: 30px 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .review-user {
        flex: 1;

        .username {
          font-weight: 600;
          margin-right: 12px;
        }
      }

      .review-time {
        color: var(--text-muted);
        font-size: 13px;
      }
    }

    .review-content {
      padding-left: 60px;

      p {
        font-size: 15px;
        line-height: 1.8;
        margin-bottom: 16px;
      }

      .review-images {
        display: flex;
        gap: 12px;

        .review-img {
          width: 120px;
          height: 90px;
          border-radius: var(--radius-md);
        }
      }
    }
  }
}

.empty-reviews {
  padding: 60px;
}

// 预订对话框
.booking-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--border-color);
    padding: 20px 24px;
  }

  :deep(.el-dialog__title) {
    font-size: 20px;
    font-weight: 600;
    color: var(--primary-color);
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  .booking-hotel-info {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: var(--bg-light);
    border-radius: var(--radius-md);
    margin-bottom: 24px;

    .booking-hotel-img {
      width: 100px;
      height: 75px;
      border-radius: var(--radius-md);
    }

    .booking-hotel-detail {
      h3 {
        font-size: 18px;
        color: var(--text-color);
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: var(--text-light);
      }
    }
  }

  .booking-form {
    :deep(.el-form-item__label) {
      font-weight: 500;
    }
  }

  .booking-price-summary {
    padding: 16px;
    background: var(--bg-light);
    border-radius: var(--radius-md);
    margin-top: 16px;

    .price-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--text-light);

      .price {
        color: var(--text-color);
      }
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px dashed var(--border-color);

      span:first-child {
        font-weight: 600;
        color: var(--text-color);
      }

      .total-price {
        font-size: 28px;
        font-weight: 700;
        color: var(--chinese-red);
      }
    }
  }

  .btn-confirm-booking {
    background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
    border: none;
    padding: 14px 40px;
    font-size: 16px;

    &:hover {
      background: linear-gradient(135deg, var(--chinese-red-light), var(--chinese-red));
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .hotel-header {
    grid-template-columns: 400px 1fr;
    gap: 40px;
  }
}

@media (max-width: 992px) {
  .hotel-header {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hotel-gallery {
    .main-image-wrap {
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .room-card {
    flex-direction: column;

    .room-image {
      width: 100%;
      height: 200px;
    }

    .room-action {
      width: 100%;
      flex-direction: row;
      border-left: none;
      border-top: 1px solid var(--border-color);
    }
  }

  .facilities-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hotel-content {
    padding: 20px;
    margin: 16px auto;
    border-radius: var(--radius-lg);
  }

  .hotel-basic {
    .hotel-name {
      font-size: 24px;
    }
  }

  .facilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
