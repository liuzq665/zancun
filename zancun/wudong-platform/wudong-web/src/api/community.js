import request from '@/utils/request'

// 获取帖子列表
export function getPostList(params) {
  return request.get('/app/community/post/list', { params })
}

// 获取帖子详情
export function getPostDetail(id, userId) {
  return request.get('/app/community/post/detail', { params: { id, userId } })
}

// 获取精华帖子
export function getFeaturedPosts(limit = 10) {
  return request.get('/app/community/post/featured', { params: { limit } })
}

// 发布帖子
export function createPost(data) {
  return request.post('/app/community/post', data)
}

// 删除帖子
export function deletePost(id, userId) {
  return request.delete('/app/community/post', { data: { id, userId } })
}

// 获取评论列表
export function getCommentList(postId, page = 1, pageSize = 20, userId) {
  return request.get('/app/community/comment/list', { params: { postId, page, pageSize, userId } })
}

// 发布评论
export function createComment(data) {
  return request.post('/app/community/comment', data)
}

// 添加评论（别名）
export function addComment(data) {
  return request.post('/app/community/comment', data)
}

// 添加回复（后端无独立 reply 接口，回复即带 replyUserId 的评论）
export function addReply(data) {
  return request.post('/app/community/comment', {
    postId: data.postId,
    userId: data.userId,
    content: data.content,
    replyUserId: data.replyUserId,
  })
}

// 删除评论
export function deleteComment(id, userId) {
  return request.delete('/app/community/comment', { data: { id, userId } })
}

// 点赞/取消点赞
export function toggleLike(userId, likeType, relatedId) {
  return request.post('/app/community/like', { userId, likeType, relatedId })
}

// 收藏/取消收藏
export function toggleFavorite(userId, favoriteType, relatedId) {
  return request.post('/app/community/favorite', { userId, favoriteType, relatedId })
}

// 获取收藏列表
export function getFavoriteList(userId, favoriteType, page = 1, pageSize = 20) {
  return request.get('/app/community/favorite/list', { params: { userId, favoriteType, page, pageSize } })
}
