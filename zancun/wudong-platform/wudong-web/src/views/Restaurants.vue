<template>
  <div class="restaurants-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>特色美食</h1>
        <p>品尝地道的苗族、侗族特色美食</p>
      </div>
    </div>

    <div class="container">
      <!-- 搜索和定位 -->
      <div class="search-section">
        <div class="search-bar">
          <el-input
            v-model="keyword"
            placeholder="搜索餐厅名称..."
            size="large"
            clearable
            @clear="loadRestaurants"
            @keyup.enter="loadRestaurants"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button :icon="Search" @click="loadRestaurants">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="location-bar">
          <el-button
            type="primary"
            :icon="Location"
            @click="handleGetLocation"
            :loading="locating"
            class="location-btn"
          >
            {{ userLocation ? '已定位' : '获取位置' }}
          </el-button>
          <span v-if="userLocation" class="location-info">
            您的位置：{{ userLocation.address || `(${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)})` }}
          </span>
          <el-select
            v-if="userLocation"
            v-model="maxDistance"
            placeholder="筛选距离"
            size="default"
            class="distance-select"
          >
            <el-option :value="0" label="不限距离" />
            <el-option :value="1" label="1公里内" />
            <el-option :value="3" label="3公里内" />
            <el-option :value="5" label="5公里内" />
            <el-option :value="10" label="10公里内" />
          </el-select>
        </div>
      </div>

      <!-- 餐厅列表 -->
      <div class="restaurant-section">
        <div class="section-header">
          <h2>热门餐厅</h2>
          <span class="restaurant-count">共 {{ filteredRestaurants.length }} 家</span>
          <el-button
            v-if="sortByDistance"
            type="warning"
            size="small"
            plain
            @click="sortByDistance = false"
            class="sort-btn"
          >
            <el-icon><Sort /></el-icon>
            距离排序
          </el-button>
          <el-button
            v-else
            size="small"
            plain
            @click="sortByDistance = true"
            class="sort-btn"
          >
            <el-icon><Sort /></el-icon>
            距离排序
          </el-button>
        </div>

        <div class="restaurant-list" v-loading="loading">
          <div v-if="filteredRestaurants.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🍽️</div>
            <p v-if="userLocation && maxDistance > 0">当前范围内暂无餐厅</p>
            <p v-else>暂无餐厅</p>
          </div>

          <div
            v-for="restaurant in filteredRestaurants"
            :key="restaurant.id"
            class="restaurant-card card"
            @click="$router.push(`/restaurants/${restaurant.id}`)"
          >
            <div class="restaurant-image">
              <el-image
                :src="restaurant.coverImage || '/placeholder.svg'"
                :alt="restaurant.name"
                fit="cover"
                class="image"
              />
              <div class="image-overlay">
                <el-icon><View /></el-icon>
                <span>查看详情</span>
              </div>
            </div>
            <div class="restaurant-info">
              <div class="info-header">
                <h3 class="restaurant-name">{{ restaurant.name }}</h3>
                <div class="restaurant-meta">
                  <el-rate v-model="restaurant.rating" disabled show-score size="small" />
                  <span class="avg-price">人均 ¥{{ (restaurant.avgPrice / 100).toFixed(0) }}</span>
                </div>
              </div>
              <p class="restaurant-desc">{{ restaurant.description }}</p>
              <div class="restaurant-tags">
                <el-tag v-for="tag in (restaurant.tags || []).slice(0, 3)" :key="tag" size="small" effect="plain">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="restaurant-footer">
                <div class="footer-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ restaurant.address }}</span>
                </div>
                <div class="footer-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ restaurant.businessHours }}</span>
                </div>
                <div class="footer-item" v-if="restaurant.distance !== undefined">
                  <el-icon><MapLocation /></el-icon>
                  <span class="distance-text">距您 {{ formatDistance(restaurant.distance) }}</span>
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
            @current-change="loadRestaurants"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Location, Clock, View, MapLocation, Sort } from '@element-plus/icons-vue'
import { getRestaurantList } from '@/api/restaurant'
import { getUserLocation, calculateDistance, formatDistance as formatDistanceUtil } from '@/utils/geo'
import { updateSeo } from '@/composables/useSeo'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const locating = ref(false)
const keyword = ref('')
const restaurants = ref([])
const userLocation = ref(null)
const maxDistance = ref(0)
const sortByDistance = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 100,
  total: 0,
})

// 计算每个餐厅的距离并过滤
const filteredRestaurants = computed(() => {
  let result = [...restaurants.value]

  // 如果有用户位置且选择了距离范围，进行过滤
  if (userLocation.value && maxDistance.value > 0) {
    result = result.filter(r => {
      if (!r.latitude || !r.longitude) return false
      const dist = calculateDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        parseFloat(r.latitude),
        parseFloat(r.longitude)
      )
      r.distance = dist
      return dist <= maxDistance.value
    })
  } else if (userLocation.value) {
    // 计算距离但不过滤
    result = result.map(r => {
      if (r.latitude && r.longitude) {
        r.distance = calculateDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          parseFloat(r.latitude),
          parseFloat(r.longitude)
        )
      }
      return r
    })
  }

  // 如果选择了按距离排序
  if (sortByDistance.value && userLocation.value) {
    result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
  }

  return result
})

