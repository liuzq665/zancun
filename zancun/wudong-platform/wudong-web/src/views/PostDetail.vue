<template>
  <div class="post-detail-page">
    <!-- 背景装饰 -->
    <div class="detail-hero">
      <div class="hero-pattern"></div>
    </div>

    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/community' }">社区分享</el-breadcrumb-item>
          <el-breadcrumb-item>帖子详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="post-content" v-loading="loading">
        <!-- 帖子主体 -->
        <div class="post-main card">
          <div class="post-header">
            <div class="user-info">
              <el-avatar :size="56" :src="post.user?.avatar" class="user-avatar">{{ post.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
              <div class="user-detail">
                <span class="username">{{ post.user?.nickname || '匿名游客' }}</span>
                <span class="time">{{ formatTime(post.createTime) }}</span>
              </div>
            </div>
            <el-tag v-if="post.isFeatured" type="warning" effect="dark" size="large" class="featured-tag">
              <el-icon><Star /></el-icon>
              精华
            </el-tag>
          </div>

          <div class="post-body">
            <div class="post-tags" v-if="post.tags && post.tags.length">
              <el-tag v-for="tag in post.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            </div>

            <div class="post-text">
              <p v-for="(line, idx) in (post.content || '').split('\n')" :key="idx">{{ line }}</p>
            </div>

            <div class="post-images" v-if="post.images && post.images.length">
              <el-image
                v-for="(img, idx) in post.images"
                :key="idx"
                :src="img"
                :preview-src-list="post.images"
                :initial-index="idx"
                preview-teleported
                fit="cover"
                class="post-image"
                :class="{ 'single': post.images.length === 1 }"
              />
            </div>

            <div class="post-location" v-if="post.location">
              <el-icon><Location /></el-icon>
              {{ post.location }}
            </div>
          </div>

          <div class="post-actions">
            <div class="action-item" :class="{ active: post.isLiked }" @click="handleLike">
              <el-icon><Star /></el-icon>
              <span>{{ post.likeCount || 0 }} 点赞</span>
            </div>
            <div class="action-item" @click="handleShare">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </div>
            <div class="action-item" :class="{ active: post.isFavorited }" @click="handleFavorite">
              <el-icon><Collection /></el-icon>
              <span>{{ post.isFavorited ? '已收藏' : '收藏' }}</span>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section card">
          <h3 class="section-title">
            <el-icon><ChatDotRound /></el-icon>
            评论 ({{ comments.length }})
          </h3>

          <!-- 发布评论 -->
          <div class="comment-form" v-if="userStore.isLoggedIn">
            <el-avatar :size="44" :src="userStore.user?.avatar" class="user-avatar">{{ userStore.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
            <div class="form-input">
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="3"
                placeholder="发表你的看法..."
              />
              <el-button type="primary" @click="handleComment" :loading="submitting" class="submit-btn">
                发表评论
              </el-button>
            </div>
          </div>
          <div class="login-tip" v-else>
            <el-icon><User /></el-icon>
            <span>登录后即可发表评论</span>
            <el-button type="primary" @click="$router.push('/login')">立即登录</el-button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :size="44" :src="comment.user?.avatar" class="user-avatar">{{ comment.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user?.nickname || '匿名用户' }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <span class="action-btn" @click="handleReplyLike(comment)">
                    <el-icon :class="{ 'is-liked': comment.isLiked }"><Star /></el-icon>
                    {{ comment.likeCount || 0 }} 点赞
                  </span>
                  <span class="action-btn" @click="showReplyForm(comment)">
                    <el-icon><ChatLineSquare /></el-icon>
                    回复
                  </span>
                </div>

                <!-- 回复列表 -->
                <div class="replies-list" v-if="comment.replies && comment.replies.length">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <el-avatar :size="32" :src="reply.user?.avatar" class="user-avatar small">{{ reply.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
                    <div class="reply-body">
                      <div class="reply-header">
                        <span class="reply-author">{{ reply.user?.nickname || '匿名用户' }}</span>
                        <span class="reply-to" v-if="reply.replyTo">@{{ reply.replyTo }}</span>
                        <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                      </div>
                      <div class="reply-text">{{ reply.content }}</div>
                    </div>
                  </div>
                </div>

                <!-- 回复表单 -->
                <div class="reply-form" v-if="replyingTo === comment.id">
                  <el-input
                    v-model="replyContent"
                    type="textarea"
                    :rows="2"
                    :placeholder="`回复 @${comment.user?.nickname || '匿名用户'}...`"
                  />
                  <div class="reply-actions">
                    <el-button size="small" @click="cancelReply">取消</el-button>
                    <el-button type="primary" size="small" @click="submitReply(comment)">发送</el-button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="comments.length === 0" class="empty-comments">
              <el-empty description="暂无评论，快来抢沙发！" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Location, Star, Share, ChatDotRound, Collection, User, ChatLineSquare } from '@element-plus/icons-vue'
import { getPostDetail, getCommentList, toggleLike, toggleFavorite, addComment, addReply } from '@/api/community'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const post = ref({})
const comments = ref([])
const commentContent = ref('')
const replyContent = ref('')
const replyingTo = ref(null)
const submitting = ref(false)

const loadComments = async () => {
  try {
    // 带上 userId，后端才会返回每条评论的 isLiked（否则点赞状态永远是未点赞）
    const res = await getCommentList(route.params.id, 1, 50, userStore.user?.id)
    if (res.code === 0) {
      // 后端评论是平铺列表（回复以 replyUserId 标记），这里统一映射成视图结构
      comments.value = (res.data.list || []).map((c) => ({
        id: c.id,
        content: c.content,
        createTime: c.createTime,
        likeCount: c.likeCount,
        isLiked: !!c.isLiked,
        user: c.user,
        replyUser: c.replyUser,
        replies: [],
      }))
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const loadPost = async () => {
  loading.value = true
  try {
    // 传 userId 才能拿到真实的 isLiked / isFavorited
    const res = await getPostDetail(route.params.id, userStore.user?.id)
    if (res.code === 0) {
      post.value = res.data
    }
    await loadComments()
  } catch (error) {
    console.error('Failed to load post:', error)
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    // 以服务端返回的权威值为准，避免本地累加导致数字漂移（可被"刷"）
    const res = await toggleLike(userStore.user.id, 'post', post.value.id)
    if (res.code === 0) {
      post.value.likeCount = res.data.likeCount
      post.value.isLiked = res.data.liked
    }
  } catch (error) {
    console.error('Failed to like:', error)
  }
}

const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    // 非 HTTPS / 无剪贴板权限时的兜底
    ElMessage.info(`链接：${window.location.href}`)
  }
}

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const res = await toggleFavorite(userStore.user.id, 'post', post.value.id)
    if (res.code === 0) {
      post.value.isFavorited = !!res.data?.favorited
      ElMessage.success(post.value.isFavorited ? '已收藏' : '已取消收藏')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const handleComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    const res = await addComment({
      userId: userStore.user.id,
      postId: post.value.id,
      content: commentContent.value,
    })
    if (res.code === 0) {
      ElMessage.success('评论成功')
      commentContent.value = ''
      loadPost()
    }
  } catch (error) {
    console.error('Failed to comment:', error)
  } finally {
    submitting.value = false
  }
}

const showReplyForm = (comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  // 切换回复对象时清空草稿，避免上一条的内容被带过来
  if (replyingTo.value !== comment.id) replyContent.value = ''
  replyingTo.value = comment.id
}

// 取消回复：关闭输入框并清空草稿（原来只置空 replyingTo，内容会残留）
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = async (comment) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    const res = await addReply({
      postId: post.value.id,
      userId: userStore.user.id,
      content: replyContent.value,
      replyUserId: comment.user?.id,
    })
    if (res.code === 0) {
      ElMessage.success('回复成功')
      replyContent.value = ''
      replyingTo.value = null
      loadComments()
    }
  } catch (error) {
    console.error('Failed to reply:', error)
  }
}

const handleReplyLike = async (comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const res = await toggleLike(userStore.user.id, 'comment', comment.id)
    if (res.code === 0) {
      comment.likeCount = res.data.likeCount
      comment.isLiked = res.data.liked
    }
  } catch (error) {
    console.error('Failed to like comment:', error)
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
  loadPost()
})
</script>

<style scoped lang="scss">
.post-detail-page {
  background: linear-gradient(180deg, #f8f4ef 0%, #faf8f5 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

.detail-hero {
  height: 120px;
  background: linear-gradient(135deg, #1a365d 0%, #2d5a87 50%, #1a365d 100%);
  position: relative;
  overflow: hidden;

  .hero-pattern {
    position: absolute;
    inset: 0;
    background-image: url('https://images.pexels.com/photos/15166817/pexels-photo-15166817.png?auto=compress&cs=tinysrgb&w=800');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
  }
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  padding: 20px 0;
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-main {
  padding: 32px;

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .user-avatar {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }

      .user-detail {
        display: flex;
        flex-direction: column;

        .username {
          font-weight: 600;
          font-size: 18px;
          color: var(--text-color);
        }

        .time {
          font-size: 13px;
          color: var(--text-light);
        }
      }
    }

    .featured-tag {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
    }
  }

  .post-body {
    .post-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;

      .el-tag {
        background: rgba(26, 54, 93, 0.08);
        border: none;
        color: var(--primary-color);
      }
    }

    .post-text {
      font-size: 16px;
      line-height: 2;
      margin-bottom: 28px;

      p {
        margin-bottom: 16px;
      }
    }

    .post-images {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;

      .post-image {
        width: 100%;
        height: 280px;
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.02);
        }

        &.single {
          grid-column: span 2;
          height: 400px;
        }
      }
    }

    .post-location {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-light);
      padding: 12px 16px;
      background: var(--bg-light);
      border-radius: 8px;

      .el-icon {
        color: var(--accent-color);
        font-size: 18px;
      }
    }
  }

  .post-actions {
    display: flex;
    gap: 48px;
    padding-top: 24px;
    border-top: 1px dashed var(--border-color);

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: var(--text-light);
      cursor: pointer;
      transition: all 0.3s;
      padding: 8px 16px;
      border-radius: 24px;

      .el-icon {
        font-size: 22px;
      }

      &:hover {
        color: var(--primary-color);
        background: rgba(26, 54, 93, 0.05);
      }

      &.active {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
      }
    }
  }
}

