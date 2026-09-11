import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  AppRestaurantEntity,
  AppDishEntity,
  AppTableEntity,
  AppRestaurantReviewEntity,
} from '../entity/restaurant';

@Provide()
export class AppRestaurantService {
  @InjectEntityModel(AppRestaurantEntity)
  restaurantRepo: Repository<AppRestaurantEntity>;

  @InjectEntityModel(AppDishEntity)
  dishRepo: Repository<AppDishEntity>;

  @InjectEntityModel(AppTableEntity)
  tableRepo: Repository<AppTableEntity>;

  @InjectEntityModel(AppRestaurantReviewEntity)
  reviewRepo: Repository<AppRestaurantReviewEntity>;

  // ===== 餐厅管理 =====

  async getRestaurantList(params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
    isRecommend?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const where: any = { status: 1 };
    if (params.keyword) {
      where.name = Like(`%${params.keyword}%`);
    }
    if (params.isRecommend !== undefined) {
      where.isRecommend = params.isRecommend;
    }

    const [list, total] = await this.restaurantRepo.findAndCount({
      where,
      relations: ['merchant'],
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        list: list.map((item: any) => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : [],
          tags: item.tags ? JSON.parse(item.tags) : [],
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

  async getRestaurantDetail(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!restaurant) {
      return { code: 40401, message: '餐厅不存在' };
    }

    return {
      code: 0,
      data: {
        ...restaurant,
        images: restaurant.images ? JSON.parse(restaurant.images) : [],
        tags: restaurant.tags ? JSON.parse(restaurant.tags) : [],
      },
    };
  }

  async createRestaurant(data: {
    name: string;
    description?: string;
    coverImage?: string;
    images?: string[];
    avgPrice?: number;
    address?: string;
    longitude?: number;
    latitude?: number;
    phone?: string;
    businessHours?: string;
    merchantId?: number;
    environment?: string;
    specialties?: string[];
    tags?: string[];
    isRecommend?: number;
  }) {
    const restaurant = this.restaurantRepo.create({
      ...data,
      images: data.images ? JSON.stringify(data.images) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      specialties: data.specialties ? JSON.stringify(data.specialties) : null,
    });
    const result = await this.restaurantRepo.save(restaurant);
    return { code: 0, data: result };
  }

  // ===== 菜品管理 =====

  async getDishList(params: { restaurantId: number; category?: string }) {
    const where: any = { restaurantId: params.restaurantId, status: 1 };
    if (params.category) {
      where.category = params.category;
    }

    const list = await this.dishRepo.find({
      where,
      order: { id: 'ASC' },
    });

    return { code: 0, data: list };
  }

  async getDishDetail(id: number) {
    const dish = await this.dishRepo.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!dish) {
      return { code: 40401, message: '菜品不存在' };
    }

    return { code: 0, data: dish };
  }

  async createDish(data: {
    name: string;
    description?: string;
    coverImage?: string;
    price: number;
    originalPrice?: number;
    restaurantId: number;
    category?: string;
    stock?: number;
  }) {
    const dish = this.dishRepo.create(data);
    const result = await this.dishRepo.save(dish);
    return { code: 0, data: result };
  }

  // ===== 餐桌管理 =====

  async getTableList(restaurantId: number) {
    const list = await this.tableRepo.find({
      where: { restaurantId, status: 1 },
      order: { tableType: 'ASC', tableNo: 'ASC' },
    });

    return { code: 0, data: list };
  }

  async createTable(data: {
    tableNo: string;
    tableType?: string;
    capacity?: number;
    price?: number;
    restaurantId: number;
  }) {
    const table = this.tableRepo.create(data);
    const result = await this.tableRepo.save(table);
    return { code: 0, data: result };
  }

  // ===== 评价管理 =====

  async getReviewList(params: {
    restaurantId: number;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const [list, total] = await this.reviewRepo.findAndCount({
      where: { restaurantId: params.restaurantId, status: 1 },
      relations: ['user'],
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        list: list.map((item: any) => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : [],
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

  async createReview(data: {
    restaurantId: number;
    userId: number;
    rating: number;
    content?: string;
    images?: string[];
  }) {
    const review = this.reviewRepo.create({
      ...data,
      images: data.images ? JSON.stringify(data.images) : null,
    });
    const result = await this.reviewRepo.save(review);

    // 更新餐厅评分
    const reviews = await this.reviewRepo.find({
      where: { restaurantId: data.restaurantId, status: 1 },
    });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.restaurantRepo.update(data.restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
    } as any);

    return { code: 0, data: result };
  }

  async getRecommendRestaurants(limit: number = 6) {
    const list = await this.restaurantRepo.find({
      where: { status: 1, isRecommend: 1 },
      relations: ['merchant'],
      order: { id: 'DESC' },
      take: limit,
    });

    return {
      code: 0,
      data: list.map((item: any) => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
      })),
    };
  }
}
