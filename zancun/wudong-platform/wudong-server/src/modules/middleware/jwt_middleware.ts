import { MidwayConfig } from '@midwayjs/core';
import { Middleware, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import * as jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'wudong-platform-secret-2026';

@Middleware()
export class JwtPassportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const authHeader = ctx.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        ctx.status = 401;
        ctx.body = { code: 401, message: '请先登录', data: null };
        return;
      }

      try {
        const payload = jwt.verify(token, SECRET_KEY) as any;
        ctx.state.user = payload;
        await next();
      } catch (error) {
        ctx.status = 401;
        ctx.body = { code: 401, message: '登录已过期，请重新登录', data: null };
      }
    };
  }

  static match(ctx: Context) {
    const path = ctx.path;
    // 只匹配 /app/ 开头的路由
    return path.startsWith('/app/');
  }
}
