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
          <div class="publish-card-header">
            <div class="publish-avatar">
              <el-avatar :size="48" :src="userStore.user?.avatar">{{ userStore.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
              <span class="avatar-status" aria-hidden="true"></span>
            </div>
            <div class="publish-heading">
              <strong>分享此刻</strong>
              <span>把乌东的风景与故事，留给更多旅人</span>
            </div>
          </div>
          <div class="publish-input">
            <el-input
              class="publish-textarea"
              type="textarea"
              v-model="newPostContent"
              placeholder="分享你的乌东故事，感受苗寨风情..."
              :rows="2"
              aria-label="分享你的乌东故事"
              readonly
              @click="showPublishDialog = true"
            />
            <div class="publish-meta">
              <span><el-icon><Edit /></el-icon>点击输入，记录旅途中的好心情</span>
              <span class="publish-meta-note">文字 · 位置 · 标签</span>
            </div>
            <div class="publish-actions">
              <div class="action-tags">
                <el-tag v-for="tag in quickTags" :key="tag" size="small" effect="plain" @click.stop="addTag(tag)">{{ tag }}</el-tag>
              </div>
              <el-button type="primary" round @click="showPublishDialog = true">
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
              <el-avatar :size="44" :src="post.user?.avatar" class="user-avatar">{{ post.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
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
                :initial-index="idx"
                preview-teleported
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
              <span class="stat-item" title="点赞" @click.stop="handleLike(post)">
                <el-icon :class="{ 'is-liked': post.isLiked }"><Star /></el-icon>
                点赞 {{ post.likeCount }}
              </span>
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ post.commentCount }}
              </span>
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ post.viewCount }}
              </span>
              <span
                class="stat-item favorite-stat"
                :class="{ 'is-favorited': favoritePostIds.has(String(post.id)) }"
                title="收藏"
                @click.stop="handleFavorite(post)"
              >
                <el-icon><Collection /></el-icon>
                收藏
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
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="dialog-user-info">
        <el-avatar :size="48" :src="userStore.user?.avatar">{{ userStore.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
        <span>{{ userStore.user?.nickname || '匿名游客' }}</span>
      </div>
      <el-form :model="publishForm" label-position="top" class="publish-form">
        <el-form-item label="分享内容">
          <el-input
            type="textarea"
            v-model="publishForm.content"
            :rows="5"
            placeholder="分享你的乌东故事，记录美好瞬间..."
          />
        </el-form-item>
        <el-form-item label="添加图片">
          <el-upload
            v-model:file-list="imageFileList"
            class="post-image-upload"
            list-type="picture-card"
            accept="image/*"
            :limit="9"
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            :on-remove="handleImageRemove"
            :on-preview="handleImagePreview"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <span class="upload-tip">最多上传 9 张图片，单张不超过 10MB</span>
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
import { Location, Star, ChatDotRound, View, Edit, User, Picture, Plus, Collection } from '@element-plus/icons-vue'
import { getPostList, createPost, toggleLike, toggleFavorite, getFavoriteList } from '@/api/community'
import { uploadImage } from '@/api/upload'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const loading = ref(false)
const posts = ref([])
const favoritePostIds = ref(new Set())
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
  images: [],
  tags: [],
  location: '',
})

const imageFileList = ref([])

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

