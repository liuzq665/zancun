import { MidwayConfig } from '@midwayjs/core';

export default {
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
      },
    },
  },
} as MidwayConfig;
