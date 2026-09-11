import { defineConfig } from '@playwright/test';

/**
 * E2E 跑在 uni-app 的 H5 构建上（无需微信开发者工具）。
 * 复用系统已安装的 Chrome，不额外下载浏览器。
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    headless: true,
    viewport: { width: 390, height: 844 },
    actionTimeout: 15_000,
  },
  webServer: {
    command: 'npm run dev:h5',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
