<template>
  <div class="community-page">
    <!-- Hero Section -->
    <div class="community-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>社区分享</h1>
        <p>分享你的乌东之旅，记录美好瞬间</p>
      </div>
    </div>

    <div class="container">
      <!-- 发布入口 -->
      <div class="publish-section" v-if="userStore.isLoggedIn">
        <div class="publish-card">
          <div class="user-avatar">
            <el-avatar :size="48">{{ userStore.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
          </div>
          <div class="publish-input">
            <el-input
              type="textarea"
              v-model="newPostContent"
              placeholder="分享你的乌东故事，感受苗寨风情..."
              :rows="2"
              readonly
              @click="showPublishDialog = true"
            />
            <div class="publish-actions">
              <div class="action-tags">
                <el-tag v-for="tag in quickTags" :key="tag" size="small" effect="plain" @click="addTag(tag)">{{ tag }}</el-tag>
              </div>
              <el-button type="primary" @click="showPublishDialog = true">
                <el-icon><Edit /></el-icon>
                发布帖子
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="login-tip" v-else>
        <el-icon><User /></el-icon>
        <span>登录后即可分享你的乌东之旅</span>
        <el-button type="primary" @click="$router.push('/login')">立即登录</el-button>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-section">
        <div class="section-header">
          <h2>精彩分享</h2>
          <span class="post-count">共 {{ pagination.total }} 篇</span>
        </div>

        <div class="post-list" v-loading="loading">
          <div v-if="posts.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">
              <el-icon><Picture /></el-icon>
            </div>
            <p>暂无帖子，成为第一个分享者吧！</p>
          </div>

          <div
            v-for="post in posts"
            :key="post.id"
            class="post-card card"
            @click="$router.push(`/community/post/${post.id}`)"
          >
            <div class="post-header">
              <div class="user-info">
                <el-avatar :size="44" class="user-avatar">{{ post.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
                <div class="user-detail">
                  <span class="username">{{ post.user?.nickname || '匿名游客' }}</span>
                  <span class="time">{{ formatTime(post.createTime) }}</span>
                </div>
              </div>
              <el-tag v-if="post.isFeatured" type="warning" effect="dark" class="featured-tag">
                <el-icon><Star /></el-icon>
                精华
              </el-tag>
            </div>

            <div class="post-content">
              <p class="post-text">{{ post.content }}</p>
            </div>

            <div class="post-images" v-if="post.images && post.images.length">
              <el-image
                v-for="(img, idx) in post.images.slice(0, 3)"
                :key="idx"
                :src="img"
                :preview-src-list="post.images"
                fit="cover"
                class="post-image"
                :class="{ 'single': post.images.length === 1, 'multiple': post.images.length > 1 }"
              />
              <div class="more-overlay" v-if="post.images.length > 3">
                +{{ post.images.length - 3 }}
              </div>
            </div>

            <div class="post-footer">
              <div class="post-tags" v-if="post.tags && post.tags.length">
                <el-tag v-for="tag in post.tags.slice(0, 3)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
              </div>
              <div class="location" v-if="post.location">
                <el-icon><Location /></el-icon>
                {{ post.location }}
              </div>
            </div>

            <div class="post-stats">
              <span class="stat-item" @click.stop="handleLike(post)">
                <el-icon :class="{ 'is-liked': post.isLiked }"><Star /></el-icon>
                {{ post.likeCount }}
              </span>
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ post.commentCount }}
              </span>
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ post.viewCount }}
              </span>
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
            @current-change="loadPosts"
          />
        </div>
      </div>
    </div>

    <!-- 发布对话框 -->
    <el-dialog
      v-model="showPublishDialog"
      title="发布帖子"
      width="680px"
      class="publish-dialog"
    >
      <div class="dialog-user-info">
        <el-avatar :size="48">{{ userStore.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
        <span>{{ userStore.user?.nickname || '匿名游客' }}</span>
      </div>
      <el-form :model="publishForm" label-width="80px">
        <el-form-item label="分享内容">
          <el-input
            type="textarea"
            v-model="publishForm.content"
            :rows="6"
            placeholder="分享你的乌东故事，记录美好瞬间..."
          />
        </el-form-item>
        <el-form-item label="添加标签">
          <el-select v-model="publishForm.tags" multiple filterable allow-create placeholder="选择或输入标签" style="width: 100%">
            <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="添加位置">
          <el-input v-model="publishForm.location" placeholder="添加位置（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelPublish">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="handlePublish" class="publish-btn">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Location, Star, ChatDotRound, View, Edit, User, Picture } from '@element-plus/icons-vue'
import { getPostList, createPost, toggleLike } from '@/api/community'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const loading = ref(false)
const posts = ref([])
const showPublishDialog = ref(false)
const publishing = ref(false)
const newPostContent = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const publishForm = reactive({
  content: '',
  tags: [],
  location: '',
})

const commonTags = ['乌东梯田', '苗族文化', '美食推荐', '民宿体验', '蜡染', '银饰', '篝火晚会', '日出云海']
const quickTags = ['🌾 梯田', '🏠 民宿', '🍲 美食', '🎭 文化']

const addTag = (tag) => {
  const tagText = tag.replace(/^[^\s]+\s/, '')
  if (!publishForm.tags.includes(tagText)) {
    publishForm.tags.push(tagText)
  }
}

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await getPostList({
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    if (res.code === 0) {
      posts.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

const handleLike = async (post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    // 用服务端返回的权威值，别本地累加（否则反复点击会把数字刷高）
    const res = await toggleLike(userStore.user.id, 'post', post.id)
    if (res.code === 0) {
      post.likeCount = res.data.likeCount
      post.isLiked = res.data.liked
    }
  } catch (error) {
    console.error('Failed to like:', error)
  }
}

// 取消发布：关闭弹窗并清空草稿（原来只关弹窗，内容会残留到下次打开）
const cancelPublish = () => {
  showPublishDialog.value = false
  publishForm.content = ''
  publishForm.tags = []
  publishForm.location = ''
}

const handlePublish = async () => {
  if (!publishForm.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  publishing.value = true
  try {
    const res = await createPost({
      userId: userStore.user.id,
      content: publishForm.content,
      tags: publishForm.tags,
      location: publishForm.location,
    })

    if (res.code === 0) {
      ElMessage.success('发布成功')
      cancelPublish()
      loadPosts()
    }
  } catch (error) {
    console.error('Failed to publish:', error)
  } finally {
    publishing.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped lang="scss">
.community-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
}

.community-hero {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #1a365d 0%, #6b21a8 50%, #1a365d 100%);
  background-image: url('https://images.pexels.com/photos/37962589/pexels-photo-37962589.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(107, 33, 168, 0.85) 50%, rgba(26, 54, 93, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(26, 54, 93, 0.7) 0%, rgba(107, 33, 168, 0.6) 100%);
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.publish-section {
  margin-top: -40px;
  position: relative;
  z-index: 10;
  margin-bottom: 30px;

  .publish-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(26, 54, 93, 0.12);
    display: flex;
    gap: 16px;
    border: 1px solid rgba(212, 175, 55, 0.2);

    .user-avatar {
      flex-shrink: 0;
    }

    .publish-input {
      flex: 1;

      :deep(.el-textarea__inner) {
        border: none;
        padding: 8px 0;
        font-size: 15px;
        resize: none;
        // 只是个「点击打开弹窗」的入口，真正的输入在弹窗里
        cursor: pointer;

        &::placeholder {
          color: #999;
        }
      }

      .publish-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border-color);

        .action-tags {
          display: flex;
          gap: 8px;

          .el-tag {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: var(--accent-color);
              color: white;
              border-color: var(--accent-color);
            }
          }
        }
      }
    }
  }
}

.login-tip {
  margin-top: -40px;
  position: relative;
  z-index: 10;
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(26, 54, 93, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);

  .el-icon {
    font-size: 28px;
    color: var(--primary-color);
  }

  span {
    font-size: 16px;
    color: var(--text-color);
  }
}

.posts-section {
  padding-bottom: 60px;

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

    .post-count {
      color: var(--text-light);
      font-size: 14px;
      margin-left: auto;
    }
  }
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26, 54, 93, 0.15);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-avatar {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }

      .user-detail {
        display: flex;
        flex-direction: column;

        .username {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-color);
        }

        .time {
          font-size: 12px;
          color: var(--text-light);
        }
      }
    }

    .featured-tag {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
    }
  }

  .post-content {
    margin-bottom: 16px;

    .post-text {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-color);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .post-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    position: relative;

    .post-image {
      height: 180px;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.02);
      }

      &.single {
        grid-column: span 3;
        height: 320px;
      }

      &.multiple {
        height: 140px;
      }
    }

    .more-overlay {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 140px;
      height: 140px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      border-radius: 8px;
    }
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .post-tags {
      display: flex;
      gap: 8px;

      .el-tag {
        background: rgba(26, 54, 93, 0.08);
        border: none;
        color: var(--primary-color);
      }
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-light);

      .el-icon {
        color: var(--accent-color);
      }
    }
  }

  .post-stats {
    display: flex;
    gap: 32px;
    padding-top: 16px;
    border-top: 1px dashed var(--border-color);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--text-light);
      cursor: pointer;
      transition: color 0.3s;

      .el-icon {
        font-size: 18px;
      }

      .is-liked {
        color: #f59e0b;
      }

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 64px;
    color: var(--border-color);
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
  margin-top: 40px;
}

:deep(.publish-dialog) {
  .el-dialog__header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    margin: 0;
    padding: 20px 24px;

    .el-dialog__title {
      color: white;
    }

    .el-dialog__headerbtn {
      .el-icon {
        color: white;
      }
    }
  }

  .dialog-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);

    span {
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .publish-btn {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border: none;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
