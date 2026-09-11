<template>
  <div class="scenic-detail-page" v-loading="loading">
    <template v-if="scenic.id">
      <!-- Hero -->
      <div class="page-hero">
        <div class="hero-image" :style="{ backgroundImage: heroBg }"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content container">
          <el-tag v-if="scenic.scenicType" class="type-tag" effect="dark">{{ scenic.scenicType }}</el-tag>
          <h1>{{ scenic.name }}</h1>
          <div class="hero-meta">
            <span v-if="scenic.openTime"><el-icon><Clock /></el-icon> {{ scenic.openTime }}</span>
            <span v-if="scenic.suggestedDuration"><el-icon><Timer /></el-icon> 建议游玩 {{ scenic.suggestedDuration }}</span>
            <span v-if="scenic.address"><el-icon><Location /></el-icon> {{ scenic.address }}</span>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="detail-layout">
          <!-- 左侧主内容 -->
          <main class="detail-main">
            <section class="card section">
              <div class="section-header">
                <h2>景区介绍</h2>
              </div>
              <p class="intro">{{ scenic.description || '暂无介绍' }}</p>
              <div class="tags" v-if="scenic.tags && scenic.tags.length">
                <el-tag v-for="t in scenic.tags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
              </div>
            </section>

            <section class="card section" v-if="images.length">
              <div class="section-header">
                <h2>景区图集</h2>
                <span class="count">共 {{ images.length }} 张</span>
              </div>
              <div class="gallery">
                <el-image
                  v-for="(img, i) in images"
                  :key="i"
                  :src="img"
                  :preview-src-list="images"
                  :initial-index="i"
                  fit="cover"
                  class="gallery-item"
                />
              </div>
            </section>
          </main>

          <!-- 右侧购买卡 -->
          <aside class="detail-side">
            <div class="card buy-card">
              <div class="price-block">
                <template v-if="scenic.ticketPrice > 0">
                  <span class="price">¥{{ (scenic.ticketPrice / 100).toFixed(0) }}</span>
                  <span class="unit">/人</span>
                </template>
                <span v-else class="free">免费开放</span>
              </div>

              <div class="field">
                <label>游览日期</label>
                <el-date-picker v-model="visitDate" type="date" placeholder="选择日期" style="width: 100%" />
              </div>
              <div class="field">
                <label>购票数量</label>
                <el-input-number v-model="quantity" :min="1" :max="20" style="width: 100%" />
              </div>

              <el-button
                type="primary"
                size="large"
                class="buy-btn"
                :loading="buying"
                @click="handleBuy"
              >
                {{ scenic.ticketPrice > 0 ? '立即购票' : '立即预约' }}
              </el-button>

              <div class="contact" v-if="scenic.phone">
                <el-icon><Phone /></el-icon>
                <span>{{ scenic.phone }}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </template>

    <div v-else-if="!loading" class="container">
      <el-empty description="景区不存在或已下架">
        <el-button type="primary" @click="$router.push('/tickets')">返回线路订票</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Timer, Location, Phone } from '@element-plus/icons-vue'
import { getScenicDetail, createOrder } from '@/api/ticket'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const buying = ref(false)
const scenic = ref({})
const visitDate = ref('')
const quantity = ref(1)

const images = computed(() => {
  const list = Array.isArray(scenic.value.images) ? scenic.value.images.filter(Boolean) : []
  if (list.length) return list
  return scenic.value.coverImage ? [scenic.value.coverImage] : []
})

const heroBg = computed(() => {
  const img = scenic.value.coverImage || images.value[0]
  return img ? `url('${img}')` : 'none'
})

const loadScenic = async () => {
  loading.value = true
  try {
    const res = await getScenicDetail(route.params.id)
    if (res.code === 0) {
      scenic.value = res.data
    } else {
      ElMessage.error(res.message || '景区加载失败')
    }
  } catch (error) {
    console.error('Failed to load scenic:', error)
  } finally {
    loading.value = false
  }
}

const handleBuy = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!visitDate.value) {
    ElMessage.warning('请选择游览日期')
    return
  }

  buying.value = true
  try {
    // orderType=ticket 时服务端按 scenic.ticketPrice 取价（客户端不传价）
    const res = await createOrder({
      orderType: 'ticket',
      relatedId: scenic.value.id,
      quantity: quantity.value,
      bookDate: visitDate.value,
    })
    if (res.code === 0) {
      ElMessage.success('下单成功，请前往订单中心支付')
      router.push('/orders')
    } else {
      ElMessage.error(res.message || '下单失败')
    }
  } catch (error) {
    console.error('Failed to create ticket order:', error)
  } finally {
    buying.value = false
  }
}

onMounted(loadScenic)
</script>

<style scoped lang="scss">
.scenic-detail-page {
  background: var(--bg-gradient);
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-hero {
  position: relative;
  height: 340px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;

  .hero-image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transform: scale(1.02);
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(26, 54, 93, 0.35) 0%, rgba(26, 54, 93, 0.85) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    color: white;
    padding-bottom: 32px;

    .type-tag {
      margin-bottom: 12px;
      background: var(--accent-color);
      border-color: var(--accent-color);
      color: #1a365d;
      font-weight: 600;
    }

    h1 {
      font-size: 34px;
      font-weight: 700;
      margin-bottom: 14px;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 22px;
      font-size: 14px;
      opacity: 0.95;

      span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
}

.detail-layout {
  display: flex;
  gap: 24px;
  margin-top: -40px;
  position: relative;
  z-index: 5;
  align-items: flex-start;
}

.detail-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-side {
  width: 320px;
  flex-shrink: 0;
}

.section {
  padding: 26px;

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 18px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 18px;
        border-radius: 2px;
        background: linear-gradient(180deg, var(--accent-color), #b8860b);
      }
    }

    .count {
      font-size: 13px;
      color: var(--text-light);
    }
  }

  .intro {
    font-size: 15px;
    line-height: 1.9;
    color: var(--text-color);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;

    .gallery-item {
      width: 100%;
      height: 140px;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
  }
}

.buy-card {
  padding: 24px;
  position: sticky;
  top: 96px;

  .price-block {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--border-color);

    .price {
      font-size: 30px;
      font-weight: 700;
      color: var(--chinese-red);
    }

    .unit {
      font-size: 14px;
      color: var(--text-light);
    }

    .free {
      font-size: 20px;
      font-weight: 600;
      color: #16a34a;
    }
  }

  .field {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 13px;
      color: var(--text-light);
      margin-bottom: 8px;
    }
  }

  .buy-btn {
    width: 100%;
    margin-top: 6px;
    background: linear-gradient(135deg, var(--primary-color), #2d5a87);
    border: none;
    border-radius: var(--radius-lg);
    font-weight: 500;
  }

  .contact {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 13px;
    color: var(--text-light);
  }
}

@media (max-width: 992px) {
  .detail-layout {
    flex-direction: column;
    margin-top: -24px;
  }

  .detail-side {
    width: 100%;

    .buy-card {
      position: static;
    }
  }
}
</style>