const loadFavoritePosts = async () => {
  if (!userStore.isLoggedIn) {
    favoritePostIds.value = new Set()
    return
  }
  try {
    const res = await getFavoriteList(userStore.user.id, 'post', 1, 100)
    if (res.code === 0) {
      // 数据库驱动的 relatedId 可能是字符串，而帖子 id 通常是数字，统一成字符串避免状态匹配失败。
      favoritePostIds.value = new Set((res.data.list || []).map((item) => String(item.relatedId)))
    }
  } catch (error) {
    console.error('Failed to load favorite posts:', error)
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

const handleFavorite = async (post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const res = await toggleFavorite(userStore.user.id, 'post', post.id)
    if (res.code === 0) {
      const next = new Set(favoritePostIds.value)
      const postId = String(post.id)
      if (res.data?.favorited) next.add(postId)
      else next.delete(postId)
      favoritePostIds.value = next
      ElMessage.success(res.data?.favorited ? '已收藏' : '已取消收藏')
    }
  } catch (error) {
    console.error('Failed to favorite post:', error)
  }
}

// 取消发布：关闭弹窗并清空草稿（原来只关弹窗，内容会残留到下次打开）
const cancelPublish = () => {
  showPublishDialog.value = false
  publishForm.content = ''
  publishForm.images = []
  publishForm.tags = []
  publishForm.location = ''
  imageFileList.value = []
}

const handleImageUpload = async ({ file, onSuccess, onError }) => {
  try {
    const res = await uploadImage(file)
    if (res.code !== 0 || !res.data?.url) throw new Error(res.message || '图片上传失败')
    file.url = res.data.url
    publishForm.images.push(res.data.url)
    onSuccess(res.data, file)
  } catch (error) {
    onError(error)
    ElMessage.error(error.message || '图片上传失败')
  }
}

const beforeImageUpload = (file) => {
  const isImage = file.type?.startsWith('image/')
  const isWithinLimit = file.size <= 10 * 1024 * 1024
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isWithinLimit) {
    ElMessage.error('单张图片不能超过 10MB')
    return false
  }
  return true
}

const handleImageRemove = (file) => {
  const url = file.url || file.response?.url || file.response?.data?.url
  if (url) publishForm.images = publishForm.images.filter((image) => image !== url)
}

const handleImagePreview = (file) => {
  if (file.url) window.open(file.url, '_blank', 'noopener,noreferrer')
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
      images: publishForm.images,
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
  loadFavoritePosts()
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
  background: linear-gradient(135deg, #1a365d 0%, #2d5a87 50%, #1a365d 100%);
  background-image: url('https://images.pexels.com/photos/37962589/pexels-photo-37962589.jpeg?auto=compress&cs=tinysrgb&w=800'),
                    linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(45, 90, 135, 0.85) 50%, rgba(26, 54, 93, 0.9) 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(26, 54, 93, 0.7) 0%, rgba(45, 90, 135, 0.6) 100%);
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
    padding: 22px 24px 18px;
    box-shadow: 0 14px 38px rgba(26, 54, 93, 0.12);
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 16px;
    border: 1px solid rgba(212, 175, 55, 0.24);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0 0 auto;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-color), #ead28a 42%, transparent 82%);
    }

    .publish-card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding-top: 2px;
    }

    .publish-avatar {
      flex-shrink: 0;
      position: relative;

      :deep(.el-avatar) {
        background: linear-gradient(135deg, var(--primary-color), #2d5a87);
        border: 3px solid #f7f1df;
        box-shadow: 0 4px 12px rgba(26, 54, 93, 0.16);
      }

      .avatar-status {
        position: absolute;
        right: 1px;
        bottom: 2px;
        width: 10px;
        height: 10px;
        border: 2px solid #fff;
        border-radius: 50%;
        background: #52b788;
      }
    }

    .publish-heading {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 2px;
      min-width: 148px;

      strong {
        color: var(--primary-color);
        font-size: 15px;
        line-height: 1.3;
      }

      span {
        color: var(--text-light);
        font-size: 12px;
        line-height: 1.5;
        white-space: nowrap;
      }
    }

    .publish-input {
      flex: 1;
      min-width: 0;

      :deep(.publish-textarea .el-textarea__inner) {
        border: 1px solid #e9edf2;
        border-radius: 12px;
        background: #fbfcfd;
        padding: 13px 15px;
        font-size: 15px;
        line-height: 1.65;
        resize: none;
        min-height: 70px;
        box-shadow: inset 0 1px 2px rgba(26, 54, 93, 0.025);
        transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        cursor: pointer;

        &::placeholder {
          color: #a2aab6;
        }

        &:hover,
        &:focus {
          border-color: rgba(26, 54, 93, 0.32);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
      }

      .publish-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 2px 0;
        color: #8d96a3;
        font-size: 12px;

        > span:first-child {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .el-icon {
          color: var(--accent-color);
          font-size: 14px;
        }

        .publish-meta-note {
          color: #b0b7c1;
          white-space: nowrap;
        }
      }

      .publish-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        padding-top: 13px;
        border-top: 1px solid #edf0f3;

        .action-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;

          .el-tag {
            cursor: pointer;
            border-radius: 999px;
            padding: 0 11px;
            color: #65758a;
            background: #f8fafc;
            border-color: #e6ebf0;
            transition: all 0.25s;

            &:hover {
              background: rgba(212, 175, 55, 0.12);
              color: #9a7610;
              border-color: var(--accent-color);
            }
          }
        }

        :deep(.el-button) {
          min-width: 116px;
          height: 38px;
          border: none;
          box-shadow: 0 6px 14px rgba(26, 54, 93, 0.16);
          background: linear-gradient(135deg, var(--primary-color), #2d5a87);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 18px rgba(26, 54, 93, 0.22);
          }
        }
      }
    }
  }
}

