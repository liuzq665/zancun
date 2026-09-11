<template>
  <div class="route-detail-page">
    <!-- Hero Section -->
    <div class="detail-hero" :style="{ backgroundImage: `url(${routeInfo.coverImage || 'https://images.pexels.com/photos/28276474/pexels-photo-28276474.png?auto=compress&cs=tinysrgb&w=800'})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="route-type">{{ routeInfo.routeType }}</div>
        <h1>{{ routeInfo.name }}</h1>
        <p>{{ routeInfo.description }}</p>
      </div>
    </div>

    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/tickets' }">线路订票</el-breadcrumb-item>
          <el-breadcrumb-item>{{ routeInfo.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="route-content" v-loading="loading" v-if="routeInfo.id">
        <!-- 路线概览 -->
        <div class="route-overview card">
          <div class="overview-main">
            <div class="quick-info">
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">集合地点</span>
                  <span class="info-value">{{ routeInfo.meetingPoint }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">集合时间</span>
                  <span class="info-value">{{ routeInfo.meetingTime }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">成团人数</span>
                  <span class="info-value">{{ routeInfo.minPeople }}-{{ routeInfo.maxPeople }}人</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">行程时长</span>
                  <span class="info-value">{{ routeInfo.routeType }}</span>
                </div>
              </div>
            </div>

            <div class="price-section">
              <div class="price-tag">
                <span class="currency">¥</span>
                <span class="amount">{{ (routeInfo.price / 100).toFixed(0) }}</span>
                <span class="unit">/人</span>
              </div>
              <div class="price-desc">
                <el-icon><Check /></el-icon>
                <span>费用包含：{{ routeInfo.includes || '景区门票、导游服务、旅游意外险' }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <el-button type="primary" size="large" @click="handleBook" class="book-btn">
                <el-icon><Calendar /></el-icon>
                立即预订
              </el-button>
              <el-button size="large" @click="handleConsult" class="consult-btn">
                <el-icon><ChatDotRound /></el-icon>
                咨询详情
              </el-button>
            </div>
          </div>

          <div class="overview-image">
            <el-image
              :src="routeInfo.coverImage || '/placeholder.svg'"
              :alt="routeInfo.name"
              fit="cover"
              class="cover-image"
            />
          </div>
        </div>

        <!-- 行程安排 -->
        <div class="route-section" v-if="routeInfo.itinerary && routeInfo.itinerary.length">
          <div class="section-header">
            <h2>行程安排</h2>
          </div>
          <div class="schedule-timeline">
            <div
              v-for="(day, dayIdx) in routeInfo.itinerary"
              :key="dayIdx"
              class="schedule-day"
            >
              <div class="day-header">
                <div class="day-badge">
                  <span class="day-number">Day {{ dayIdx + 1 }}</span>
                </div>
              </div>
              <div class="day-content">
                <div class="timeline-items">
                  <div v-for="(item, itemIdx) in day.content || day" :key="itemIdx" class="timeline-item">
                    <div class="timeline-time">{{ typeof item === 'object' ? item.time : '' }}</div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">{{ typeof item === 'object' ? item.activity : item }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 途经景点 -->
        <div class="route-section" v-if="routeInfo.spots && routeInfo.spots.length">
          <div class="section-header">
            <h2>途经景点</h2>
          </div>
          <div class="spots-grid">
            <div v-for="(spot, idx) in routeInfo.spots" :key="idx" class="spot-card card">
              <div class="spot-image">
                <img :src="spot.image || 'https://images.pexels.com/photos/28276474/pexels-photo-28276474.png?auto=compress&cs=tinysrgb&w=800'" :alt="spot" />
                <span class="spot-number">{{ idx + 1 }}</span>
              </div>
              <div class="spot-info">
                <h4>{{ spot }}</h4>
                <p>乌东特色景点</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 费用说明 -->
        <div class="route-section">
          <div class="section-header">
            <h2>费用说明</h2>
          </div>
          <div class="fee-card card">
            <div class="fee-grid">
              <div class="fee-include">
                <div class="fee-header">
                  <el-icon><CircleCheck /></el-icon>
                  <span>费用包含</span>
                </div>
                <ul>
                  <li><el-icon><Check /></el-icon> 景区门票（首道门票）</li>
                  <li><el-icon><Check /></el-icon> 优秀中文导游服务</li>
                  <li><el-icon><Check /></el-icon> 旅游意外险</li>
                  <li><el-icon><Check /></el-icon> 行程中注明包含的餐食</li>
                </ul>
              </div>
              <div class="fee-exclude">
                <div class="fee-header">
                  <el-icon><CircleClose /></el-icon>
                  <span>费用不含</span>
                </div>
                <ul>
                  <li><el-icon><Close /></el-icon> 往返交通费用</li>
                  <li><el-icon><Close /></el-icon> 个人消费及自费项目</li>
                  <li><el-icon><Close /></el-icon> 住宿费用（除注明含住宿的路线）</li>
                  <li><el-icon><Close /></el-icon> 行程中未注明的餐食</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 预订须知 -->
        <div class="route-section">
          <div class="section-header">
            <h2>预订须知</h2>
          </div>
          <div class="notice-card card">
            <div class="notice-grid">
              <div class="notice-item">
                <h4><el-icon><InfoFilled /></el-icon> 退改规则</h4>
                <p>提前3天以上取消可全额退款；提前1-3天取消退还50%费用；出发当天不予退款。</p>
              </div>
              <div class="notice-item">
                <h4><el-icon><Warning /></el-icon> 注意事项</h4>
                <ul>
                  <li>请准时到达集合地点，迟到超过15分钟视为自动放弃</li>
                  <li>建议穿着舒适的运动鞋，带好防晒用品</li>
                  <li>贵重物品请随身携带，注意保管</li>
                  <li>行程中如遇不可抗力因素，我社有权调整行程</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预订对话框 -->
    <el-dialog v-model="showBookingDialog" title="预订路线" width="640px" class="booking-dialog">
      <div class="dialog-route-info">
        <el-image :src="routeInfo.coverImage" fit="cover" class="dialog-image" />
        <div class="dialog-info">
          <h3>{{ routeInfo.name }}</h3>
          <p>{{ routeInfo.routeType }} · {{ routeInfo.meetingPoint }}</p>
        </div>
      </div>
      <el-form :model="bookingForm" label-width="100px">
        <el-form-item label="出发日期">
          <el-date-picker
            v-model="bookingForm.date"
            type="date"
            placeholder="选择出发日期"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="人数">
          <el-input-number v-model="bookingForm.count" :min="1" :max="routeInfo.maxPeople || 20" style="width: 100%" />
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
        <el-form-item label="身份证号">
          <el-input
            v-model="bookingForm.idCard"
            placeholder="请输入 18 位身份证号（用于购买保险）"
            maxlength="18"
            @input="bookingForm.idCard = sanitizeIdCard($event)"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bookingForm.remark" type="textarea" :rows="2" placeholder="其他要求（选填）" />
        </el-form-item>
        <div class="total-price-row">
          <span class="label">应付金额</span>
          <span class="price">¥{{ calculatedPrice }}</span>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showBookingDialog = false">取消</el-button>
        <el-button type="primary" :loading="booking" @click="confirmBooking" class="confirm-btn">确认预订</el-button>
      </template>
    </el-dialog>

    <!-- 路线不存在 / 已下架时的兜底，避免出现空白页 -->
    <div v-if="!loading && !routeInfo.id" class="container detail-empty">
      <el-empty description="路线不存在或已下架">
        <el-button type="primary" @click="$router.push('/tickets')">返回线路订票</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Location, Clock, User, Timer, Check, Close, Calendar, ChatDotRound, CircleCheck, CircleClose, InfoFilled, Warning } from '@element-plus/icons-vue'
import { getRouteDetail, createOrder } from '@/api/ticket'
import { useUserStore } from '@/stores/user'
import { sanitizePhone, sanitizeIdCard, validatePhone, validateIdCard } from '@/utils/validate'
import { ElMessage } from 'element-plus'
import { updateSeo, generateProductSchema, injectSchemaScript } from '@/composables/useSeo'

const route = useRoute()

const loading = ref(false)
const booking = ref(false)
const router = useRouter()
const userStore = useUserStore()
const routeInfo = ref({})
const showBookingDialog = ref(false)

const bookingForm = reactive({
  date: '',
  count: 1,
  contact: '',
  phone: '',
  idCard: '',
  remark: '',
})

const calculatedPrice = computed(() => {
  if (!routeInfo.value.price) return 0
  return ((routeInfo.value.price * bookingForm.count) / 100).toFixed(2)
})

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 3600 * 1000 * 24
}

const loadRoute = async () => {
  loading.value = true
  try {
    const res = await getRouteDetail(route.params.id)
    if (res.code === 0) {
      routeInfo.value = res.data

      // 更新页面 SEO
      updateSeo({
        title: routeInfo.value.name,
        description: routeInfo.value.description,
        image: routeInfo.value.coverImage,
        url: `https://wudong.travel/routes/${routeInfo.value.id}`,
        type: 'product',
      })

      // 注入结构化数据
      injectSchemaScript({
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: routeInfo.value.name,
        description: routeInfo.value.description,
        image: routeInfo.value.coverImage,
        url: `https://wudong.travel/routes/${routeInfo.value.id}`,
        offers: {
          '@type': 'Offer',
          price: (routeInfo.value.price / 100).toFixed(2),
          priceCurrency: 'CNY',
        },
      })
    }
  } catch (error) {
    console.error('Failed to load route:', error)
  } finally {
    loading.value = false
  }
}

const handleBook = () => {
  showBookingDialog.value = true
}

const handleConsult = () => {
  ElMessage.info('客服电话：400-888-8888')
}

const confirmBooking = async () => {
  if (!bookingForm.date) {
    ElMessage.warning('请选择出发日期')
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
  const idErr = validateIdCard(bookingForm.idCard)
  if (idErr) {
    ElMessage.warning(idErr)
    return
  }
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  booking.value = true
  try {
    // 服务端按 routeId 取价并按出发日期占用名额
    const res = await createOrder({
      orderType: 'route',
      relatedId: routeInfo.value.id,
      quantity: bookingForm.count,
      bookDate: bookingForm.date,
      contactName: bookingForm.contact,
      contactPhone: bookingForm.phone,
      remark: `身份证:${bookingForm.idCard}${bookingForm.remark ? ' ' + bookingForm.remark : ''}`,
    })
    if (res.code === 0) {
      ElMessage.success('预订成功，请前往订单中心支付')
      showBookingDialog.value = false
      router.push('/orders')
    } else {
      ElMessage.error(res.message || '预订失败')
    }
  } catch (error) {
    console.error('Failed to book route:', error)
  } finally {
    booking.value = false
  }
}

onMounted(() => {
  loadRoute()
})
</script>

<style scoped lang="scss">
.route-detail-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.detail-hero {
  height: 380px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(26, 54, 93, 0.4) 0%, rgba(45, 90, 135, 0.9) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    padding: 40px;
    color: white;
    max-width: 800px;

    .route-type {
      display: inline-block;
      background: linear-gradient(135deg, var(--accent-color), #b8960c);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 12px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    p {
      font-size: 16px;
      opacity: 0.9;
      line-height: 1.6;
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

.route-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.route-overview {
  display: flex;
  gap: 32px;
  padding: 32px;

  .overview-main {
    flex: 1;

    .quick-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 28px;

      .info-item {
        display: flex;
        gap: 12px;

        .info-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.1), rgba(45, 90, 135, 0.1));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 22px;
            color: var(--primary-color);
          }
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .info-label {
            font-size: 12px;
            color: var(--text-light);
          }

          .info-value {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-color);
          }
        }
      }
    }

    .price-section {
      background: linear-gradient(135deg, rgba(26, 54, 93, 0.05), rgba(45, 90, 135, 0.05));
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;

      .price-tag {
        display: flex;
        align-items: baseline;
        margin-bottom: 10px;

        .currency {
          font-size: 20px;
          color: var(--chinese-red);
        }

        .amount {
          font-size: 40px;
          font-weight: 700;
          color: var(--chinese-red);
        }

        .unit {
          font-size: 16px;
          color: var(--text-light);
          margin-left: 4px;
        }
      }

      .price-desc {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-light);

        .el-icon {
          color: var(--nature-green);
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 16px;

      .book-btn {
        background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
        border: none;
        padding: 12px 32px;

        .el-icon {
          margin-right: 6px;
        }
      }

      .consult-btn {
        padding: 12px 24px;
      }
    }
  }

  .overview-image {
    width: 400px;
    height: 320px;
    flex-shrink: 0;
    border-radius: 16px;
    overflow: hidden;

    .cover-image {
      width: 100%;
      height: 100%;
    }
  }
}

.route-section {
  .section-header {
    margin-bottom: 20px;

    h2 {
      font-size: 22px;
      color: var(--primary-color);
      position: relative;
      display: inline-block;

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(90deg, var(--secondary-color), transparent);
        border-radius: 2px;
      }
    }
  }
}

.schedule-timeline {
  .schedule-day {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    .day-header {
      flex-shrink: 0;

      .day-badge {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        min-width: 100px;
        text-align: center;

        .day-number {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }

    .day-content {
      flex: 1;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(26, 54, 93, 0.08);

      .timeline-items {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;

          &:not(:last-child)::before {
            content: '';
            position: absolute;
            left: 48px;
            top: 28px;
            bottom: -16px;
            width: 2px;
            background: var(--border-color);
          }

          .timeline-time {
            width: 60px;
            font-size: 13px;
            color: var(--text-light);
            flex-shrink: 0;
          }

          .timeline-dot {
            width: 12px;
            height: 12px;
            background: var(--secondary-color);
            border-radius: 50%;
            flex-shrink: 0;
          }

          .timeline-content {
            flex: 1;
            font-size: 15px;
            color: var(--text-color);
          }
        }
      }
    }
  }
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.spot-card {
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(45, 90, 135, 0.15);
  }

  .spot-image {
    height: 140px;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .spot-number {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }
  }

  .spot-info {
    padding: 16px;

    h4 {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-color);
    }

    p {
      font-size: 12px;
      color: var(--text-light);
    }
  }
}

.fee-card {
  padding: 28px;

  .fee-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;

    .fee-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color);
    }

    .fee-include .fee-header .el-icon {
      color: var(--nature-green);
      font-size: 22px;
    }

    .fee-exclude .fee-header .el-icon {
      color: var(--chinese-red);
      font-size: 22px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        font-size: 14px;
        color: var(--text-color);
        border-bottom: 1px dashed var(--border-color);

        &:last-child {
          border-bottom: none;
        }

        .el-icon {
          font-size: 16px;
        }
      }
    }

    .fee-include li .el-icon {
      color: var(--nature-green);
    }

    .fee-exclude li .el-icon {
      color: var(--chinese-red);
    }
  }
}

