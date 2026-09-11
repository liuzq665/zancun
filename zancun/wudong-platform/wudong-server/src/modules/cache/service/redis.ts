import { Provide } from '@midwayjs/core';
import Redis from 'ioredis';

/**
 * 可选 Redis 缓存客户端。
 * Redis 不可用时自动降级到数据库，避免本地开发环境因未启动 Redis 而无法启动服务。
 */
@Provide()
export class RedisCacheService {
  private client: Redis | null = null;
  private disabledUntil = 0;
  private readonly enabled = process.env.REDIS_ENABLED !== 'false';
  private readonly keyPrefix = process.env.REDIS_KEY_PREFIX || 'wudong:';

  private async getClient(): Promise<Redis | null> {
    if (!this.enabled || Date.now() < this.disabledUntil) return null;

    try {
      if (!this.client) {
        this.client = new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          retryStrategy: () => null,
        });
        // 错误由调用方统一降级处理，避免 Redis 未启动时产生未捕获异常。
        this.client.on('error', () => undefined);
      }

      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      if (this.client.status !== 'ready') throw new Error('REDIS_NOT_READY');
      return this.client;
    } catch {
      this.disabledUntil = Date.now() + 5000;
      this.client?.disconnect();
      this.client = null;
      return null;
    }
  }

  private key(key: string) {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.getClient();
    if (!client) return null;
    try {
      const value = await client.get(this.key(key));
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number) {
    const client = await this.getClient();
    if (!client) return false;
    try {
      await client.set(this.key(key), JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch {
      return false;
    }
  }

  async deleteByPrefix(prefix: string) {
    const client = await this.getClient();
    if (!client) return false;

    try {
      let cursor = '0';
      const keys: string[] = [];
      do {
        const result = await client.scan(cursor, 'MATCH', this.key(`${prefix}*`), 'COUNT', '100');
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== '0');

      if (keys.length) await client.del(...keys);
      return true;
    } catch {
      return false;
    }
  }
}
