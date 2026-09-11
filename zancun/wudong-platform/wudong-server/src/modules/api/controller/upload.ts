import { Controller, Files, Post } from '@midwayjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { ApiController } from '../api.controller';
import { fail, ok } from '../helper';

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXT = ['.mp4', '.mov', '.m4v'];

/**
 * 文件上传（文档 ADR-2：本地硬盘，不走 OSS）。
 * 小程序用 multipart，字段名固定 `file`。
 */
@Controller('/api/upload')
export class ApiUploadController extends ApiController {
  private save(files: any[], allowed: string[], subdir: string) {
    const file = files && files[0];
    if (!file) return fail(4001, '未接收到文件');

    const ext = path.extname(file.filename || '').toLowerCase();
    if (!allowed.includes(ext)) {
      return fail(4001, `文件类型不合法，仅支持 ${allowed.join('/')}`);
    }

    const dir = path.join(process.cwd(), 'public', 'uploads', subdir);
    fs.mkdirSync(dir, { recursive: true });

    const name = `${Date.now()}${Math.random().toString(36).slice(2, 8)}${ext}`;
    // @midwayjs/upload 在 file 模式下提供 data 缓冲
    fs.writeFileSync(path.join(dir, name), file.data);

    return ok({ url: `/uploads/${subdir}/${name}` });
  }

  @Post('/image')
  async image(@Files() files: any[]) {
    const uid = this.uid();
    if (!uid) return this.unauth();
    return this.save(files, IMAGE_EXT, 'image');
  }

  @Post('/video')
  async video(@Files() files: any[]) {
    const uid = this.uid();
    if (!uid) return this.unauth();
    return this.save(files, VIDEO_EXT, 'video');
  }
}
