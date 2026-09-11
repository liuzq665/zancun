import { Provide } from '@midwayjs/core';
import * as fs from 'fs';
import * as path from 'path';

export const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
export const VIDEO_EXT = ['.mp4', '.mov', '.m4v'];

/**
 * 文件上传（文档 ADR-2：本地硬盘，不走 OSS）。
 * 落盘到 public/uploads/{subdir}，返回可直接静态访问的相对 URL。
 */
@Provide()
export class UploadService {
  save(files: any[], allowed: string[], subdir: string) {
    const file = files && files[0];
    if (!file) return { code: 4001, message: '未接收到文件' };

    const ext = path.extname(file.filename || '').toLowerCase();
    if (!allowed.includes(ext)) {
      return { code: 4001, message: `文件类型不合法，仅支持 ${allowed.join('/')}` };
    }

    const dir = path.join(process.cwd(), 'public', 'uploads', subdir);
    fs.mkdirSync(dir, { recursive: true });

    const name = `${Date.now()}${Math.random().toString(36).slice(2, 8)}${ext}`;
    fs.writeFileSync(path.join(dir, name), file.data);

    return { code: 0, data: { url: `/uploads/${subdir}/${name}` } };
  }
}
