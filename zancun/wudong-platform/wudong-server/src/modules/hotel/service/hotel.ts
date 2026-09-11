import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AppHotelEntity, AppRoomEntity, AppHotelReviewEntity } from '../entity/hotel';

@Provide()
export class AppHotelService {
  @InjectEntityModel(AppHotelEntity)
  hotelRepo: Repository<AppHotelEntity>;

  @InjectEntityModel(AppRoomEntity)
  roomRepo: Repository<AppRoomEntity>;

  @InjectEntityModel(AppHotelReviewEntity)
  reviewRepo: Repository<AppHotelReviewEntity>;

  // ===== 民宿管理 =====

  async getHotelList(params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
    isRecommend?: number;
    hotelType?: string;
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
    if (params.hotelType) {
      where.hotelType = params.hotelType;
    }

    const [list, total] = await this.hotelRepo.findAndCount({
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

  async getHotelDetail(id: number) {
    const hotel = await this.hotelRepo.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!hotel) {
      return { code: 40401, message: '民宿不存在' };
    }

    return {
      code: 0,
      data: {
        ...hotel,
        images: hotel.images ? JSON.parse(hotel.images) : [],
        tags: hotel.tags ? JSON.parse(hotel.tags) : [],
        facilities: hotel.facilities ? JSON.parse(hotel.facilities) : [],
      },
    };
  }

  async createHotel(data: {
    name: string;
    description?: string;
    coverImage?: string;
    images?: string[];
    address?: string;
    longitude?: number;
    latitude?: number;
    phone?: string;
    merchantId?: number;
    hotelType?: string;
    tags?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    environment?: string;
    facilities?: string[];
    nearbyScenery?: string;
    isRecommend?: number;
  }) {
    const hotel = this.hotelRepo.create({
      ...data,
      images: data.images ? JSON.stringify(data.images) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      facilities: data.facilities ? JSON.stringify(data.facilities) : null,
    });
    const result = await this.hotelRepo.save(hotel);
    return { code: 0, data: result };
  }

  // ===== 房间管理 =====

  async getRoomList(params: { hotelId: number }) {
    const list = await this.roomRepo.find({
      where: { hotelId: params.hotelId, status: 1 },
      order: { price: 'ASC' },
    });

    return {
      code: 0,
      data: list.map((item: any) => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        facilities: item.facilities ? JSON.parse(item.facilities) : [],
      })),
    };
  }

  async getRoomDetail(id: number) {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: ['hotel'],
    });

    if (!room) {
      return { code: 40401, message: '房间不存在' };
    }

    return {
      code: 0,
      data: {
        ...room,
        images: room.images ? JSON.parse(room.images) : [],
        facilities: room.facilities ? JSON.parse(room.facilities) : [],
      },
    };
  }

  async createRoom(data: {
    name: string;
    description?: string;
    coverImage?: string;
    images?: string[];
    price: number;
    originalPrice?: number;
    hotelId: number;
    capacity?: number;
    bedType?: string;
    area?: number;
    floor?: number;
    stock?: number;
    facilities?: string[];
  }) {
    const room = this.roomRepo.create({
      ...data,
      images: data.images ? JSON.stringify(data.images) : null,
      facilities: data.facilities ? JSON.stringify(data.facilities) : null,
    });
    const result = await this.roomRepo.save(room);

    // 更新民宿最低价
    const minPrice = await this.roomRepo
      .createQueryBuilder('room')
      .where('room.hotelId = :hotelId', { hotelId: data.hotelId })
      .andWhere('room.status = :status', { status: 1 })
      .select('MIN(room.price)', 'minPrice')
      .getRawOne();
    if (minPrice) {
      await this.hotelRepo.update(data.hotelId, { minPrice: minPrice.minPrice } as any);
    }

    return { code: 0, data: result };
  }

  async checkRoomAvailability(params: { roomId: number; checkIn: string; checkOut: string }) {
    // 简单检查库存
    const room = await this.roomRepo.findOne({ where: { id: params.roomId } as any });
    if (!room) {
      return { code: 40401, message: '房间不存在' };
    }

    if (room.stock <= 0) {
      return { code: 40001, message: '房间已售罄' };
    }

    return { code: 0, data: { available: true, room } };
  }

  // ===== 评价管理 =====

  async getReviewList(params: {
    hotelId: number;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const [list, total] = await this.reviewRepo.findAndCount({
      where: { hotelId: params.hotelId, status: 1 },
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
    hotelId: number;
    userId: number;
    rating: number;
    content?: string;
    images?: string[];
    checkInDate?: Date;
  }) {
    const review = this.reviewRepo.create({
      ...data,
      images: data.images ? JSON.stringify(data.images) : null,
    });
    const result = await this.reviewRepo.save(review);

    // 更新民宿评分
    const reviews = await this.reviewRepo.find({
      where: { hotelId: data.hotelId, status: 1 },
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.hotelRepo.update(data.hotelId, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
    } as any);

    return { code: 0, data: result };
  }

  async getRecommendHotels(limit: number = 6) {
    const list = await this.hotelRepo.find({
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
