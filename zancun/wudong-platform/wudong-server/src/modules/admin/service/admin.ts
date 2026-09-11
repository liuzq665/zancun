import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppAdminEntity, AppConfigEntity, AppLogEntity } from '../entity/admin';
import { AppUserEntity } from '../../user/entity/user';
import { AppProductEntity } from '../../product/entity/product';
import { AppRestaurantEntity, AppDishEntity, AppTableEntity, AppRestaurantReviewEntity } from '../../restaurant/entity/restaurant';
import { AppHotelEntity, AppRoomEntity, AppHotelReviewEntity } from '../../hotel/entity/hotel';
import { AppRouteEntity, AppOrderEntity } from '../../ticket/entity/ticket';
import { AppPostEntity, AppCommentEntity, AppLikeEntity, AppFavoriteEntity } from '../../community/entity/community';

// 订单状态：实体用整型存取，管理端视图用字符串（见 OrderManage.vue 的筛选项）
const ORDER_STATUS_TO_TEXT: Record<number, string> = {
  0: 'cancelled',
  1: 'pending',
  2: 'paid',
  3: 'completed',
  4: 'refunded',
};
const ORDER_TEXT_TO_STATUS: Record<string, number> = {
  cancelled: 0,
  pending: 1,
  paid: 2,
  completed: 3,
  refunded: 4,
};

@Provide()
export class AppAdminService {
  @InjectEntityModel(AppAdminEntity)
  adminRepo: Repository<AppAdminEntity>;

  @InjectEntityModel(AppConfigEntity)
  configRepo: Repository<AppConfigEntity>;

  @InjectEntityModel(AppLogEntity)
  logRepo: Repository<AppLogEntity>;

  @InjectEntityModel(AppUserEntity)
  userRepo: Repository<AppUserEntity>;

  @InjectEntityModel(AppProductEntity)
  productRepo: Repository<AppProductEntity>;

  @InjectEntityModel(AppRestaurantEntity)
  restaurantRepo: Repository<AppRestaurantEntity>;

  @InjectEntityModel(AppHotelEntity)
  hotelRepo: Repository<AppHotelEntity>;

  @InjectEntityModel(AppRouteEntity)
  routeRepo: Repository<AppRouteEntity>;

  @InjectEntityModel(AppOrderEntity)
  orderRepo: Repository<AppOrderEntity>;

  @InjectEntityModel(AppPostEntity)
  postRepo: Repository<AppPostEntity>;

  @InjectEntityModel(AppFavoriteEntity)
  favoriteRepo: Repository<AppFavoriteEntity>;

  private jwtSecret = process.env.JWT_SECRET || 'wudong-platform-admin-secret-2026';
  private jwtExpiresIn = '24h';

  // ===== 管理员登录 =====

