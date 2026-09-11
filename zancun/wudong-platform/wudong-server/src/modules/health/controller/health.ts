import { Controller, Get } from '@midwayjs/core';

/**
 * Lightweight liveness endpoint for local startup checks and reverse proxies.
 */
@Controller('/')
export class HealthController {
  @Get('/')
  async health() {
    return {
      code: 0,
      message: 'ok',
      data: {
        service: 'wudong-server',
        status: 'ok',
      },
    };
  }
}
