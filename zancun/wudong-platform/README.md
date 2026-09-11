# 乌东文旅平台

贵州黔东南苗族侗族自治州乌东村文旅平台

## 项目简介

这是一个面向贵州省黔东南苗族侗族自治州乌东村的文旅平台系统，包含：

- **非遗商品** - 苗族银饰、蜡染、刺绣等非遗手工艺品
- **餐饮美食** - 苗家酸汤鱼、侗族特色菜等民族美食
- **住宿预订** - 吊脚楼客栈、梯田观景民宿等特色民宿
- **线路订票** - 梯田观光、文化体验等精品路线
- **社区分享** - 游客分享旅游体验的社区平台

## 技术栈

### 后端
- MidwayJS 3.x (Node.js 框架)
- TypeORM (ORM 数据库框架)
- MySQL (数据库)
- JWT (用户认证)

### 前端
- Vue 3 (渐进式 JavaScript 框架)
- Vite (构建工具)
- Element Plus (UI 组件库)
- Pinia (状态管理)

## 项目结构

```
wudong-platform/
├── wudong-server/          # 后端服务
│   ├── src/
│   │   ├── modules/       # 业务模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── product/    # 商品模块
│   │   │   ├── restaurant/ # 餐饮模块
│   │   │   ├── hotel/     # 住宿模块
│   │   │   ├── ticket/     # 票务模块
│   │   │   ├── community/  # 社区模块
│   │   │   ├── cart/      # 购物车模块
│   │   │   └── admin/      # 管理后台模块
│   │   ├── config/        # 配置文件
│   │   └── scripts/        # 脚本文件
│   ├── sql/               # SQL 脚本
│   └── package.json
├── wudong-web/            # 前端应用
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   └── stores/        # 状态管理
│   └── package.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0

### 1. 克隆项目

```bash
git clone <项目地址>
cd wudong-platform
```

### 2. 初始化数据库

MySQL 由 `cool-admin-midway` 下的 compose 提供，映射到宿主机 **3307**
（避开本机可能已被占用的 3306），后端配置也指向 3307：

```bash
cd cool-admin-midway
docker compose up -d          # 启动 MySQL(3307) 与 Redis(6379)
```

再导入数据库快照（表结构 + 演示数据，23 张表）：

```bash
docker exec -i cool-admin-midway-coolDB-1 \
  mysql -uroot -p123456 --default-character-set=utf8mb4 \
  wudong_platform < ../wudong-platform/sql/wudong_platform.sql
```

> - 该快照表结构由 TypeORM 按实体类自动生成（`synchronize: true`），
>   改实体后请重新导出，不要手工编辑。
> - 若只要结构不要数据，可改跑种子脚本
>   `wudong-server/src/scripts/seed-*.ts`（顺序：user → product →
>   restaurant → hotel → ticket → community）。

### 3. 启动后端服务

```bash
cd wudong-server
npm install
npm run dev
```

后端服务将在 http://localhost:8001 启动

### 4. 启动前端服务

```bash
cd wudong-web
npm install
npm run dev
```

前端应用将在 http://localhost:3000 启动

### 5. 初始化测试数据

```bash
cd wudong-server
npx ts-node src/scripts/seed-user.ts      # 创建测试用户
npx ts-node src/scripts/seed-product.ts    # 创建商品数据
npx ts-node src/scripts/seed-restaurant.ts # 创建餐厅数据
npx ts-node src/scripts/seed-hotel.ts      # 创建民宿数据
npx ts-node src/scripts/seed-ticket.ts    # 创建票务数据
npx ts-node src/scripts/seed-community.ts # 创建社区数据
```

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800138000 | 123456 |
| 用户1 | 13800138001 | 123456 |
| 用户2 | 13800138002 | 123456 |
| 商家1 | 13900139001 | 123456 |
| 商家2 | 13900139002 | 123456 |

## API 接口

### 用户接口
- `POST /app/user/login` - 用户登录
- `POST /app/user/register` - 用户注册
- `GET /app/user/info` - 获取用户信息

### 商品接口
- `GET /app/product/list` - 商品列表
- `GET /app/product/:id` - 商品详情

### 购物车接口
- `GET /app/cart/list` - 购物车列表
- `POST /app/cart/add` - 添加到购物车
- `PUT /app/cart/update` - 更新数量
- `POST /app/cart/remove` - 删除商品

### 餐厅接口
- `GET /app/restaurant/list` - 餐厅列表
- `GET /app/restaurant/:id` - 餐厅详情

### 民宿接口
- `GET /app/hotel/list` - 民宿列表
- `GET /app/hotel/:id` - 民宿详情

### 票务接口
- `GET /app/ticket/scenic-list` - 景区列表
- `GET /app/ticket/route-list` - 路线列表

### 社区接口
- `GET /app/community/post-list` - 帖子列表
- `POST /app/community/post` - 发布帖子
- `POST /app/community/comment` - 评论帖子

## 配置说明

### 后端配置

环境变量或 `src/config/config.local.ts`:

```typescript
export default {
  keys: 'your-secret-keys',
  koa: {
    port: 8001,  // 后端端口
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
      },
    },
  },
};
```

### 前端配置

`wudong-web/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5173,  // 前端端口
    proxy: {
      '/app': 'http://localhost:8001',   // App 端 API
      '/admin': 'http://localhost:8001', // 管理端 API
    },
  },
});
```

## 开发说明

### 目录命名规范
- 使用小写字母
- 单词之间用 `-` 分隔
- 示例：`product`, `cart`, `community`

### 模块结构
每个业务模块包含：
```
modules/
└── [module-name]/
    ├── controller/
    │   ├── app/        # App 端控制器
    │   └── admin/       # 管理端控制器
    ├── entity/          # 数据实体
    └── service/         # 业务逻辑
```

## 许可证

MIT License