  async login(username: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { username } as any });

    if (!admin) {
      return { code: 60101, message: '账号不存在' };
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return { code: 60102, message: '密码错误' };
    }

    if (admin.status === 0) {
      return { code: 60103, message: '账号已被禁用' };
    }

    const token = this.generateToken(admin.id, admin.role);

    return {
      code: 0,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          avatar: admin.avatar,
          role: admin.role,
        },
      },
    };
  }

  async getAdminInfo(adminId: number) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } as any });

    if (!admin) {
      return { code: 60104, message: '管理员不存在' };
    }

    return {
      code: 0,
      data: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        avatar: admin.avatar,
        role: admin.role,
        phone: admin.phone,
      },
    };
  }

  generateToken(adminId: number, role: string) {
    return jwt.sign(
      { adminId, role, type: 'admin' },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as any
    );
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret) as any;
    } catch {
      return null;
    }
  }

  // ===== 管理员CRUD =====

  async createAdmin(data: { username: string; password: string; nickname?: string; role?: string; phone?: string }) {
    const exist = await this.adminRepo.findOne({ where: { username: data.username } as any });
    if (exist) {
      return { code: 60105, message: '账号已存在' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const admin = this.adminRepo.create({
      username: data.username,
      password: hashedPassword,
      nickname: data.nickname || data.username,
      role: data.role || 'manager',
      phone: data.phone,
    });

    const result = await this.adminRepo.save(admin);
    return { code: 0, data: { id: result.id, username: result.username } };
  }

  async getAdminList(params: { page?: number; pageSize?: number; keyword?: string }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const query = this.adminRepo.createQueryBuilder('admin');

    if (params.keyword) {
      query.where('admin.username LIKE :keyword', { keyword: `%${params.keyword}%` });
    }

    query.orderBy('admin.id', 'ASC');
    query.skip((page - 1) * pageSize);
    query.take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      code: 0,
      data: {
        list: list.map((item: any) => ({
          id: item.id,
          username: item.username,
          nickname: item.nickname,
          avatar: item.avatar,
          role: item.role,
          phone: item.phone,
          status: item.status,
          createTime: item.createTime,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async updateAdmin(id: number, data: Partial<{ nickname: string; avatar: string; role: string; phone: string; status: number; password: string }>) {
    const admin = await this.adminRepo.findOne({ where: { id } as any });
    if (!admin) {
      return { code: 60104, message: '管理员不存在' };
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await this.adminRepo.update(id, updateData);
    return { code: 0, message: '更新成功' };
  }

  async deleteAdmin(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } as any });
    if (!admin) {
      return { code: 60104, message: '管理员不存在' };
    }

    await this.adminRepo.delete(id);
    return { code: 0, message: '删除成功' };
  }

  // ===== 系统配置 =====

  async getConfig(key: string) {
    const config = await this.configRepo.findOne({ where: { configKey: key } as any });
    if (!config) {
      return { code: 0, data: null };
    }

    let value = config.configValue;
    if (config.configType === 'json' && value) {
      value = JSON.parse(value);
    }

    return { code: 0, data: value };
  }

  async setConfig(key: string, value: any, name?: string, group?: string) {
    const configType = typeof value === 'object' ? 'json' : 'string';
    const configValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const exist = await this.configRepo.findOne({ where: { configKey: key } as any });

    if (exist) {
      await this.configRepo.update(exist.id, { configValue, configType } as any);
    } else {
      const config = this.configRepo.create({
        configKey: key,
        configValue,
        configName: name || key,
        group: group || 'default',
        configType,
      });
      await this.configRepo.save(config);
    }

    return { code: 0, message: '配置更新成功' };
  }

  async getConfigList(params: { group?: string }) {
    const where: any = {};
    if (params.group) {
      where.group = params.group;
    }

    const list = await this.configRepo.find({ where, order: { id: 'ASC' } });

    return {
      code: 0,
      data: list.map((item: any) => ({
        ...item,
        configValue: item.configType === 'json' && item.configValue ? JSON.parse(item.configValue) : item.configValue,
      })),
    };
  }

  // ===== 操作日志 =====

  async createLog(data: { adminId?: number; adminName?: string; action: string; content?: string; ip?: string; params?: any; result?: number }) {
    const log = this.logRepo.create({
      ...data,
      params: data.params ? JSON.stringify(data.params) : null,
    });
    await this.logRepo.save(log);
  }

  async getLogList(params: { page?: number; pageSize?: number; adminId?: number; action?: string; startDate?: string; endDate?: string }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    const query = this.logRepo.createQueryBuilder('log');

    if (params.adminId) {
      query.where('log.adminId = :adminId', { adminId: params.adminId });
    }
    if (params.action) {
      query.andWhere('log.action = :action', { action: params.action });
    }
    if (params.startDate) {
      query.andWhere('log.createTime >= :startDate', { startDate: params.startDate });
    }
    if (params.endDate) {
      query.andWhere('log.createTime <= :endDate', { endDate: params.endDate });
    }

    query.orderBy('log.id', 'DESC');
    query.skip((page - 1) * pageSize);
    query.take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      code: 0,
      data: {
        list: list.map((item: any) => ({
          ...item,
          params: item.params ? JSON.parse(item.params) : null,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  // ===== 业务数据管理（管理后台列表） =====

  /** 按用户分组统计数量，供列表附加 orderCount / favoriteCount */
  private async countByUser(repo: Repository<any>, ids: number[]): Promise<Record<number, number>> {
    if (!ids.length) return {};
    const rows = await repo
      .createQueryBuilder('t')
      .select('t.userId', 'userId')
      .addSelect('COUNT(*)', 'cnt')
      .where('t.userId IN (:...ids)', { ids })
      .groupBy('t.userId')
      .getRawMany();
    const result: Record<number, number> = {};
    rows.forEach((r: any) => (result[Number(r.userId)] = Number(r.cnt)));
    return result;
  }

  private pageParams(params: { page?: number; pageSize?: number }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    return { page, pageSize, skip: (page - 1) * pageSize };
  }

  private paginated(list: any[], page: number, pageSize: number, total: number) {
    return {
      code: 0,
      data: {
        list,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  async getUserList(params: { page?: number; pageSize?: number; keyword?: string }) {
    const { page, pageSize, skip } = this.pageParams(params);

    const qb = this.userRepo.createQueryBuilder('u');
    if (params.keyword) {
      qb.where('(u.nickname LIKE :kw OR u.phone LIKE :kw)', { kw: `%${params.keyword}%` });
    }
    qb.orderBy('u.id', 'DESC').skip(skip).take(pageSize);
    const [rows, total] = await qb.getManyAndCount();

    const ids = rows.map(u => u.id);
    const orderCounts = await this.countByUser(this.orderRepo, ids);
    const favoriteCounts = await this.countByUser(this.favoriteRepo, ids);

    return this.paginated(
      rows.map((u: any) => ({
        id: u.id,
        nickname: u.nickname,
        phone: u.phone,
        gender: u.gender,
        avatar: u.avatar,
        role: u.role,
        status: u.status,
        createTime: u.createTime,
        orderCount: orderCounts[u.id] || 0,
        favoriteCount: favoriteCounts[u.id] || 0,
      })),
      page, pageSize, total
    );
  }

  async getProductList(params: { page?: number; pageSize?: number; keyword?: string; categoryId?: number }) {
    const { page, pageSize, skip } = this.pageParams(params);

    const qb = this.productRepo.createQueryBuilder('p').leftJoinAndSelect('p.category', 'category');
    if (params.keyword) {
      qb.andWhere('p.name LIKE :kw', { kw: `%${params.keyword}%` });
    }
    if (params.categoryId) {
      qb.andWhere('p.categoryId = :cid', { cid: Number(params.categoryId) });
    }
    qb.orderBy('p.id', 'DESC').skip(skip).take(pageSize);
    const [list, total] = await qb.getManyAndCount();

    return this.paginated(list, page, pageSize, total);
  }

  private static readonly PRODUCT_FIELDS = [
    'name', 'categoryId', 'price', 'originalPrice', 'stock', 'unit',
    'coverImage', 'description', 'detail', 'heritageLevel', 'heritageDesc',
    'isRecommend', 'status',
  ];

  async saveProduct(data: any) {
    const payload: any = {};
    AppAdminService.PRODUCT_FIELDS.forEach(f => {
      if (data[f] !== undefined) payload[f] = data[f];
    });

    if (data.id) {
      const exist = await this.productRepo.findOne({ where: { id: data.id } as any });
      if (!exist) return { code: 40401, message: '商品不存在' };
      await this.productRepo.update(data.id, payload);
      return { code: 0, message: '保存成功', data: { id: data.id } };
    }

    const saved = await this.productRepo.save(this.productRepo.create(payload));
    return { code: 0, message: '保存成功', data: { id: (saved as any).id } };
  }

  async deleteProduct(id: number) {
    const exist = await this.productRepo.findOne({ where: { id } as any });
    if (!exist) return { code: 40401, message: '商品不存在' };
    // 逻辑删除：实体暂未定义 del_flag，先用 status=0 下架兜底（见文档 10.3）
    await this.productRepo.update(id, { status: 0 } as any);
    return { code: 0, message: '删除成功' };
  }

  async getRestaurantList(params: { page?: number; pageSize?: number; keyword?: string }) {
    const { page, pageSize, skip } = this.pageParams(params);
    const qb = this.restaurantRepo.createQueryBuilder('r');
    if (params.keyword) {
      qb.where('r.name LIKE :kw', { kw: `%${params.keyword}%` });
    }
    qb.orderBy('r.id', 'DESC').skip(skip).take(pageSize);
    const [list, total] = await qb.getManyAndCount();
    return this.paginated(list, page, pageSize, total);
  }

  async getHotelList(params: { page?: number; pageSize?: number; keyword?: string }) {
    const { page, pageSize, skip } = this.pageParams(params);
    const qb = this.hotelRepo.createQueryBuilder('h');
    if (params.keyword) {
      qb.where('h.name LIKE :kw', { kw: `%${params.keyword}%` });
    }
    qb.orderBy('h.id', 'DESC').skip(skip).take(pageSize);
    const [list, total] = await qb.getManyAndCount();
    return this.paginated(list, page, pageSize, total);
  }

  async getRouteList(params: { page?: number; pageSize?: number; keyword?: string }) {
    const { page, pageSize, skip } = this.pageParams(params);
    const qb = this.routeRepo.createQueryBuilder('r');
    if (params.keyword) {
      qb.where('r.name LIKE :kw', { kw: `%${params.keyword}%` });
    }
    qb.orderBy('r.id', 'DESC').skip(skip).take(pageSize);
    const [list, total] = await qb.getManyAndCount();
    return this.paginated(list, page, pageSize, total);
  }

  async getPostList(params: { page?: number; pageSize?: number; keyword?: string }) {
    const { page, pageSize, skip } = this.pageParams(params);
    // 只取作者展示字段，避免把 password 等敏感列带出去
    const qb = this.postRepo
      .createQueryBuilder('p')
      .leftJoin('p.user', 'user')
      .addSelect(['user.id', 'user.nickname', 'user.avatar']);
    if (params.keyword) {
      qb.where('p.content LIKE :kw', { kw: `%${params.keyword}%` });
    }
    qb.orderBy('p.id', 'DESC').skip(skip).take(pageSize);
    const [list, total] = await qb.getManyAndCount();
    return this.paginated(list, page, pageSize, total);
  }

  async getOrderList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    type?: string;
  }) {
    const { page, pageSize, skip } = this.pageParams(params);

    const qb = this.orderRepo.createQueryBuilder('o').leftJoinAndSelect('o.user', 'u');
    if (params.keyword) {
      qb.andWhere('(o.orderNo LIKE :kw OR u.nickname LIKE :kw)', { kw: `%${params.keyword}%` });
    }
    if (params.status && ORDER_TEXT_TO_STATUS[params.status] !== undefined) {
      qb.andWhere('o.orderStatus = :st', { st: ORDER_TEXT_TO_STATUS[params.status] });
    }
    if (params.type) {
      qb.andWhere('o.orderType = :ot', { ot: params.type });
    }
    qb.orderBy('o.id', 'DESC').skip(skip).take(pageSize);
    const [rows, total] = await qb.getManyAndCount();

    return this.paginated(
      rows.map((o: any) => ({
        id: o.id,
        orderNo: o.orderNo,
        userName: o.user?.nickname || '',
        type: o.orderType,
        totalAmount: o.totalPrice,
        status: ORDER_STATUS_TO_TEXT[o.orderStatus] || String(o.orderStatus),
        createTime: o.createTime,
      })),
      page, pageSize, total
    );
  }

  // ===== 业务数据的写操作 =====

  /** 各实体允许后台编辑的字段（白名单，避免误改主键/时间戳） */
  private static readonly EDITABLE: Record<string, string[]> = {
    hotel: ['name', 'description', 'coverImage', 'images', 'address', 'phone', 'hotelType', 'tags',
      'checkInTime', 'checkOutTime', 'minPrice', 'rating', 'environment', 'facilities', 'nearbyScenery',
      'status', 'isRecommend'],
    restaurant: ['name', 'description', 'coverImage', 'images', 'avgPrice', 'address', 'phone',
      'businessHours', 'rating', 'tags', 'environment', 'specialties', 'status', 'isRecommend'],
    route: ['name', 'description', 'coverImage', 'routeType', 'price', 'originalPrice', 'scenicId',
      'spots', 'itinerary', 'includes', 'tips', 'meetingPoint', 'meetingTime', 'minPeople', 'maxPeople',
      'status', 'isRecommend'],
  };

  private repoOf(module: string): Repository<any> | null {
    if (module === 'hotel') return this.hotelRepo;
    if (module === 'restaurant') return this.restaurantRepo;
    if (module === 'route') return this.routeRepo;
    if (module === 'post') return this.postRepo;
    return null;
  }

  async saveBusiness(module: string, data: any) {
    const repo = this.repoOf(module);
    const allowed = AppAdminService.EDITABLE[module];
    if (!repo || !allowed) return { code: 40001, message: '不支持的模块' };

    const payload: any = {};
    allowed.forEach(f => {
      if (data[f] !== undefined) payload[f] = data[f];
    });

    if (data.id) {
      const exist = await repo.findOne({ where: { id: data.id } as any });
      if (!exist) return { code: 40401, message: '记录不存在' };
      await repo.update(data.id, payload);
      return { code: 0, message: '保存成功', data: { id: data.id } };
    }

    const saved = await repo.save(repo.create(payload));
    return { code: 0, message: '保存成功', data: { id: (saved as any).id } };
  }

  /**
   * 删除。实体没有 del_flag（文档 10.3 要求的逻辑删未落地），
   * 且子表（房型/菜品/评论等）有物理外键，所以这里做「连同子数据一并物理删除」，
   * 否则会因外键约束失败、或残留孤儿数据。
   */
  async deleteBusiness(module: string, id: number) {
    const repo = this.repoOf(module);
    if (!repo) return { code: 40001, message: '不支持的模块' };

    const exist = await repo.findOne({ where: { id } as any });
    if (!exist) return { code: 40401, message: '记录不存在' };

    try {
      await repo.manager.transaction(async (m: any) => {
        if (module === 'hotel') {
          await m.delete(AppRoomEntity, { hotelId: id });
          await m.delete(AppHotelReviewEntity, { hotelId: id });
          await m.delete(AppHotelEntity, id);
        } else if (module === 'restaurant') {
          await m.delete(AppDishEntity, { restaurantId: id });
          await m.delete(AppTableEntity, { restaurantId: id });
          await m.delete(AppRestaurantReviewEntity, { restaurantId: id });
          await m.delete(AppRestaurantEntity, id);
        } else if (module === 'route') {
          // 路线无子表（app_route.scenicId 是指向景区的外键）
          await m.delete(AppRouteEntity, id);
        } else if (module === 'post') {
          await m.delete(AppCommentEntity, { postId: id });
          await m.delete(AppLikeEntity, { relatedId: id, likeType: 'post' });
          await m.delete(AppFavoriteEntity, { relatedId: id, favoriteType: 'post' });
          await m.delete(AppPostEntity, id);
        }
      });
    } catch (err: any) {
      return { code: 40002, message: `删除失败：${err?.message || '存在关联数据'}` };
    }

    return { code: 0, message: '删除成功' };
  }

  async savePostFeatured(id: number, isFeatured: number) {
    const post = await this.postRepo.findOne({ where: { id } as any });
    if (!post) return { code: 40401, message: '帖子不存在' };
    await this.postRepo.update(id, { isFeatured: isFeatured ? 1 : 0 } as any);
    return { code: 0, message: isFeatured ? '已设为精华' : '已取消精华' };
  }

  async setPostStatus(id: number, status: number) {
    const post = await this.postRepo.findOne({ where: { id } as any });
    if (!post) return { code: 40401, message: '帖子不存在' };
    await this.postRepo.update(id, { status } as any);
    return { code: 0, message: '状态已更新' };
  }

  async setUserStatus(id: number, status: number) {
    const user = await this.userRepo.findOne({ where: { id } as any });
    if (!user) return { code: 40401, message: '用户不存在' };
    await this.userRepo.update(id, { status: status ? 1 : 0 } as any);
    return { code: 0, message: status ? '已启用' : '已封禁' };
  }

  /**
   * 订单处理。实体是 0-4 的整型状态，管理端只做「确认/完成」这类推进。
   */
  async processOrder(id: number, action: string) {
    const order = await this.orderRepo.findOne({ where: { id } as any });
    if (!order) return { code: 2001, message: '订单不存在' };

    const next: Record<string, number> = { confirm: 2, complete: 3, cancel: 0, refund: 4 };
    const target = next[action];
    if (target === undefined) return { code: 40001, message: '不支持的操作' };

    await this.orderRepo.update(id, { orderStatus: target } as any);
    return { code: 0, message: '操作成功' };
  }

  // ===== 数据统计 =====

  async getDashboardStats() {
    const [totalUsers, totalProducts, totalOrders, totalPosts, totalHotels, totalRestaurants, totalRoutes] =
      await Promise.all([
        this.userRepo.count(),
        this.productRepo.count(),
        this.orderRepo.count(),
        this.postRepo.count(),
        this.hotelRepo.count(),
        this.restaurantRepo.count(),
        this.routeRepo.count(),
      ]);

    return {
      code: 0,
      data: { totalUsers, totalProducts, totalOrders, totalPosts, totalHotels, totalRestaurants, totalRoutes },
    };
  }
}
