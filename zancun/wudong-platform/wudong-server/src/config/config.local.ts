import { MidwayConfig } from '@midwayjs/core';

export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3307,
        username: 'root',
        password: '123456',
        database: 'wudong_platform',
        synchronize: true,
        logging: true,
        charset: 'utf8mb4',
      },
    },
  },
} as MidwayConfig;
