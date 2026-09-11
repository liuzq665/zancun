import { MidwayConfig } from '@midwayjs/core';
import * as path from 'path';
import { AppUserEntity } from '../modules/user/entity/user';
import { AppAddressEntity } from '../modules/user/entity/address';
import { AppProductEntity, AppCategoryEntity } from '../modules/product/entity/product';
import { AppRestaurantEntity, AppDishEntity, AppTableEntity, AppRestaurantReviewEntity } from '../modules/restaurant/entity/restaurant';
import { AppHotelEntity, AppRoomEntity, AppHotelReviewEntity } from '../modules/hotel/entity/hotel';
import { AppScenicEntity, AppRouteEntity, AppOrderEntity } from '../modules/ticket/entity/ticket';
import { AppPostEntity, AppCommentEntity, AppLikeEntity, AppFavoriteEntity } from '../modules/community/entity/community';
import { AppAdminEntity, AppConfigEntity, AppLogEntity } from '../modules/admin/entity/admin';
import { AppCartEntity } from '../modules/cart/entity/cart';
import { AppMessageEntity } from '../modules/message/entity/message';

export default {
  keys: 'wudong-platform-keys-2026-guizhou',
  koa: {
    port: 8001,
  },
  asyncContextManager: {
    enable: true,
  },
  staticFile: {
    buffer: true,
    dirs: {
      default: {
        prefix: '/',
        dir: path.join(__dirname, '..', '..', 'public'),
      },
    },
  },
  upload: {
    fileSize: '100mb',
    whitelist: null,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_DATABASE || 'wudong_platform',
        synchronize: true,
        logging: false,
        charset: 'utf8mb4',
        entities: [AppUserEntity, AppAddressEntity, AppProductEntity, AppCategoryEntity, AppRestaurantEntity, AppDishEntity, AppTableEntity, AppRestaurantReviewEntity, AppHotelEntity, AppRoomEntity, AppHotelReviewEntity, AppScenicEntity, AppRouteEntity, AppOrderEntity, AppPostEntity, AppCommentEntity, AppLikeEntity, AppFavoriteEntity, AppAdminEntity, AppConfigEntity, AppLogEntity, AppCartEntity, AppMessageEntity],
      },
    },
  },
} as MidwayConfig;
