import { DataSource } from 'typeorm';
import { AppCategoryEntity, AppProductEntity } from '../modules/product/entity/product';
import { AppUserEntity } from '../modules/user/entity/user';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppCategoryEntity, AppProductEntity, AppUserEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 只清理商品相关数据
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE app_product');
  await dataSource.query('TRUNCATE TABLE app_category');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('旧数据已清理');

  // 创建分类
  const categories = [
    { name: '银饰', icon: 'yinshi', description: '苗族银饰精美的传统手工艺品', sort: 1 },
    { name: '蜡染', icon: 'laran', description: '古老的防染工艺，布料上的艺术', sort: 2 },
    { name: '刺绣', icon: 'cixiu', description: '苗族刺绣图案精美色彩绚丽', sort: 3 },
    { name: '芦笙', icon: 'lusheng', description: '苗族传统乐器', sort: 4 },
    { name: '竹编', icon: 'zhubian', description: '竹子编织的生活用品', sort: 5 },
    { name: '服饰', icon: 'fushi', description: '苗族传统服饰和盛装', sort: 6 },
  ];

  const categoryRepo = dataSource.getRepository(AppCategoryEntity);
  const savedCategories: AppCategoryEntity[] = [];

  for (const cat of categories) {
    const entity = categoryRepo.create(cat);
    const saved = await categoryRepo.save(entity);
    savedCategories.push(saved);
    console.log(`分类已创建: ${saved.name}`);
  }

  // 创建商品
  const products = [
    {
      name: '苗族银凤冠',
      description: '纯手工打造的传统苗族银凤冠，象征吉祥如意，采用千年传承的苗族银饰锻造技艺',
      price: 128800,
      originalPrice: 158800,
      stock: 5,
      unit: '顶',
      categoryId: savedCategories[0].id,
      merchantId: null,
      heritageLevel: 3,
      heritageDesc: '省级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/14802898/pexels-photo-14802898.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/14802898/pexels-photo-14802898.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/39452381/pexels-photo-39452381.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 1,
    },
    {
      name: '手工蜡染布匹',
      description: '采用古法蓝靛蜡染技艺，天然植物染料，每一寸布料都承载着苗族古老的智慧',
      price: 3800,
      originalPrice: 4800,
      stock: 50,
      unit: '米',
      categoryId: savedCategories[1].id,
      merchantId: null,
      heritageLevel: 2,
      heritageDesc: '州级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/34583535/pexels-photo-34583535.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/34583535/pexels-photo-34583535.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/37896840/pexels-photo-37896840.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 1,
    },
    {
      name: '苗绣披肩',
      description: '精湛的苗族刺绣技艺，图案取材于苗族古歌，每一针都是对传统的致敬',
      price: 68800,
      originalPrice: 88800,
      stock: 30,
      unit: '条',
      categoryId: savedCategories[2].id,
      merchantId: null,
      heritageLevel: 2,
      heritageDesc: '州级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/29000643/pexels-photo-29000643.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 1,
    },
    {
      name: '六管芦笙',
      description: '传统苗族六管芦笙，音质浑厚悠扬，是苗族文化的重要符号',
      price: 128000,
      originalPrice: 158000,
      stock: 15,
      unit: '支',
      categoryId: savedCategories[3].id,
      merchantId: null,
      heritageLevel: 3,
      heritageDesc: '省级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/11111338/pexels-photo-11111338.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/11111338/pexels-photo-11111338.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/37686907/pexels-photo-37686907.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 0,
    },
    {
      name: '竹编手提篮',
      description: '精选楠竹手工编织，环保实用，传承千年的竹编工艺',
      price: 16800,
      originalPrice: 19800,
      stock: 80,
      unit: '个',
      categoryId: savedCategories[4].id,
      merchantId: null,
      heritageLevel: 1,
      heritageDesc: '县级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/28849646/pexels-photo-28849646.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/28849646/pexels-photo-28849646.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/26692156/pexels-photo-26692156.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 0,
    },
    {
      name: '苗族百鸟衣',
      description: '苗族盛装礼服，刺绣精美工艺精湛，被誉为穿在身上的史书',
      price: 2680000,
      originalPrice: 3280000,
      stock: 3,
      unit: '套',
      categoryId: savedCategories[5].id,
      merchantId: null,
      heritageLevel: 4,
      heritageDesc: '国家级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/20344888/pexels-photo-20344888.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/20344888/pexels-photo-20344888.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6324811/pexels-photo-6324811.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 1,
    },
    {
      name: '银饰耳环套装',
      description: '苗族传统银耳环，蝴蝶纹样寓意吉祥，精美大方',
      price: 58000,
      originalPrice: 68000,
      stock: 40,
      unit: '对',
      categoryId: savedCategories[0].id,
      merchantId: null,
      heritageLevel: 2,
      heritageDesc: '州级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/7509249/pexels-photo-7509249.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/7509249/pexels-photo-7509249.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5370642/pexels-photo-5370642.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 1,
    },
    {
      name: '蜡染桌布套装',
      description: '手工蜡染工艺，可用于家居装饰，独特的蓝白之美',
      price: 26800,
      originalPrice: 32800,
      stock: 60,
      unit: '套',
      categoryId: savedCategories[1].id,
      merchantId: null,
      heritageLevel: 1,
      heritageDesc: '县级非物质文化遗产',
      coverImage: 'https://images.pexels.com/photos/37723814/pexels-photo-37723814.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/37723814/pexels-photo-37723814.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/28855659/pexels-photo-28855659.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      isRecommend: 0,
    },
  ];

  const productRepo = dataSource.getRepository(AppProductEntity);

  for (const prod of products) {
    const entity = productRepo.create(prod);
    await productRepo.save(entity);
    console.log(`商品已创建: ${prod.name}`);
  }

  console.log('\n商品种子数据初始化完成！');
  console.log(`- 分类: ${savedCategories.length} 个`);
  console.log(`- 商品: ${products.length} 个`);

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
