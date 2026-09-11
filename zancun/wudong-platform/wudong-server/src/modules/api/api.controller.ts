import { Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AppUserService } from '../user/service/user';
import { fail, resolveUserId } from './helper';

/**
 * /api/* 门面控制器基类：统一登录态解析与 401 响应。
 */
export abstract class ApiController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: AppUserService;

  protected uid(): number | null {
    return resolveUserId(this.ctx, this.userService);
  }

  /**
   * 未登录。必须置 HTTP 401 —— 小程序 request.ts 靠状态码 401 触发重新登录，
   * 仅返回业务码不够。
   */
  protected unauth() {
    this.ctx.status = 401;
    return fail(401, '未登录');
  }
}
