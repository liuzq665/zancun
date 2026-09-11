import { DataSource } from 'typeorm';
import { AppRestaurantEntity, AppDishEntity, AppTableEntity } from '../modules/restaurant/entity/restaurant';
import { AppUserEntity } from '../modules/user/entity/user';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppUserEntity, AppRestaurantEntity, AppDishEntity, AppTableEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 只清理餐饮相关数据
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE app_restaurant_review');
  await dataSource.query('TRUNCATE TABLE app_table');
  await dataSource.query('TRUNCATE TABLE app_dish');
  await dataSource.query('TRUNCATE TABLE app_restaurant');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('旧数据已清理');

  // 创建餐厅 - 使用真实中国特色美食图片
  const restaurants = [
    {
      name: '苗家酸汤鱼庄',
      description: '正宗苗家酸汤鱼，采用苗族传统酸汤工艺，鲜美开胃，是体验苗族饮食文化的绝佳去处',
      coverImage: 'https://images.pexels.com/photos/33965578/pexels-photo-33965578.png?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/33965578/pexels-photo-33965578.png?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/37047965/pexels-photo-37047965.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      avgPrice: 5800,
      address: '乌东村一组',
      longitude: 108.6832,
      latitude: 26.4876,
      phone: '0855-8234567',
      businessHours: '09:00-21:00',
      environment: '依山傍水，吊脚楼风格',
      specialties: JSON.stringify(['酸汤鱼', '苗家腊肉', '腌鱼']),
      tags: JSON.stringify(['特色美食', '苗族风味', '酸汤系列']),
      isRecommend: 1,
    },
    {
      name: '侗寨农家乐',
      description: '侗族特色农家菜，食材取自当地农户，新鲜健康，体验侗族饮食智慧',
      coverImage: 'https://images.pexels.com/photos/18414268/pexels-photo-18414268.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/18414268/pexels-photo-18414268.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6464535/pexels-photo-6464535.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      avgPrice: 4500,
      address: '乌东村二组',
      longitude: 108.6856,
      latitude: 26.4891,
      phone: '0855-8234568',
      businessHours: '10:00-20:00',
      environment: '侗族木楼，庭院宽敞',
      specialties: JSON.stringify(['侗家腌肉', '糯米糍粑', '香禾糯米饭']),
      tags: JSON.stringify(['农家菜', '侗族风味', '健康食材']),
      isRecommend: 1,
    },
    {
      name: '乌东牛瘪馆',
      description: '黔东南特色牛瘪火锅，是待客上品，体验独特的民族美食',
      coverImage: 'https://images.pexels.com/photos/19775602/pexels-photo-19775602.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/19775602/pexels-photo-19775602.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6339176/pexels-photo-6339176.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      avgPrice: 6800,
      address: '乌东村三组',
      longitude: 108.6812,
      latitude: 26.4856,
      phone: '0855-8234569',
      businessHours: '11:00-22:00',
      environment: '古朴典雅，民族特色装饰',
      specialties: JSON.stringify(['牛瘪火锅', '黄牛肉', '牛杂']),
      tags: JSON.stringify(['特色火锅', '必吃推荐', '传统美食']),
      isRecommend: 1,
    },
    {
      name: '禾花鱼农家院',
      description: '稻田禾花鱼特色餐厅，体验苗寨田园风味，新鲜食材直供',
      coverImage: 'https://images.pexels.com/photos/13326998/pexels-photo-13326998.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/13326998/pexels-photo-13326998.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/14025934/pexels-photo-14025934.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      avgPrice: 5200,
      address: '乌东村四组',
      longitude: 108.6878,
      latitude: 26.4912,
      phone: '0855-8234570',
      businessHours: '09:30-20:30',
      environment: '稻田环绕，田园风光',
      specialties: JSON.stringify(['禾花鱼', '稻田鸭', '时令野菜']),
      tags: JSON.stringify(['田园风味', '禾花鱼', '时令蔬菜']),
      isRecommend: 0,
    },
  ];

  const restaurantRepo = dataSource.getRepository(AppRestaurantEntity);
  const savedRestaurants: AppRestaurantEntity[] = [];

  for (const rest of restaurants) {
    const entity = restaurantRepo.create(rest);
    const saved = await restaurantRepo.save(entity);
    savedRestaurants.push(saved);
    console.log(`餐厅已创建: ${saved.name}`);
  }

  // 为每个餐厅创建菜品
  const dishRepo = dataSource.getRepository(AppDishEntity);

  const dishesData = [
    { restaurantIdx: 0, dishes: [
      { name: '酸汤鱼', coverImage: 'https://images.pexels.com/photos/17130431/pexels-photo-17130431.jpeg?auto=compress&cs=tinysrgb&w=800', description: '苗家招牌酸汤鱼', price: 8800, category: '招牌菜' },
      { name: '苗家腊肉', coverImage: 'https://images.pexels.com/photos/19688911/pexels-photo-19688911.jpeg?auto=compress&cs=tinysrgb&w=800', description: '传统苗族腌制腊肉', price: 4800, category: '特色菜' },
      { name: '腌鱼', coverImage: 'https://images.pexels.com/photos/20089298/pexels-photo-20089298.jpeg?auto=compress&cs=tinysrgb&w=800', description: '苗家传统腌鱼', price: 5800, category: '特色菜' },
      { name: '野菜汤', coverImage: 'https://images.pexels.com/photos/6646157/pexels-photo-6646157.jpeg?auto=compress&cs=tinysrgb&w=800', description: '新鲜山野蔬菜汤', price: 1800, category: '汤类' },
    ]},
    { restaurantIdx: 1, dishes: [
      { name: '侗家腌肉', coverImage: 'https://images.pexels.com/photos/19688911/pexels-photo-19688911.jpeg?auto=compress&cs=tinysrgb&w=800', description: '侗族特色腌肉', price: 5800, category: '招牌菜' },
      { name: '糯米糍粑', coverImage: 'https://images.pexels.com/photos/37464600/pexels-photo-37464600.jpeg?auto=compress&cs=tinysrgb&w=800', description: '手工糯米糍粑', price: 2800, category: '主食' },
      { name: '香禾糯米饭', coverImage: 'https://images.pexels.com/photos/37332347/pexels-photo-37332347.jpeg?auto=compress&cs=tinysrgb&w=800', description: '从江香禾糯米', price: 1500, category: '主食' },
      { name: '酸菜扣肉', coverImage: 'https://images.pexels.com/photos/34474143/pexels-photo-34474143.jpeg?auto=compress&cs=tinysrgb&w=800', description: '侗家酸菜扣肉', price: 6800, category: '招牌菜' },
    ]},
    { restaurantIdx: 2, dishes: [
      { name: '牛瘪火锅', coverImage: 'https://images.pexels.com/photos/17130431/pexels-photo-17130431.jpeg?auto=compress&cs=tinysrgb&w=800', description: '黔东南特色牛瘪', price: 12800, category: '招牌菜' },
      { name: '黄牛肉片', coverImage: 'https://images.pexels.com/photos/37032054/pexels-photo-37032054.jpeg?auto=compress&cs=tinysrgb&w=800', description: '新鲜黄牛肉', price: 8800, category: '涮菜' },
      { name: '牛杂拼盘', coverImage: 'https://images.pexels.com/photos/37100216/pexels-photo-37100216.jpeg?auto=compress&cs=tinysrgb&w=800', description: '牛下水拼盘', price: 5800, category: '涮菜' },
      { name: '野菜拼盘', coverImage: 'https://images.pexels.com/photos/38909062/pexels-photo-38909062.jpeg?auto=compress&cs=tinysrgb&w=800', description: '新鲜野菜', price: 2200, category: '涮菜' },
    ]},
    { restaurantIdx: 3, dishes: [
      { name: '禾花鱼', coverImage: 'https://images.pexels.com/photos/11653557/pexels-photo-11653557.jpeg?auto=compress&cs=tinysrgb&w=800', description: '稻田禾花鱼', price: 6800, category: '招牌菜' },
      { name: '稻田鸭', coverImage: 'https://images.pexels.com/photos/4083580/pexels-photo-4083580.jpeg?auto=compress&cs=tinysrgb&w=800', description: '稻田放养鸭', price: 8800, category: '招牌菜' },
      { name: '时令野菜', coverImage: 'https://images.pexels.com/photos/36676215/pexels-photo-36676215.jpeg?auto=compress&cs=tinysrgb&w=800', description: '当日新鲜野菜', price: 1200, category: '素菜' },
      { name: '糯米酒', coverImage: 'https://images.pexels.com/photos/35643789/pexels-photo-35643789.png?auto=compress&cs=tinysrgb&w=800', description: '苗家糯米酒', price: 2000, category: '酒水' },
    ]},
  ];

  for (const rd of dishesData) {
    for (const dish of rd.dishes) {
      const entity = dishRepo.create({
        ...dish,
        restaurantId: savedRestaurants[rd.restaurantIdx].id,
        stock: 50,
      });
      await dishRepo.save(entity);
      console.log(`菜品已创建: ${dish.name}`);
    }
  }

  // 为每个餐厅创建餐桌
  const tableRepo = dataSource.getRepository(AppTableEntity);

  for (const rest of savedRestaurants) {
    const tables = [
      { tableNo: 'A01', tableType: '包间', capacity: 10, price: 5000 },
      { tableNo: 'A02', tableType: '包间', capacity: 8, price: 3000 },
      { tableNo: 'B01', tableType: '大桌', capacity: 6, price: 0 },
      { tableNo: 'B02', tableType: '大桌', capacity: 6, price: 0 },
      { tableNo: 'C01', tableType: '中桌', capacity: 4, price: 0 },
      { tableNo: 'C02', tableType: '中桌', capacity: 4, price: 0 },
      { tableNo: 'C03', tableType: '中桌', capacity: 4, price: 0 },
      { tableNo: 'D01', tableType: '小桌', capacity: 2, price: 0 },
    ];

    for (const table of tables) {
      const entity = tableRepo.create({ ...table, restaurantId: rest.id });
      await tableRepo.save(entity);
    }
    console.log(`餐桌已创建: ${rest.name}`);
  }

  console.log('\n餐饮种子数据初始化完成！');
  console.log(`- 餐厅: ${savedRestaurants.length} 个`);
  console.log(`- 菜品: ${dishesData.reduce((sum, r) => sum + r.dishes.length, 0)} 个`);
  console.log(`- 餐桌: ${savedRestaurants.length * 8} 张`);

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
