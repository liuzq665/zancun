<template>
  <div class="community-manage">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><ChatDotRound /></el-icon>
          社区管理
        </h2>
        <p class="header-subtitle">管理用户动态和社区内容</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <div class="filter-left">
        <el-input
          v-model="keyword"
          placeholder="搜索帖子内容/用户名"
          clearable
          @clear="loadPosts"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="loadPosts" class="search-btn">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
      <div class="filter-right">
        <span class="total-count">共 {{ pagination.total }} 条帖子</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <el-table :data="posts" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="帖子内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="user.nickname" label="作者" width="120">
          <template #default="{ row }">
            <div class="author-cell">
              <el-avatar :size="28" class="author-avatar">{{ row.user?.nickname?.slice(0, 1) || '游' }}</el-avatar>
              <span>{{ row.user?.nickname || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞" width="80">
          <template #default="{ row }">
            <span class="count-cell"><el-icon><Star /></el-icon> {{ row.likeCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commentCount" label="评论" width="80">
          <template #default="{ row }">
            <span class="count-cell"><el-icon><ChatLineRound /></el-icon> {{ row.commentCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isFeatured" label="精华" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isFeatured" type="warning" size="small" effect="dark">精华</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              active-color="#166534"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="viewPost(row)">查看</el-button>
            <el-button size="small" type="warning" v-if="!row.isFeatured" @click="setFeatured(row)">加精</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
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
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminPostList, setPostFeatured, setPostStatus, deleteBusiness } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, Search, Star, ChatLineRound } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const posts = ref([])
const keyword = ref('')

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await getAdminPostList({ page: pagination.page, pageSize: pagination.pageSize, keyword: keyword.value })
    if (res.code === 0) {
      posts.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

const viewPost = (post) => {
  window.open(`/community/post/${post.id}`, '_blank')
}

const setFeatured = async (post) => {
  const next = post.isFeatured ? 0 : 1
  try {
    const res = await setPostFeatured(post.id, next)
    if (res.code === 0) {
      ElMessage.success(next ? '已设为精华' : '已取消精华')
      loadPosts()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to set featured:', error)
  }
}

const handleStatusChange = async (post) => {
  try {
    const res = await setPostStatus(post.id, post.status)
    if (res.code === 0) {
      ElMessage.success('状态已更新')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to update post status:', error)
  }
}

const handleDelete = async (post) => {
  try {
    await ElMessageBox.confirm('确认删除该帖子？此操作不可恢复。', '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await deleteBusiness('post', post.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadPosts()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete post:', error)
  }
}

onMounted(() => { loadPosts() })
</script>

<style scoped lang="scss">
.community-manage {
  .page-header {
    margin-bottom: 24px;

    .header-title {
      h2 {
        font-size: 22px;
        font-weight: 600;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;

        .el-icon {
          color: var(--secondary-color);
        }
      }

      .header-subtitle {
        font-size: 14px;
        color: var(--text-light);
      }
    }
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    margin-bottom: 20px;

    .filter-left {
      display: flex;
      gap: 12px;

      .search-input {
        width: 280px;
      }

      .search-btn {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border: none;
      }
    }

    .filter-right {
      .total-count {
        font-size: 14px;
        color: var(--text-light);
      }
    }
  }

  .table-card {
    padding: 0;

    .author-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .author-avatar {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }
    }

    .count-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-light);
      font-size: 13px;

      .el-icon {
        font-size: 14px;
        color: var(--secondary-color);
      }
    }

    .text-muted {
      color: var(--text-light);
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid var(--border-color);
    }
  }
}
</style>
