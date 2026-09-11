import { Controller, Get, Inject, Put, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { MessageService } from '../../service/message';
import { AppUserService } from '../../../user/service/user';

/**
 * PC 端（/app 前缀）的站内消息接口。
 * 与 /api/message/* 共用 MessageService，只是路由前缀不同。
 *
 * 注意：/app/* 未登录返回 HTTP 200 + body code:401（PC 的 request.js 靠 code 判断）。
 */
@Controller('/app/message')
export class AppMessageController {
  @Inject()
  messageService: MessageService;

  @Inject()
  userService: AppUserService;

  @Inject()
  ctx: Context;

  private uid(): number | null {
    const header: any =
      (this.ctx.get && this.ctx.get('authorization')) || (this.ctx.headers as any)?.authorization || '';
    const token = String(header).replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    const payload = this.userService.verifyToken(token);
    return (payload && payload.userId) || null;
  }

  @Get('/list')
  async list(@Query() query: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };

    const page = query.page ? Number(query.page) : 1;
    const pageSize = query.pageSize ? Number(query.pageSize) : 10;
    const [res, unread] = await Promise.all([
      this.messageService.list(userId, page, pageSize),
      this.messageService.unreadCount(userId),
    ]);

    return {
      code: 0,
      data: {
        list: res.list,
        unread,
        pagination: {
          page,
          pageSize,
          total: res.total,
          totalPages: Math.ceil(res.total / pageSize),
        },
      },
    };
  }

  /** 未读数（供铃铛角标单独刷新） */
  @Get('/unread')
  async unread() {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return { code: 0, data: { unread: await this.messageService.unreadCount(userId) } };
  }

  @Put('/read')
  async read(@Query('id') id: string) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    if (!id) return { code: 400, message: '缺少消息 id' };
    await this.messageService.read(Number(id), userId);
    return { code: 0, message: '已读' };
  }

  @Put('/readAll')
  async readAll() {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    await this.messageService.readAll(userId);
    return { code: 0, message: '全部已读' };
  }
}
