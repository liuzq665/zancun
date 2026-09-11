import { Controller, Get, Post, Put, Body } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { ok, fail } from '../helper';

/** 文档 §7.2 错误码 与 现有 service 内部码 的对应 */
const AUTH_CODE_MAP: Record<number, number> = {
  10101: 1002, // 手机号已注册
  10102: 1005, // 手机号或密码错误
};

@Controller('/api/auth')
export class ApiAuthController extends ApiController {
  @Post('/sms/send')
  async sendSms(@Body() body: { phone: string }) {
    // 短信为 mock（文档 10.1）：不接真实服务商，仅回执
    // eslint-disable-next-line no-console
    console.log('[mock sms] verify code sent to', body?.phone);
    return ok(null);
  }

  @Post('/register')
  async register(@Body() body: { phone: string; code?: string; password: string }) {
    // 文档要求先校验短信验证码；当前未接入短信服务，code 仅占位不校验
    const res = await this.userService.register(body.phone, body.password);
    if (res.code !== 0) return fail(AUTH_CODE_MAP[res.code] || res.code, res.message);
    return ok({ id: res.data.user.id, username: body.phone });
  }

  @Post('/login')
  async login(@Body() body: { phone: string; password: string }) {
    const res = await this.userService.login(body.phone, body.password);
    if (res.code !== 0) return fail(AUTH_CODE_MAP[res.code] || res.code, res.message);
    const u = res.data.user;
    return ok({
      token: res.data.token,
      user: { id: u.id, username: u.phone, nickname: u.nickname, avatar: u.avatar },
    });
  }

  @Get('/profile')
  async profile() {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.userService.getUserInfo(uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const u = res.data;
    return ok({
      id: u.id,
      username: u.phone,
      nickname: u.nickname,
      avatar: u.avatar,
      gender: u.gender,
      region: u.region,
      bio: u.bio,
    });
  }

  @Put('/profile')
  async updateProfile(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.userService.updateProfile(uid, body || {});
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(null);
  }
}
