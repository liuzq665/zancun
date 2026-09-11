<template>
  <div class="tickets-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>线路订票</h1>
        <p>精选乌东村及周边旅游路线，体验苗族侗寨风情</p>
      </div>
    </div>

    <div class="container">
      <!-- 景区列表 -->
      <section class="scenic-section">
        <div class="section-header">
          <h2>热门景区</h2>
          <span class="count">共 {{ scenics.length }} 个</span>
        </div>
        <div class="scenic-grid">
          <div
            v-for="scenic in scenics"
            :key="scenic.id"
            class="scenic-card card"
            @click="$router.push(`/scenics/${scenic.id}`)"
          >
            <div class="scenic-image">
              <el-image
                :src="scenic.coverImage || '/placeholder.svg'"
                :alt="scenic.name"
                fit="cover"
                class="image"
              />
              <div class="image-overlay">
                <el-icon><View /></el-icon>
                <span>查看详情</span>
              </div>
              <span class="scenic-type">{{ scenic.scenicType }}</span>
            </div>
            <div class="scenic-info">
              <h3>{{ scenic.name }}</h3>
              <p class="scenic-desc">{{ scenic.description }}</p>
              <div class="scenic-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ scenic.openTime }}
                </span>
                <span class="meta-item">
                  <el-icon><Timer /></el-icon>
                  建议{{ scenic.suggestedDuration }}
                </span>
              </div>
              <div class="scenic-footer">
                <div class="price-info">
                  <span class="ticket-price" v-if="scenic.ticketPrice > 0">
                    ¥{{ (scenic.ticketPrice / 100).toFixed(0) }}
                  </span>
                  <span class="ticket-free" v-else>免费</span>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  class="detail-btn"
                  @click.stop="$router.push(`/scenics/${scenic.id}`)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 精选路线 -->
      <section class="route-section">
        <div class="section-header">
          <h2>精选路线</h2>
          <span class="count">共 {{ routes.length }} 条</span>
        </div>
        <div class="route-list" v-loading="loading">
          <div
            v-for="route in routes"
            :key="route.id"
            class="route-item card"
            @click="$router.push(`/routes/${route.id}`)"
          >
            <div class="route-image">
              <el-image
                :src="route.coverImage || '/placeholder.svg'"
                :alt="route.name"
                fit="cover"
                class="image"
              />
              <div class="image-overlay">
                <el-icon><View /></el-icon>
                <span>查看详情</span>
              </div>
              <span class="route-type">{{ route.routeType }}</span>
            </div>
            <div class="route-content">
              <div class="content-header">
                <h3>{{ route.name }}</h3>
                <p class="route-desc">{{ route.description }}</p>
              </div>
              <div class="route-tags">
                <el-tag v-for="spot in (route.spots || []).slice(0, 4)" :key="spot" size="small" effect="plain">
                  {{ spot }}
                </el-tag>
              </div>
              <div class="route-meta">
                <span class="meta-item">
                  <el-icon><Location /></el-icon>
                  {{ route.meetingPoint }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ route.meetingTime }}
                </span>
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ route.minPeople }}-{{ route.maxPeople }}人
                </span>
              </div>
            </div>
            <div class="route-action">
              <div class="route-price">
                <span class="price">¥{{ (route.price / 100).toFixed(0) }}</span>
                <span class="unit">/人</span>
              </div>
              <el-button type="primary" class="book-btn">立即预订</el-button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Location, Clock, Timer, User, View } from '@element-plus/icons-vue'
import { getScenicList, getRouteList } from '@/api/ticket'

