import { Controller, Get } from '@midwayjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { ApiController } from '../api.controller';
import { ok } from '../helper';

/**
 * 首页轮播。后端没有 banner 表（admin_banner 未落地），
 * 改为读取 public/banners 下实际存在的图片，保证首页有真实可用的图。
 */
@Controller('/api/admin')
export class ApiBannerController extends ApiController {
  @Get('/banner')
  async banner() {
    const dir = path.join(process.cwd(), 'public', 'banners');
    let files: string[] = [];
    try {
      files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|svg|webp|gif)$/i.test(f));
    } catch {
      return ok([]);
    }

    const list = files.map((f, i) => ({
      id: i + 1,
      title: path.parse(f).name,
      imageUrl: `/banners/${f}`,
    }));
    return ok(list);
  }
}
