import { Body, Inject, Post, Get, Put, Controller, Query } from '@midwayjs/core';
import { AppUserService } from '../../service/user';
import { LoginDTO, RegisterDTO } from '../../dto/user';
import { Context } from '@midwayjs/koa';
import { Validate } from '@midwayjs/validate';

/**
 * APP用户接口
 */
@Controller('/app/user')
export class AppUserController {
  @Inject()
  appUserService: AppUserService;

  @Inject()
  ctx: Context;

  /**
   * 注册
   */
  @Post('/register')
  @Validate()
  async register(@Body() body: RegisterDTO) {
    // service 已返回 {code,data}，不要再包一层
    return this.appUserService.register(body.phone, body.password, body.nickname);
  }

  /**
   * 登录
   */
  @Post('/login')
  @Validate()
  async login(@Body() body: LoginDTO) {
    const result = await this.appUserService.login(body.phone, body.password);
    return result;
  }

  /**
   * 获取当前用户信息
   */
  @Get('/info')
  async getInfo() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 10101, message: '未登录' };
    }
    // service 已返回 {code,data}，不要再包一层（否则前端拿到 {code,data:{code,data}}）
    return this.appUserService.getUserInfo(userId);
  }

  /**
   * 更新个人资料
   */
  @Put('/profile')
  async updateProfile() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 10101, message: '未登录' };
    }
    const body = this.ctx.request.body as any;
    return this.appUserService.updateProfile(userId, body);
  }

  /**
   * 修改密码
   */
  @Put('/password')
  async changePassword(@Body() body: { oldPassword: string; newPassword: string }) {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 10101, message: '未登录' };
    }
    if (!body?.oldPassword || !body?.newPassword) {
      return { code: 1003, message: '请填写原密码与新密码' };
    }
    return this.appUserService.changePassword(userId, body.oldPassword, body.newPassword);
  }

  /**
   * 我的收藏（type=product|hotel|restaurant）
   */
  @Get('/favorites')
  async getFavorites(@Query('type') type?: string) {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 10101, message: '未登录' };
    }
    const list = await this.appUserService.getFavorites(userId, type || 'product');
    return { code: 0, data: list };
  }

  /**
   * 获取用户ID（从Token）
   */
  private getLoginUserId(): number | null {
    const authHeader = this.ctx.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return null;
    try {
      const payload = this.appUserService.verifyToken(token);
      return payload?.userId || null;
    } catch {
      return null;
    }
  }
}