@media (max-width: 720px) {
  .publish-section {
    .publish-card {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 20px 18px 16px;

      .publish-card-header {
        align-items: center;
      }

      .publish-heading span {
        white-space: normal;
      }

      .publish-actions {
        align-items: stretch;
        flex-direction: column;

        .action-tags {
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        :deep(.el-button) {
          width: 100%;
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
    flex-wrap: wrap;
    gap: 12px 24px;
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

      &.is-favorited {
        color: var(--accent-color);
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
  width: min(680px, calc(100vw - 32px)) !important;
  max-width: calc(100vw - 32px);
  margin: 5vh auto 0;
  overflow: hidden;
  border: 1px solid #e6eaf0;
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(15, 23, 41, 0.24);

  .el-dialog__header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    margin: 0;
    padding: 17px 22px;

    .el-dialog__title {
      color: white;
      font-size: 20px;
      font-weight: 700;
    }

    .el-dialog__headerbtn {
      top: 16px;
      right: 18px;

      .el-icon {
        color: white;
        font-size: 18px;
      }
    }
  }

  .el-dialog__body {
    max-height: 68vh;
    overflow-y: auto;
    padding: 20px 24px 8px;
  }

  .dialog-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    padding: 0 0 16px;
    border-bottom: 1px solid #edf0f3;

    .el-avatar {
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary-color), #2d5a87);
      border: 3px solid #f7f1df;
      box-shadow: 0 4px 12px rgba(26, 54, 93, 0.12);
    }

    span {
      font-weight: 600;
      color: var(--text-color);
      font-size: 15px;
    }
  }

  .publish-form {
    .el-form-item {
      margin-bottom: 16px;
    }

    .el-form-item__label {
      height: auto;
      padding: 0 0 7px;
      color: #455264;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.3;
    }

    .el-textarea__inner,
    .el-input__wrapper {
      border: 1px solid #e1e6ec;
      border-radius: 10px;
      background: #fbfcfd;
      box-shadow: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;

      &:hover {
        border-color: #cbd4df;
      }

      &:focus,
      &:focus-within {
        border-color: var(--primary-color);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.08);
      }
    }

    .el-textarea__inner {
      min-height: 126px !important;
      padding: 12px 14px;
      color: var(--text-color);
      font-size: 14px;
      line-height: 1.7;
      resize: vertical;

      &::placeholder {
        color: #a5adb8;
      }
    }

    .el-input__inner {
      color: var(--text-color);
      font-size: 14px;

      &::placeholder {
        color: #a5adb8;
      }
    }

    .post-image-upload {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-upload--picture-card,
      .el-upload-list__item {
        width: 86px;
        height: 86px;
        border-radius: 10px;
      }

      .el-upload--picture-card {
        border: 1px dashed #cfd7e2;
        background: #fbfcfd;
        color: var(--primary-color);
        transition: border-color 0.2s, background 0.2s;

        &:hover {
          border-color: var(--accent-color);
          background: rgba(212, 175, 55, 0.06);
        }
      }
    }

    .upload-tip {
      display: block;
      margin-top: 6px;
      color: #9aa3af;
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .el-dialog__footer {
    padding: 14px 24px 20px;
    border-top: 1px solid #edf0f3;
  }

  .publish-btn {
    min-width: 92px;
    border-radius: 9px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border: none;
    box-shadow: 0 6px 14px rgba(26, 54, 93, 0.16);

    &:hover {
      opacity: 0.94;
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 720px) {
  :deep(.publish-dialog) {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px);
    margin: 4vh auto 0;

    .el-dialog__body {
      max-height: 72vh;
      padding: 18px 16px 4px;
    }

    .el-dialog__footer {
      padding: 12px 16px 16px;
    }
  }
}
</style>
