import { get, post } from '../request';
import type { PageQuery, PageResult, Post } from '../types';

/** 信息流 */
export const feed = (query?: PageQuery & { sort?: 'latest' | 'hot' }) =>
  get<PageResult<Post>>('/api/community/feed', query, { auth: false });

/** 游记详情 */
export const postDetail = (id: number) => get<Post>(`/api/community/post/${id}`, undefined, { auth: false });

/** 发布游记 */
export const publish = (data: {
  title?: string;
  content?: string;
  images?: string[];
  videoUrl?: string;
  relatedLocation?: string;
  topicTags?: string[];
}) => post<{ id: number; status: string }>('/api/community/post', data);

/** 评论 */
export const comment = (data: { postId: number; content: string; replyCommentId?: number }) =>
  post<null>('/api/community/comment', data);

/** 点赞 */
export const like = (targetType: 'post' | 'comment', id: number) =>
  post<{ liked: boolean; likeCount: number }>(`/api/community/like/${targetType}/${id}`);

/** 关注 / 取关 */
export const follow = (userId: number) => post<null>(`/api/community/follow/${userId}`);

/** 收藏 */
export const collect = (postId: number) => post<null>(`/api/community/collect/${postId}`);

/** 举报 */
export const report = (data: { targetType: 'post' | 'comment'; targetId: number; reason?: string }) =>
  post<null>('/api/community/report', data);

/** 话题列表 */
export const topicList = () => get<any[]>('/api/community/topic/list', undefined, { auth: false });

/** 个人主页 */
export const userHome = (id: number) => get<any>(`/api/community/user/${id}`, undefined, { auth: false });
