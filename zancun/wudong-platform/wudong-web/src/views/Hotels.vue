<template>
  <div class="hotels-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>特色住宿</h1>
        <p>体验苗族吊脚楼、侗家木楼等特色民宿</p>
      </div>
    </div>

    <div class="container">
      <!-- 民宿类型筛选 -->
      <div class="filter-section">
        <div class="filter-header">
          <h2>住宿类型</h2>
        </div>
        <div class="filter-tabs">
          <div
            class="filter-tab"
            :class="{ active: selectedType === null }"
            @click="handleTypeChange(null)"
          >
            <div class="tab-icon">🏡</div>
            <span>全部</span>
          </div>
          <div
            class="filter-tab"
            :class="{ active: selectedType === '吊脚楼' }"
            @click="handleTypeChange('吊脚楼')"
          >
            <div class="tab-icon">🏯</div>
            <span>吊脚楼</span>
          </div>
          <div
            class="filter-tab"
            :class="{ active: selectedType === '木楼' }"
            @click="handleTypeChange('木楼')"
          >
            <div class="tab-icon">🏠</div>
            <span>木楼</span>
          </div>
          <div
            class="filter-tab"
            :class="{ active: selectedType === '现代与传统结合' }"
            @click="handleTypeChange('现代与传统结合')"
          >
            <div class="tab-icon">🏨</div>
            <span>现代风格</span>
          </div>
          <div
            class="filter-tab"
            :class="{ active: selectedType === '田园风格' }"
            @click="handleTypeChange('田园风格')"
          >
            <div class="tab-icon">🌾</div>
            <span>田园风格</span>
          </div>
        </div>
      </div>

      <!-- 民宿列表 -->
      <div class="hotel-section">
        <div class="section-header">
          <h2>精选民宿</h2>
          <span class="hotel-count">共 {{ pagination.total }} 家</span>
        </div>

        <div class="hotel-list" v-loading="loading">
          <div v-if="hotels.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🏡</div>
            <p>暂无民宿</p>
          </div>

          <div
            v-for="hotel in hotels"
            :key="hotel.id"
            class="hotel-card card"
            @click="$router.push(`/hotels/${hotel.id}`)"
          >
            <div class="hotel-image">
              <el-image
                :src="hotel.coverImage || '/placeholder.svg'"
                :alt="hotel.name"
                fit="cover"
                class="image"
              />
              <div class="image-overlay">
                <el-icon><View /></el-icon>
                <span>查看详情</span>
              </div>
              <div class="image-tags">
                <span class="hotel-type-tag">{{ hotel.hotelType }}</span>
                <span class="recommend-tag" v-if="hotel.isRecommend">推荐</span>
              </div>
            </div>
            <div class="hotel-info">
              <h3 class="hotel-name">{{ hotel.name }}</h3>
              <p class="hotel-desc">{{ hotel.description }}</p>
              <div class="hotel-tags">
                <el-tag v-for="tag in (hotel.tags || []).slice(0, 3)" :key="tag" size="small" effect="plain">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="hotel-footer">
                <div class="hotel-address">
                  <el-icon><Location /></el-icon>
                  {{ hotel.address }}
                </div>
                <div class="hotel-price">
                  <span class="from">起</span>
                  <span class="price">¥{{ (hotel.minPrice / 100).toFixed(0) }}</span>
                  <span class="unit">/晚</span>
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
            @current-change="loadHotels"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Location, View } from '@element-plus/icons-vue'
import { getHotelList } from '@/api/hotel'

const loading = ref(false)
const selectedType = ref(null)
const hotels = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0,
})

const loadHotels = async () => {
  loading.value = true
  try {
    const res = await getHotelList({
      hotelType: selectedType.value,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    if (res.code === 0) {
      hotels.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to load hotels:', error)
  } finally {
    loading.value = false
  }
}

const handleTypeChange = (type) => {
  selectedType.value = type
  pagination.page = 1
  loadHotels()
}

onMounted(() => {
  loadHotels()
})
</script>

<style scoped lang="scss">
.hotels-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-hero {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #166534 0%, #1a365d 50%, #166534 100%);
  background-image: url('https://images.pexels.com/photos/31906851/pexels-photo-31906851.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(22, 101, 52, 0.9) 0%, rgba(26, 54, 93, 0.85) 50%, rgba(22, 101, 52, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(22, 101, 52, 0.8) 0%, rgba(26, 54, 93, 0.7) 100%);
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

.filter-section {
  margin-top: -50px;
  position: relative;
  z-index: 10;
  margin-bottom: 40px;

  .filter-header {
    margin-bottom: 16px;

    h2 {
      font-size: 20px;
      color: var(--primary-color);
    }
  }

  .filter-tabs {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 8px 0;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .filter-tab {
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
    box-shadow: 0 4px 16px rgba(22, 101, 52, 0.08);
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
      box-shadow: 0 8px 24px rgba(22, 101, 52, 0.15);
    }

    &.active {
      border-color: var(--nature-green);
      background: linear-gradient(135deg, rgba(22, 101, 52, 0.1), rgba(22, 101, 52, 0.05));

      span {
        color: var(--nature-green);
      }
    }
  }
}

.hotel-section {
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
        background: linear-gradient(90deg, var(--nature-green), transparent);
        border-radius: 2px;
      }
    }

    .hotel-count {
      color: var(--text-light);
      font-size: 14px;
      margin-left: auto;
    }
  }
}

.hotel-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.hotel-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 48px rgba(22, 101, 52, 0.18);

    .image-overlay {
      opacity: 1;
    }

    .image {
      transform: scale(1.08);
    }
  }

  .hotel-image {
    position: relative;
    height: 240px;
    overflow: hidden;

    .image {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(22, 101, 52, 0.6);
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

    .image-tags {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;

      .hotel-type-tag {
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
      }

      .recommend-tag {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
      }
    }
  }

  .hotel-info {
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .hotel-name {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 12px;
    }

    .hotel-desc {
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

    .hotel-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      .el-tag {
        background: rgba(22, 101, 52, 0.08);
        border: none;
        color: var(--nature-green);
      }
    }

    .hotel-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px dashed var(--border-color);

      .hotel-address {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--text-light);

        .el-icon {
          color: var(--nature-green);
        }
      }

      .hotel-price {
        display: flex;
        align-items: baseline;
        gap: 4px;

        .from {
          color: var(--text-light);
          font-size: 13px;
        }

        .price {
          color: var(--chinese-red);
          font-size: 26px;
          font-weight: 700;
        }

        .unit {
          color: var(--text-light);
          font-size: 13px;
        }
      }
    }
  }
}

.empty-state {
  grid-column: span 2;
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

@media (max-width: 768px) {
  .hotel-list {
    grid-template-columns: 1fr;
  }

  .filter-section {
    margin-top: -30px;

    .filter-tab {
      padding: 12px 16px;

      .tab-icon {
        font-size: 24px;
      }
    }
  }

  .empty-state {
    grid-column: span 1;
  }
}
</style>
