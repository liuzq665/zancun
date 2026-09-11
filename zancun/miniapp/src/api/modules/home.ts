import { get } from '../request';
import type { Banner } from '../types';

/** 首页轮播图 - 后端路径是 /api/admin/banner */
export const banners = () => get<Banner[]>('/api/admin/banner', undefined, { auth: false });
