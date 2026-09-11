<template>
  <div class="home">
    <!-- 全屏Banner轮播 -->
    <section class="banner-section">
      <el-carousel height="100vh" trigger="click" indicator-position="outside" arrow="always">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-tag">{{ banner.tag }}</span>
              <h1 class="banner-title">{{ banner.title }}</h1>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
              <div class="banner-actions">
                <el-button type="primary" size="large" round @click="$router.push(banner.link)">
                  立即探索
                </el-button>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 民俗特色模块入口 -->
    <section class="module-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">✦</span>
          探索乌东
          <span class="title-en">EXPLORE WUDONG</span>
        </h2>
        <p class="section-desc">一站式体验苗族文化之美</p>
      </div>
      <div class="module-grid">
        <router-link to="/products" class="module-card">
          <div class="module-icon-wrap">
            <img src="https://images.pexels.com/photos/15955334/pexels-photo-15955334.jpeg?auto=compress&cs=tinysrgb&w=400" alt="非遗商品" class="module-bg-icon" />
            <div class="module-icon">👘</div>
          </div>
          <h3>非遗华服</h3>
          <p>苗族银饰 · 蜡染刺绣</p>
          <div class="module-arrow">→</div>
        </router-link>
        <router-link to="/restaurants" class="module-card">
          <div class="module-icon-wrap">
            <img src="https://images.pexels.com/photos/34156954/pexels-photo-34156954.jpeg?auto=compress&cs=tinysrgb&w=400" alt="餐饮美食" class="module-bg-icon" />
            <div class="module-icon">🍲</div>
          </div>
          <h3>苗家风味</h3>
          <p>酸汤鱼 · 长桌宴</p>
          <div class="module-arrow">→</div>
        </router-link>
        <router-link to="/hotels" class="module-card">
          <div class="module-icon-wrap">
            <img src="https://images.pexels.com/photos/16582298/pexels-photo-16582298.jpeg?auto=compress&cs=tinysrgb&w=400" alt="住宿预订" class="module-bg-icon" />
            <div class="module-icon">🏠</div>
          </div>
          <h3>吊脚楼宿</h3>
          <p>精品民宿 · 木楼客栈</p>
          <div class="module-arrow">→</div>
        </router-link>
        <router-link to="/tickets" class="module-card">
          <div class="module-icon-wrap">
            <img src="https://images.pexels.com/photos/6129969/pexels-photo-6129969.jpeg?auto=compress&cs=tinysrgb&w=400" alt="线路订票" class="module-bg-icon" />
            <div class="module-icon">🎫</div>
          </div>
          <h3>山水胜境</h3>
          <p>梯田日出 · 古寨探秘</p>
          <div class="module-arrow">→</div>
        </router-link>
        <router-link to="/community" class="module-card">
          <div class="module-icon-wrap">
            <img src="https://images.pexels.com/photos/31119469/pexels-photo-31119469.jpeg?auto=compress&cs=tinysrgb&w=400" alt="社区分享" class="module-bg-icon" />
            <div class="module-icon">📷</div>
          </div>
          <h3>人文纪行</h3>
          <p>游客分享 · 精彩游记</p>
          <div class="module-arrow">→</div>
        </router-link>
      </div>
    </section>

    <!-- 民俗文化展示 -->
    <section class="culture-section">
      <div class="culture-bg">
        <div class="culture-content">
          <div class="culture-text">
            <h2>千年苗寨 · 文化传承</h2>
            <p>乌东村位于贵州黔东南苗族侗族自治州，是国家级传统村落。这里保存着完整的苗族传统文化，银饰锻造、蜡染刺绣、苗年节庆等非物质文化遗产代代相传。</p>
            <div class="culture-features">
              <div class="feature-item">
                <span class="feature-num">1000+</span>
                <span class="feature-label">历史年份</span>
              </div>
              <div class="feature-item">
                <span class="feature-num">50+</span>
                <span class="feature-label">非遗项目</span>
              </div>
              <div class="feature-item">
                <span class="feature-num">30+</span>
                <span class="feature-label">民俗活动</span>
              </div>
            </div>
          </div>
          <div class="culture-images">
            <img src="https://images.pexels.com/photos/16582298/pexels-photo-16582298.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="苗族文化" class="culture-img-main" />
            <img src="https://images.pexels.com/photos/15955334/pexels-photo-15955334.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="苗族服饰" class="culture-img-sub" />
          </div>
        </div>
      </div>
    </section>

    <!-- 非遗好物 -->
    <section class="recommend-section container">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            非遗好物
            <span class="title-en">HERITAGE CRAFTS</span>
          </h2>
          <p class="section-desc">手工匠心 · 代代相传</p>
        </div>
        <router-link to="/products" class="more-link">
          查看更多 <span>→</span>
        </router-link>
      </div>
      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/products/${product.id}`)">
          <div class="product-image">
            <el-image :src="product.coverImage || '/placeholder.svg'" fit="cover" class="product-img" />
            <span class="heritage-tag" v-if="product.heritageLevel > 0">
              {{ heritageLabels[product.heritageLevel] }}
            </span>
            <div class="product-overlay">
              <span class="view-detail">查看详情</span>
            </div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-bottom">
              <div class="product-price">
                <span class="price">¥{{ (product.price / 100).toFixed(2) }}</span>
                <span class="original" v-if="product.originalPrice">¥{{ (product.originalPrice / 100).toFixed(2) }}</span>
              </div>
              <span class="product-sales">已售 {{ product.sales || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色美食 -->
    <section class="recommend-section container">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            特色美食
            <span class="title-en">LOCAL CUISINE</span>
          </h2>
          <p class="section-desc">苗家味道 · 舌尖记忆</p>
        </div>
        <router-link to="/restaurants" class="more-link">
          查看更多 <span>→</span>
        </router-link>
      </div>
      <div class="restaurant-grid">
        <div v-for="restaurant in restaurants" :key="restaurant.id" class="restaurant-card" @click="$router.push(`/restaurants/${restaurant.id}`)">
          <div class="restaurant-image">
            <el-image :src="restaurant.coverImage || '/placeholder.svg'" fit="cover" class="restaurant-img" />
            <div class="restaurant-badge">{{ restaurant.hotelType || '特色餐厅' }}</div>
          </div>
          <div class="restaurant-info">
            <h4 class="restaurant-name">{{ restaurant.name }}</h4>
            <div class="restaurant-meta">
              <el-rate v-model="restaurant.rating" disabled size="small" show-score />
              <span class="avg-price">人均 ¥{{ ((restaurant.avgPrice || 0) / 100).toFixed(0) }}</span>
            </div>
            <div class="restaurant-tags">
              <el-tag v-for="tag in (restaurant.tags || []).slice(0, 3)" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>
            <p class="restaurant-desc">{{ restaurant.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 精品民宿 -->
    <section class="recommend-section container">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            精品民宿
            <span class="title-en">BOUTIQUE STAYS</span>
          </h2>
          <p class="section-desc">吊脚楼韵 · 诗意栖居</p>
        </div>
        <router-link to="/hotels" class="more-link">
          查看更多 <span>→</span>
        </router-link>
      </div>
      <div class="hotel-grid">
        <div v-for="hotel in hotels" :key="hotel.id" class="hotel-card" @click="$router.push(`/hotels/${hotel.id}`)">
          <div class="hotel-image">
            <el-image :src="hotel.coverImage || '/placeholder.svg'" fit="cover" class="hotel-img" />
            <div class="hotel-type-tag">{{ hotel.hotelType }}</div>
            <div class="hotel-overlay">
              <span class="hotel-price-tag">
                <span class="from">起</span>
                <span class="price">¥{{ ((hotel.minPrice || 0) / 100).toFixed(0) }}</span>
                <span class="unit">/晚</span>
              </span>
            </div>
          </div>
          <div class="hotel-info">
            <h4 class="hotel-name">{{ hotel.name }}</h4>
            <p class="hotel-address">
              <el-icon><Location /></el-icon>
              {{ hotel.address }}
            </p>
            <div class="hotel-rating" v-if="hotel.rating">
              <el-rate v-model="hotel.rating" disabled size="small" show-score />
              <span class="review-count">{{ hotel.reviewCount || 0 }}条评价</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 精选路线 -->
    <section class="recommend-section container">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">
            <span class="title-icon">✦</span>
            精选路线
            <span class="title-en">CURATED ROUTES</span>
          </h2>
          <p class="section-desc">山水画卷 · 深度体验</p>
        </div>
        <router-link to="/tickets" class="more-link">
          查看更多 <span>→</span>
        </router-link>
      </div>
      <div class="route-grid">
        <div v-for="route in routes" :key="route.id" class="route-card" @click="$router.push(`/routes/${route.id}`)">
          <div class="route-image">
            <el-image :src="route.coverImage || '/placeholder.svg'" fit="cover" class="route-img" />
            <div class="route-type-tag">{{ route.routeType }}</div>
          </div>
          <div class="route-info">
            <h4 class="route-name">{{ route.name }}</h4>
            <p class="route-desc">{{ route.description }}</p>
            <div class="route-meta">
              <span><el-icon><Clock /></el-icon> {{ route.meetingTime }}</span>
              <span><el-icon><User /></el-icon> {{ route.minPeople }}-{{ route.maxPeople }}人</span>
            </div>
            <div class="route-bottom">
              <div class="route-price">
                <span class="price">¥{{ ((route.price || 0) / 100).toFixed(0) }}</span>
                <span class="unit">/人</span>
              </div>
              <el-button type="primary" size="small" round>立即预订</el-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 社区精选 -->
    <section class="community-section">
      <div class="container">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">
              <span class="title-icon">✦</span>
              社区精选
              <span class="title-en">COMMUNITY HIGHLIGHTS</span>
            </h2>
            <p class="section-desc">旅途故事 · 人文纪行</p>
          </div>
          <router-link to="/community" class="more-link">
            查看更多 <span>→</span>
          </router-link>
        </div>
        <div class="post-grid">
          <div v-for="post in posts" :key="post.id" class="post-card" @click="$router.push(`/community/post/${post.id}`)">
            <div class="post-images" v-if="post.images && post.images.length">
              <el-image :src="post.images[0]" fit="cover" class="post-img" />
              <span class="image-count" v-if="post.images.length > 1">
                <el-icon><Grid /></el-icon> {{ post.images.length }}图
              </span>
            </div>
            <div class="post-content">
              <p class="post-text">{{ post.content }}</p>
              <div class="post-tags" v-if="post.tags && post.tags.length">
                <el-tag v-for="tag in post.tags.slice(0, 3)" :key="tag" size="small" type="warning" effect="plain">{{ tag }}</el-tag>
              </div>
              <div class="post-meta">
                <div class="post-author">
                  <el-avatar :size="32">{{ post.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
                  <span class="author-name">{{ post.user?.nickname || '匿名用户' }}</span>
                </div>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likeCount || 0 }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Location, Clock, User, View, Star, ChatDotRound, Grid } from '@element-plus/icons-vue'
import { getRecommendProducts } from '@/api/product'
import { getRecommendRestaurants } from '@/api/restaurant'
import { getRecommendHotels } from '@/api/hotel'
import { getRecommendRoutes } from '@/api/ticket'
import { getFeaturedPosts } from '@/api/community'

// 高质量Banner图片 - 真实贵州乌东苗族风景人文
const banners = ref([
  {
    image: 'https://images.pexels.com/photos/6129969/pexels-photo-6129969.jpeg?auto=compress&cs=tinysrgb&w=1920',
    tag: '世界遗产',
    title: '乌东梯田',
    subtitle: '层层叠叠的稻田画廊，云海翻涌的人间仙境',
    link: '/tickets'
  },
  {
    image: 'https://images.pexels.com/photos/16582298/pexels-photo-16582298.jpeg?auto=compress&cs=tinysrgb&w=1920',
    tag: '特色民宿',
    title: '吊脚楼韵',
    subtitle: '依山而建的苗家木楼，感受千年建筑智慧',
    link: '/hotels'
  },
  {
    image: 'https://images.pexels.com/photos/15955334/pexels-photo-15955334.jpeg?auto=compress&cs=tinysrgb&w=1920',
    tag: '非遗传承',
    title: '苗银华彩',
    subtitle: '精美银饰代代相传，匠心独运的民族瑰宝',
    link: '/products'
  },
  {
    image: 'https://images.pexels.com/photos/31119469/pexels-photo-31119469.jpeg?auto=compress&cs=tinysrgb&w=1920',
    tag: '人文纪行',
    title: '苗年盛典',
    subtitle: '欢歌笑语庆丰收，热情似火的民族狂欢',
    link: '/community'
  }
])

const heritageLabels = ['', '县级非遗', '州级非遗', '省级非遗', '国家级非遗']

const products = ref([])
const restaurants = ref([])
const hotels = ref([])
const routes = ref([])
const posts = ref([])

onMounted(async () => {
  try {
    const [productRes, restaurantRes, hotelRes, routeRes, postRes] = await Promise.all([
      getRecommendProducts(4),
      getRecommendRestaurants(4),
      getRecommendHotels(4),
      getRecommendRoutes(4),
      getFeaturedPosts(6),
    ])

    if (productRes.code === 0) products.value = productRes.data
    if (restaurantRes.code === 0) restaurants.value = restaurantRes.data
    if (hotelRes.code === 0) hotels.value = hotelRes.data
    if (routeRes.code === 0) routes.value = routeRes.data
    if (postRes.code === 0) posts.value = postRes.data
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})
</script>

<style scoped lang="scss">
// 变量定义
:root {
  --primary-color: #1a365d;
  --secondary-color: #6b21a8;
  --accent-color: #d4af37;
  --nature-green: #166534;
  --chinese-red: #991b1b;
  --warm-wood: #8b4513;
  --bg-light: #faf5f0;
  --text-color: #333;
  --text-light: #666;
  --border-color: #e8e0d8;
}

// 通用容器
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

// Banner区域 - 全屏轮播
.banner-section {
  .banner-item {
    height: 100vh;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(26, 54, 93, 0.7) 0%,
        rgba(107, 33, 168, 0.5) 50%,
        rgba(0, 0, 0, 0.6) 100%
      );
    }

    .banner-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      max-width: 800px;
      padding: 0 20px;

      .banner-tag {
        display: inline-block;
        padding: 8px 20px;
        background: rgba(212, 175, 55, 0.9);
        border-radius: 30px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 24px;
        letter-spacing: 2px;
      }

      h1 {
        font-size: 72px;
        font-weight: 700;
        margin-bottom: 20px;
        text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);
        letter-spacing: 8px;
      }

      p {
        font-size: 24px;
        opacity: 0.95;
        margin-bottom: 40px;
        line-height: 1.6;
      }

      .banner-actions {
        :deep(.el-button) {
          background: var(--accent-color);
          border-color: var(--accent-color);
          padding: 16px 48px;
          font-size: 18px;
          border-radius: 40px;

          &:hover {
            background: darken(#d4af37, 10%);
            border-color: darken(#d4af37, 10%);
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  :deep(.el-carousel__indicators) {
    bottom: 40px;

    .el-carousel__indicator {
      padding: 0 8px;

      .el-carousel__button {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transition: all 0.3s;
      }

      &.is-active .el-carousel__button {
        background: var(--accent-color);
        width: 36px;
        border-radius: 6px;
      }
    }
  }

  :deep(.el-carousel__arrow) {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(4px);

    &:hover {
      background: rgba(212, 175, 55, 0.8);
      border-color: var(--accent-color);
    }
  }
}

// 通用标题样式
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;

  .header-left {
    flex: 1;
  }

  .section-title {
    font-size: 36px;
    color: var(--primary-color);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;

    .title-icon {
      color: var(--accent-color);
      font-size: 24px;
    }

    .title-en {
      font-size: 14px;
      color: var(--text-light);
      font-weight: 400;
      letter-spacing: 2px;
      margin-left: 8px;
    }
  }

  .section-desc {
    font-size: 16px;
    color: var(--text-light);
    margin-left: 36px;
  }

  .more-link {
    color: var(--text-light);
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.3s;

    &:hover {
      color: var(--accent-color);
      gap: 8px;
    }
  }
}

// 模块入口区域
.module-section {
  padding: 100px 40px;
  background: linear-gradient(180deg, var(--bg-light) 0%, #fff 100%);

  .module-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .module-card {
    position: relative;
    background: white;
    border-radius: 20px;
    padding: 40px 24px;
    text-align: center;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

    &:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 40px rgba(26, 54, 93, 0.15);

      .module-icon-wrap {
        .module-bg-icon {
          transform: scale(1.1);
          filter: brightness(0.8);
        }
      }

      .module-arrow {
        transform: translateX(8px);
        color: var(--accent-color);
      }
    }

    .module-icon-wrap {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      border-radius: 50%;
      overflow: hidden;

      .module-bg-icon {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.4s;
      }

      .module-icon {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        background: rgba(26, 54, 93, 0.75);
        color: white;
        transition: all 0.3s;
      }
    }

    h3 {
      font-size: 22px;
      color: var(--primary-color);
      margin-bottom: 8px;
      font-weight: 600;
    }

    p {
      font-size: 14px;
      color: var(--text-light);
      line-height: 1.6;
    }

    .module-arrow {
      margin-top: 16px;
      font-size: 20px;
      color: var(--text-light);
      transition: all 0.3s;
    }
  }
}

// 民俗文化展示区
.culture-section {
  .culture-bg {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    padding: 100px 0;

    .culture-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }

    .culture-text {
      color: white;

      h2 {
        font-size: 42px;
        margin-bottom: 24px;
        font-weight: 700;
        letter-spacing: 4px;
      }

      p {
        font-size: 18px;
        line-height: 2;
        opacity: 0.9;
        margin-bottom: 40px;
      }

      .culture-features {
        display: flex;
        gap: 60px;

        .feature-item {
          display: flex;
          flex-direction: column;

          .feature-num {
            font-size: 48px;
            font-weight: 700;
            color: var(--accent-color);
          }

          .feature-label {
            font-size: 16px;
            opacity: 0.8;
          }
        }
      }
    }

    .culture-images {
      position: relative;
      height: 400px;

      .culture-img-main {
        width: 100%;
        height: 350px;
        object-fit: cover;
        border-radius: 20px;
        position: absolute;
        top: 0;
        left: 0;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .culture-img-sub {
        width: 250px;
        height: 180px;
        object-fit: cover;
        border-radius: 16px;
        position: absolute;
        bottom: 0;
        right: 40px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        border: 4px solid white;
      }
    }
  }
}

// 推荐模块通用样式
.recommend-section {
  padding: 100px 40px;
  background: white;

  &:nth-of-type(odd) {
    background: var(--bg-light);
  }
}

// 商品卡片
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

    .product-img {
      transform: scale(1.08);
    }

    .product-overlay {
      opacity: 1;
    }
  }

  .product-image {
    position: relative;
    height: 220px;
    overflow: hidden;

    .product-img {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .heritage-tag {
      position: absolute;
      top: 16px;
      right: 16px;
      background: linear-gradient(135deg, var(--accent-color), #b8860b);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
    }

    .product-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 54, 93, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;

      .view-detail {
        color: white;
        font-size: 16px;
        padding: 12px 24px;
        border: 2px solid white;
        border-radius: 30px;
      }
    }
  }

  .product-info {
    padding: 20px;

    .product-name {
      font-size: 18px;
      color: var(--primary-color);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .product-desc {
      font-size: 14px;
      color: var(--text-light);
      margin-bottom: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .product-price {
        display: flex;
        align-items: baseline;
        gap: 8px;

        .price {
          color: var(--chinese-red);
          font-size: 24px;
          font-weight: 700;
        }

        .original {
          color: var(--text-light);
          font-size: 14px;
          text-decoration: line-through;
        }
      }

      .product-sales {
        font-size: 12px;
        color: var(--text-light);
      }
    }
  }
}

// 餐厅卡片
.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.restaurant-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

    .restaurant-img {
      transform: scale(1.08);
    }
  }

  .restaurant-image {
    width: 280px;
    height: 200px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;

    .restaurant-img {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .restaurant-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--accent-color);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
  }

  .restaurant-info {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;

    .restaurant-name {
      font-size: 20px;
      color: var(--primary-color);
      margin-bottom: 12px;
      font-weight: 600;
    }

    .restaurant-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;

      .avg-price {
        color: var(--text-light);
        font-size: 14px;
      }
    }

    .restaurant-tags {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
    }

    .restaurant-desc {
      font-size: 14px;
      color: var(--text-light);
      line-height: 1.6;
      flex: 1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

// 民宿卡片
.hotel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.hotel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

    .hotel-img {
      transform: scale(1.08);
    }
  }

  .hotel-image {
    position: relative;
    height: 180px;
    overflow: hidden;

    .hotel-img {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .hotel-type-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(26, 54, 93, 0.85);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    }

    .hotel-overlay {
      position: absolute;
      bottom: 12px;
      right: 12px;

      .hotel-price-tag {
        background: rgba(153, 27, 27, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;

        .from {
          font-size: 12px;
          margin-right: 4px;
        }

        .price {
          font-size: 20px;
          font-weight: 700;
        }

        .unit {
          font-size: 12px;
        }
      }
    }
  }

  .hotel-info {
    padding: 16px;

    .hotel-name {
      font-size: 18px;
      color: var(--primary-color);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .hotel-address {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-light);
      margin-bottom: 8px;

      .el-icon {
        color: var(--accent-color);
      }
    }

    .hotel-rating {
      display: flex;
      align-items: center;
      gap: 8px;

      .review-count {
        font-size: 12px;
        color: var(--text-light);
      }
    }
  }
}

// 路线卡片
.route-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.route-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

    .route-img {
      transform: scale(1.08);
    }
  }

  .route-image {
    position: relative;
    height: 160px;
    overflow: hidden;

    .route-img {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .route-type-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, var(--nature-green), #0d5c28);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
  }

  .route-info {
    padding: 16px;

    .route-name {
      font-size: 18px;
      color: var(--primary-color);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .route-desc {
      font-size: 13px;
      color: var(--text-light);
      margin-bottom: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .route-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--text-light);
      margin-bottom: 16px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          color: var(--accent-color);
        }
      }
    }

    .route-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .route-price {
        .price {
          color: var(--chinese-red);
          font-size: 24px;
          font-weight: 700;
        }

        .unit {
          color: var(--text-light);
          font-size: 13px;
        }
      }

      :deep(.el-button) {
        background: var(--accent-color);
        border-color: var(--accent-color);

        &:hover {
          background: darken(#d4af37, 10%);
          border-color: darken(#d4af37, 10%);
        }
      }
    }
  }
}

// 社区精选
.community-section {
  padding: 100px 0;
  background: linear-gradient(180deg, white 0%, var(--bg-light) 100%);
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

    .post-img {
      transform: scale(1.08);
    }
  }

  .post-images {
    position: relative;
    height: 200px;
    overflow: hidden;

    .post-img {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .image-count {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .post-content {
    padding: 16px;

    .post-text {
      font-size: 14px;
      color: var(--text-color);
      line-height: 1.6;
      margin-bottom: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .post-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .post-author {
        display: flex;
        align-items: center;
        gap: 8px;

        .author-name {
          font-size: 13px;
          color: var(--text-light);
        }
      }

      .post-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--text-light);

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

// 页脚由 MainLayout 统一提供，此处不再重复定义

@media (max-width: 1024px) {
  .module-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .product-grid,
  .hotel-grid,
  .route-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .culture-section .culture-content {
    grid-template-columns: 1fr;
    gap: 40px;

    .culture-images {
      height: 300px;
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .banner-section .banner-content h1 {
    font-size: 48px;
    letter-spacing: 4px;
  }

  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-grid,
  .hotel-grid,
  .route-grid,
  .restaurant-grid {
    grid-template-columns: 1fr;
  }
}
</style>
