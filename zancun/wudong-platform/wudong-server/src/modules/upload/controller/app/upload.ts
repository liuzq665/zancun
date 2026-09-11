import { Controller, Files, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AppUserService } from '../../../user/service/user';
import { UploadService, IMAGE_EXT, VIDEO_EXT } from '../../service/upload';

/**
 * PC 端（/app 前缀）的上传接口。与 /api/upload/* 共用同一个 UploadService，
 * 只是路由前缀不同，避免前端出现两套约定。
 */
@Controller('/app/upload')
export class AppUploadController {
  @Inject()
  uploadService: UploadService;

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

  @Post('/image')
  async image(@Files() files: any[]) {
    if (!this.uid()) {
      this.ctx.status = 401;
      return { code: 401, message: '请先登录' };
    }
    return this.uploadService.save(files, IMAGE_EXT, 'image');
  }

  @Post('/video')
  async video(@Files() files: any[]) {
    if (!this.uid()) {
      this.ctx.status = 401;
      return { code: 401, message: '请先登录' };
    }
    return this.uploadService.save(files, VIDEO_EXT, 'video');
  }
}