.notice-card {
  padding: 28px;

  .notice-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;

    .notice-item {
      h4 {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        margin-bottom: 14px;
        color: var(--text-color);

        .el-icon {
          font-size: 20px;
          color: var(--primary-color);
        }
      }

      p, li {
        font-size: 14px;
        color: var(--text-light);
        line-height: 1.8;
      }

      ul {
        padding-left: 20px;

        li {
          padding: 4px 0;
        }
      }
    }
  }
}

:deep(.booking-dialog) {
  .el-dialog__header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    margin: 0;
    padding: 20px 24px;

    .el-dialog__title {
      color: white;
    }

    .el-dialog__headerbtn .el-icon {
      color: white;
    }
  }

  .dialog-route-info {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: var(--bg-light);
    border-radius: 12px;
    margin-bottom: 20px;

    .dialog-image {
      width: 100px;
      height: 70px;
      border-radius: 8px;
    }

    .dialog-info {
      h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-color);
      }

      p {
        font-size: 13px;
        color: var(--text-light);
      }
    }
  }

  .total-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, rgba(153, 27, 27, 0.08), rgba(153, 27, 27, 0.04));
    border-radius: 8px;
    margin-top: 16px;

    .label {
      font-size: 15px;
      color: var(--text-color);
    }

    .price {
      font-size: 28px;
      font-weight: 700;
      color: var(--chinese-red);
    }
  }

  .confirm-btn {
    background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
    border: none;
  }
}

@media (max-width: 1024px) {
  .route-overview {
    flex-direction: column;

    .overview-image {
      width: 100%;
      height: 250px;
    }
  }

  .spots-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fee-card .fee-grid,
  .notice-card .notice-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-hero {
    height: 280px;

    .hero-content {
      padding: 24px;

      h1 {
        font-size: 28px;
      }
    }
  }

  .route-overview .overview-main .quick-info {
    grid-template-columns: 1fr;
  }
}
</style>