.comments-section {
  padding: 32px;

  .section-title {
    font-size: 20px;
    color: var(--primary-color);
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 10px;

    .el-icon {
      font-size: 24px;
    }
  }
}

.comment-form {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;

  .user-avatar {
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  }

  .form-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .submit-btn {
      align-self: flex-end;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
    }
  }
}

.login-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-light);
  border-radius: 12px;
  margin-bottom: 32px;

  .el-icon {
    font-size: 28px;
    color: var(--primary-color);
  }

  span {
    color: var(--text-color);
    font-size: 15px;
  }
}

.comments-list {
  .comment-item {
    display: flex;
    gap: 16px;
    padding: 24px 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .user-avatar {
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));

      &.small {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }
    }

    .comment-body {
      flex: 1;

      .comment-header {
        margin-bottom: 10px;

        .comment-author {
          font-weight: 600;
          margin-right: 12px;
          color: var(--text-color);
        }

        .comment-time {
          color: var(--text-light);
          font-size: 13px;
        }
      }

      .comment-text {
        font-size: 15px;
        line-height: 1.8;
        margin-bottom: 14px;
        color: var(--text-color);
      }

      .comment-actions {
        display: flex;
        gap: 24px;

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-light);
          cursor: pointer;
          transition: color 0.3s;

          .el-icon {
            font-size: 16px;

            &.is-liked {
              color: #f59e0b;
            }
          }

          &:hover {
            color: var(--primary-color);
          }
        }
      }

      .replies-list {
        margin-top: 20px;
        padding: 20px;
        background: var(--bg-light);
        border-radius: 12px;

        .reply-item {
          display: flex;
          gap: 12px;
          padding: 16px 0;

          &:not(:last-child) {
            border-bottom: 1px dashed var(--border-color);
          }

          .reply-body {
            flex: 1;

            .reply-header {
              margin-bottom: 6px;

              .reply-author {
                font-weight: 600;
                font-size: 14px;
                color: var(--text-color);
              }

              .reply-to {
                color: var(--secondary-color);
                font-size: 13px;
                margin: 0 8px;
              }

              .reply-time {
                color: var(--text-light);
                font-size: 12px;
              }
            }

            .reply-text {
              font-size: 14px;
              line-height: 1.6;
              color: var(--text-color);
            }
          }
        }
      }

      .reply-form {
        margin-top: 16px;
        padding: 16px;
        background: var(--bg-light);
        border-radius: 12px;

        .reply-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }
      }
    }
  }
}

.empty-comments {
  padding: 60px 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .post-main {
    padding: 20px;

    .post-body .post-images {
      grid-template-columns: 1fr;

      .post-image {
        height: 200px;

        &.single {
          grid-column: span 1;
          height: 280px;
        }
      }
    }

    .post-actions {
      gap: 16px;

      .action-item {
        padding: 6px 12px;
        font-size: 14px;
      }
    }
  }

  .comments-section {
    padding: 20px;
  }
}
</style>
