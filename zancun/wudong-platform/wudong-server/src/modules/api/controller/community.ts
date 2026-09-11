import { Controller, Get, Inject, Param, Post, Body, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppCommunityService } from '../../community/service/community';
import { fail, ok, pageArgs, pageResult } from '../helper';
import { toPost } from '../mappers';

@Controller('/api/community')
export class ApiCommunityController extends ApiController {
  @Inject()
  communityService: AppCommunityService;

  @Get('/feed')
  async feed(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.communityService.getPostList({ page, pageSize: size });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toPost), res.data.pagination.total, page, size));
  }

  @Get('/post/:id')
  async postDetail(@Param('id') id: string) {
    const res = await this.communityService.getPostDetail(Number(id), this.uid() || undefined);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(toPost(res.data));
  }

  @Post('/post')
  async publishPost(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.communityService.createPost({
      userId: uid,
      content: body.content,
      images: body.images,
      video: body.videoUrl,
      tags: body.topicTags,
      location: body.relatedLocation,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok({ id: res.data.id, status: 'NORMAL' });
  }

  @Post('/comment')
  async comment(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.communityService.createComment({
      postId: Number(body.postId),
      userId: uid,
      content: body.content,
      replyUserId: body.replyCommentId,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(null);
  }

  @Post('/like/:targetType/:id')
  async like(@Param('targetType') targetType: string, @Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const relatedId = Number(id);
    const res = await this.communityService.toggleLike({ userId: uid, likeType: targetType, relatedId });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    // 小程序需要回传最新点赞数
    let likeCount = 0;
    if (targetType === 'post') {
      const post = await this.communityService.getPostDetail(relatedId);
      likeCount = post.code === 0 ? (post.data as any).likeCount : 0;
    }
    return ok({ liked: res.data.liked, likeCount });
  }

  @Post('/collect/:postId')
  async collect(@Param('postId') postId: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.communityService.toggleFavorite({
      userId: uid,
      favoriteType: 'post',
      relatedId: Number(postId),
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(null);
  }

  /** 话题列表：由帖子标签聚合（后端无话题表） */
  @Get('/topic/list')
  async topicList() {
    const list = await this.communityService.getTopicList();
    return ok(list);
  }

  /**
   * 个人主页。关注关系表（community_follow）未落地，
   * 因此 followed / followCount / fansCount 暂返回默认值。
   */
  @Get('/user/:id')
  async userHome(@Param('id') id: string) {
    const userId = Number(id);

    const info = await this.userService.getUserInfo(userId);
    if (info.code !== 0) return fail(info.code, (info as any).message);

    const stats = await this.communityService.getUserStats(userId);
    const u = info.data as any;

    return ok({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
      bio: u.bio,
      postCount: stats.postCount,
      likeCount: stats.likeCount,
      followCount: 0,
      fansCount: 0,
      followed: false,
      posts: stats.posts.map((p: any) => ({
        id: p.id,
        title: undefined,
        images: p.images ? JSON.parse(p.images) : [],
        likeCount: p.likeCount,
      })),
    });
  }

  /** 关注：无关注表，暂不持久化（返回成功以保证交互不报错） */
  @Post('/follow/:userId')
  async follow(@Param('userId') userId: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();
    return ok(null);
  }

  /** 举报：无举报表，暂不持久化 */
  @Post('/report')
  async report(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();
    return ok(null);
  }
}