const loading = ref(false)
const scenics = ref([])
const routes = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const [scenicRes, routeRes] = await Promise.all([
      getScenicList({ pageSize: 4 }),
      getRouteList({ pageSize: 10 }),
    ])

    if (scenicRes.code === 0) scenics.value = scenicRes.data.list
    if (routeRes.code === 0) routes.value = routeRes.data.list
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.tickets-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-hero {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #1a365d 0%, #6b21a8 50%, #1a365d 100%);
  background-image: url('https://images.pexels.com/photos/39452364/pexels-photo-39452364.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(107, 33, 168, 0.85) 50%, rgba(26, 54, 93, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(26, 54, 93, 0.8) 0%, rgba(107, 33, 168, 0.7) 100%);
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

.scenic-section {
  margin-top: -40px;
  position: relative;
  z-index: 10;
  margin-bottom: 60px;

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

    .count {
      color: var(--text-light);
      font-size: 14px;
      margin-left: auto;
    }
  }
}

.scenic-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.scenic-card {
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

  .scenic-image {
    position: relative;
    height: 180px;
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
        font-size: 28px;
      }

      span {
        font-size: 13px;
      }
    }

    .scenic-type {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
  }

  .scenic-info {
    padding: 20px;

    h3 {
      font-size: 17px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 10px;
    }

    .scenic-desc {
      font-size: 13px;
      color: var(--text-light);
      line-height: 1.5;
      margin-bottom: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .scenic-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-light);

        .el-icon {
          font-size: 14px;
          color: var(--primary-color);
        }
      }
    }

    .scenic-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-info {
        .ticket-price {
          color: var(--chinese-red);
          font-size: 20px;
          font-weight: 700;
        }

        .ticket-free {
          color: var(--nature-green);
          font-size: 18px;
          font-weight: 600;
        }
      }

      .detail-btn {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border: none;
      }
    }
  }
}

.route-section {
  margin-bottom: 60px;

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
        background: linear-gradient(90deg, var(--secondary-color), transparent);
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

.route-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.route-item {
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(107, 33, 168, 0.18);

    .image-overlay {
      opacity: 1;
    }

    .image {
      transform: scale(1.08);
    }
  }

  .route-image {
    width: 300px;
    height: 200px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;

    .image {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(107, 33, 168, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: white;
      opacity: 0;
      transition: opacity 0.3s;

      .el-icon {
        font-size: 28px;
      }

      span {
        font-size: 13px;
      }
    }

    .route-type {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, var(--accent-color), #b8960c);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
  }

  .route-content {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;

    .content-header {
      margin-bottom: 14px;

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 8px;
      }

      .route-desc {
        font-size: 14px;
        color: var(--text-light);
        line-height: 1.6;
      }
    }

    .route-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;

      .el-tag {
        background: rgba(107, 33, 168, 0.08);
        border: none;
        color: var(--secondary-color);
      }
    }

    .route-meta {
      display: flex;
      gap: 24px;
      margin-top: auto;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--text-light);

        .el-icon {
          font-size: 15px;
          color: var(--secondary-color);
        }
      }
    }
  }

  .route-action {
    width: 160px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    border-left: 1px dashed var(--border-color);
    background: linear-gradient(180deg, rgba(107, 33, 168, 0.03), rgba(107, 33, 168, 0.08));

    .route-price {
      text-align: center;

      .price {
        color: var(--chinese-red);
        font-size: 32px;
        font-weight: 700;
      }

      .unit {
        color: var(--text-light);
        font-size: 14px;
      }
    }

    .book-btn {
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      border: none;
      width: 100%;
    }
  }
}

@media (max-width: 1024px) {
  .scenic-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .route-item {
    flex-direction: column;

    .route-image {
      width: 100%;
      height: 220px;
    }

    .route-action {
      width: 100%;
      flex-direction: row;
      border-left: none;
      border-top: 1px dashed var(--border-color);
      justify-content: space-between;
      padding: 20px 24px;
    }
  }
}

@media (max-width: 768px) {
  .scenic-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .scenic-section {
    margin-top: -30px;
  }

  .route-item {
    .route-content {
      padding: 16px;

      .content-header h3 {
        font-size: 17px;
      }

      .route-meta {
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  }
}
</style>
