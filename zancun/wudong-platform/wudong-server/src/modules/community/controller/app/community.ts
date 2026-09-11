import { Controller, Get, Post, Del, Inject, Query, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AppCommunityService } from '../../service/community';
import { AppUserService } from '../../../user/service/user';

@Controller('/app/community')
export class AppCommunityController {
  @Inject()
  communityService: AppCommunityService;

  @Inject()
  userService: AppUserService;

  @Inject()
  ctx: Context;

  /**
   * 从 token 解析登录用户。
   * 所有写操作一律以此为准，不再采信 body/query 里的 userId（防越权）。
   */
  private uid(): number | null {
    const header: any =
      (this.ctx.get && this.ctx.get('authorization')) || (this.ctx.headers as any)?.authorization || '';
    const token = String(header).replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    const payload = this.userService.verifyToken(token);
    return (payload && payload.userId) || null;
  }

  // ===== 帖子 =====
  @Get('/post/list')
  async getPostList(@Query() query: any) {
    return this.communityService.getPostList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      userId: query.userId ? Number(query.userId) : undefined,
      tag: query.tag,
      isFeatured: query.isFeatured !== undefined ? Number(query.isFeatured) : undefined,
    });
  }

  @Get('/post/detail')
  async getPostDetail(@Query('id') id: string, @Query('userId') userId?: string) {
    return this.communityService.getPostDetail(
      Number(id),
      userId ? Number(userId) : undefined
    );
  }

  @Get('/post/featured')
  async getFeaturedPosts(@Query('limit') limit?: string) {
    return this.communityService.getFeaturedPosts(limit ? Number(limit) : 10);
  }

  @Post('/post')
  async createPost(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    // 覆盖 body 里的 userId，发帖人只能是自己
    return this.communityService.createPost({ ...body, userId });
  }

  @Del('/post')
  async deletePost(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.communityService.deletePost(body.id, userId);
  }

  // ===== 评论 =====
  @Get('/comment/list')
  async getCommentList(@Query() query: any) {
    return this.communityService.getCommentList({
      postId: Number(query.postId),
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 20,
      userId: query.userId ? Number(query.userId) : undefined,
    });
  }

  @Post('/comment')
  async createComment(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.communityService.createComment({ ...body, userId });
  }

  @Del('/comment')
  async deleteComment(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.communityService.deleteComment(body.id, userId);
  }

  // ===== 点赞 =====
  @Post('/like')
  async toggleLike(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.communityService.toggleLike({
      userId,
      likeType: body.likeType,
      relatedId: body.relatedId,
    });
  }

  // ===== 收藏 =====
  @Post('/favorite')
  async toggleFavorite(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.communityService.toggleFavorite({
      userId,
      favoriteType: body.favoriteType,
      relatedId: body.relatedId,
    });
  }

  @Get('/favorite/list')
  async getFavoriteList(@Query() query: any) {
    // 收藏属于用户私有数据，按 token 取自己的，不接受 query 里的 userId
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.communityService.getFavoriteList({
      userId,
      favoriteType: query.favoriteType,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 20,
    });
  }
}