const formatDistance = (dist) => {
  return formatDistanceUtil(dist)
}

// 获取用户位置
const handleGetLocation = async () => {
  locating.value = true
  try {
    const pos = await getUserLocation()
    userLocation.value = pos
    ElMessage.success('已获取您的位置')
    // 重新计算距离
    filteredRestaurants.value
  } catch (error) {
    ElMessage.warning(error.message || '获取位置失败，请检查定位权限')
  } finally {
    locating.value = false
  }
}

const loadRestaurants = async () => {
  loading.value = true
  try {
    const res = await getRestaurantList({
      keyword: keyword.value || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    if (res.code === 0) {
      restaurants.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to load restaurants:', error)
  } finally {
    loading.value = false
  }
}

// 页面SEO
updateSeo({
  title: '特色美食 - 乌东村餐厅推荐',
  description: '乌东村特色美食推荐，品尝地道的苗族、侗族特色美食。支持按距离筛选，查找附近的特色餐厅。',
  keywords: '乌东村美食,苗族美食,侗族美食,特色餐厅,农家乐',
})

onMounted(() => {
  loadRestaurants()
})
</script>

<style scoped lang="scss">
.restaurants-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-hero {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #991b1b 0%, #1a365d 50%, #991b1b 100%);
  background-image: url('https://images.pexels.com/photos/34156954/pexels-photo-34156954.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(153, 27, 27, 0.9) 0%, rgba(26, 54, 93, 0.85) 50%, rgba(153, 27, 27, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(153, 27, 27, 0.8) 0%, rgba(26, 54, 93, 0.7) 100%);
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

.search-section {
  margin-top: -50px;
  position: relative;
  z-index: 10;
  margin-bottom: 40px;

  .search-bar {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(153, 27, 27, 0.15);
    padding: 8px;

    :deep(.search-input) {
      .el-input__wrapper {
        padding: 4px 8px;
        box-shadow: none !important;
        border-radius: 12px;

        .el-input__inner {
          font-size: 15px;
        }
      }

      .el-input-group__append {
        background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0 20px;

        .el-button {
          color: white;
          background: transparent;
          border: none;

          &::before {
            content: '';
          }
        }
      }
    }
  }

  .location-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding: 12px 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(153, 27, 27, 0.08);

    .location-btn {
      background: linear-gradient(135deg, var(--chinese-red), #7f1d1d);
      border: none;
      flex-shrink: 0;

      &:hover {
        opacity: 0.9;
      }
    }

    .location-info {
      font-size: 14px;
      color: var(--text-light);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .distance-select {
      width: 140px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
      }
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
        background: linear-gradient(90deg, var(--chinese-red), transparent);
        border-radius: 2px;
      }
    }

    .restaurant-count {
      color: var(--text-light);
      font-size: 14px;
    }

    .sort-btn {
      margin-left: auto;
    }
  }
}

.restaurant-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.restaurant-card {
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(153, 27, 27, 0.15);

    .image-overlay {
      opacity: 1;
    }

    .image {
      transform: scale(1.08);
    }
  }

  .restaurant-image {
    width: 320px;
    height: 240px;
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
      background: rgba(153, 27, 27, 0.6);
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
  }

  .restaurant-info {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;

    .info-header {
      margin-bottom: 16px;

      .restaurant-name {
        font-size: 22px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 10px;
      }

      .restaurant-meta {
        display: flex;
        align-items: center;
        gap: 20px;

        .avg-price {
          color: var(--chinese-red);
          font-weight: 600;
          font-size: 16px;
        }
      }
    }

    .restaurant-desc {
      font-size: 14px;
      color: var(--text-light);
      line-height: 1.6;
      margin-bottom: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      flex: 1;
    }

    .restaurant-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      .el-tag {
        background: rgba(153, 27, 27, 0.08);
        border: none;
        color: var(--chinese-red);
      }
    }

    .restaurant-footer {
      display: flex;
      gap: 24px;
      padding-top: 16px;
      border-top: 1px dashed var(--border-color);
      flex-wrap: wrap;

      .footer-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-light);

        .el-icon {
          font-size: 16px;
          color: var(--chinese-red);
        }

        .distance-text {
          color: var(--nature-green);
          font-weight: 500;
        }
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
  .restaurant-card {
    flex-direction: column;

    .restaurant-image {
      width: 100%;
      height: 220px;
    }
  }
}

@media (max-width: 768px) {
  .restaurant-card {
    .restaurant-info {
      padding: 16px;

      .info-header .restaurant-name {
        font-size: 18px;
      }
    }
  }

  .search-section {
    margin-top: -30px;
  }
}
</style>
