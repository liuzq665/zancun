import { expect, test, type Page } from '@playwright/test';

/**
 * 主链路 E2E：登录 → 加购 → 下单 → 支付 → 订单状态。
 * 数据来自 src/mock（VITE_USE_MOCK=true），不依赖后端。
 */

const LOGIN = '/#/pages/login/login';
const HOME = '/#/pages/index/index';

/**
 * 同文档 hash 导航。不能用 page.goto 换 hash——那会整页重载，
 * 把 mock 的内存态（购物车等）清空。
 */
async function nav(page: Page, hash: string) {
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
}

async function login(page: Page) {
  await page.goto(LOGIN);
  const inputs = page.locator('uni-input input');
  await inputs.nth(0).fill('13800000001');
  await inputs.nth(1).fill('abc12345');
  await page.locator('uni-button').filter({ hasText: '登录' }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('wudong_token')))
    .toBeTruthy();
  // 登录页有 600ms 延迟跳转，等它走完再继续
  await page.waitForTimeout(900);
}

test('首页渲染 mock 数据', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.getByText('非遗好物')).toBeVisible();
  await expect(page.getByText('苗族银饰手镯')).toBeVisible();
});

test('登录成功后写入 token', async ({ page }) => {
  await login(page);
  const token = await page.evaluate(() => localStorage.getItem('wudong_token'));
  expect(token).toBeTruthy();
});

test('主链路：加购 → 下单 → 支付 → 订单变为已支付', async ({ page }) => {
  await login(page);

  // 商品详情 → 加入购物车
  await nav(page, '#/pages/goods/detail?id=1');
  await expect(page.getByText('选择规格')).toBeVisible();
  await page.locator('.footer__cart').click();

  // 购物车应有该商品
  await nav(page, '#/pages/cart/cart');
  await expect(page.getByText('苗族银饰手镯')).toBeVisible();

  // 去结算 → 订单确认
  await page.locator('.footer__btn').click();
  await expect(page.getByText('提交订单')).toBeVisible();

  // 提交订单 → 弹窗立即支付
  await page.locator('.footer__btn').click();
  await page.locator('.uni-modal__btn_primary').click();

  // 订单列表首条应为已支付
  await nav(page, '#/pages/order/list');
  await expect(page.locator('.order__status').first()).toHaveText('已支付');
});
