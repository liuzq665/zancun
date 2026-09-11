import { DataSource } from 'typeorm';
import { AppHotelEntity, AppRoomEntity } from '../modules/hotel/entity/hotel';
import { AppUserEntity } from '../modules/user/entity/user';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppUserEntity, AppHotelEntity, AppRoomEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 只清理住宿相关数据
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE app_hotel_review');
  await dataSource.query('TRUNCATE TABLE app_room');
  await dataSource.query('TRUNCATE TABLE app_hotel');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('旧数据已清理');

  // 创建民宿 - 使用真实苗族吊脚楼和梯田风光图片
  const hotels = [
    {
      name: '乌东吊脚楼客栈',
      description: '依山而建的苗家吊脚楼，推窗可见层层梯田，体验原生态苗寨生活，感受千年苗族建筑智慧',
      coverImage: 'https://images.pexels.com/photos/36647675/pexels-photo-36647675.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/36647675/pexels-photo-36647675.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/38186695/pexels-photo-38186695.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村一组观景台旁',
      longitude: 108.6838,
      latitude: 26.4882,
      phone: '0855-8234561',
      hotelType: '吊脚楼',
      tags: JSON.stringify(['观景', '苗族特色', '原生态']),
      checkInTime: '14:00',
      checkOutTime: '12:00',
      minPrice: 29800,
      environment: '依山傍水，梯田环绕',
      facilities: JSON.stringify(['免费WiFi', '热水', '早餐', '停车场']),
      nearbyScenery: '观景台、梯田风光',
      isRecommend: 1,
    },
    {
      name: '侗家木楼民宿',
      description: '传统侗族木楼建筑，冬暖夏凉，感受侗族人民的热情好客，体验侗族鼓楼文化',
      coverImage: 'https://images.pexels.com/photos/17801941/pexels-photo-17801941.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/17801941/pexels-photo-17801941.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1565326/pexels-photo-1565326.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村二组侗寨鼓楼旁',
      longitude: 108.6862,
      latitude: 26.4902,
      phone: '0855-8234562',
      hotelType: '木楼',
      tags: JSON.stringify(['侗族特色', '鼓楼旁', '文化体验']),
      checkInTime: '14:00',
      checkOutTime: '12:00',
      minPrice: 19800,
      environment: '侗寨中心，鼓楼为伴',
      facilities: JSON.stringify(['免费WiFi', '热水', '侗族歌舞表演']),
      nearbyScenery: '侗族鼓楼、风雨桥',
      isRecommend: 1,
    },
    {
      name: '乌东梯田观景民宿',
      description: '位于半山腰的精品民宿，视野开阔，是观赏日出云海的绝佳位置，摄影爱好者的天堂',
      coverImage: 'https://images.pexels.com/photos/14025188/pexels-photo-14025188.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/14025188/pexels-photo-14025188.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/35428411/pexels-photo-35428411.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村三组半山',
      longitude: 108.6818,
      latitude: 26.4868,
      phone: '0855-8234563',
      hotelType: '现代与传统结合',
      tags: JSON.stringify(['观日出', '云海', '摄影胜地']),
      checkInTime: '14:00',
      checkOutTime: '12:00',
      minPrice: 39800,
      environment: '半山之巅，视野绝佳',
      facilities: JSON.stringify(['免费WiFi', '热水', '观景平台', '摄影指导']),
      nearbyScenery: '日出云海、梯田全景',
      isRecommend: 1,
    },
    {
      name: '苗家田园客栈',
      description: '稻田环绕的田园民宿，清晨闻鸡鸣而起，夜晚听蛙声入睡，体验农耕文化',
      coverImage: 'https://images.pexels.com/photos/33677662/pexels-photo-33677662.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/33677662/pexels-photo-33677662.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/39198174/pexels-photo-39198174.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村四组农田旁',
      longitude: 108.6885,
      latitude: 26.4918,
      phone: '0855-8234564',
      hotelType: '田园风格',
      tags: JSON.stringify(['田园风光', '农耕体验', '亲子游']),
      checkInTime: '14:00',
      checkOutTime: '12:00',
      minPrice: 16800,
      environment: '稻田环绕，蛙鸣阵阵',
      facilities: JSON.stringify(['免费WiFi', '热水', '农家早餐', '农耕体验']),
      nearbyScenery: '稻田、菜园、溪流',
      isRecommend: 0,
    },
  ];

  const hotelRepo = dataSource.getRepository(AppHotelEntity);
  const savedHotels: AppHotelEntity[] = [];

  for (const hotel of hotels) {
    const entity = hotelRepo.create(hotel);
    const saved = await hotelRepo.save(entity);
    savedHotels.push(saved);
    console.log(`民宿已创建: ${saved.name}`);
  }

  // 为每个民宿创建房间
  const roomRepo = dataSource.getRepository(AppRoomEntity);

  const roomsData = [
    { hotelIdx: 0, rooms: [
      { name: '观景大床房', coverImage: 'https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800', description: '推窗即见梯田', price: 39800, bedType: '大床', capacity: 2, area: 25, floor: 2, facilities: JSON.stringify(['观景窗', '独立卫浴', '空调']), stock: 3 },
      { name: '家庭套房', coverImage: 'https://images.pexels.com/photos/34645062/pexels-photo-34645062.jpeg?auto=compress&cs=tinysrgb&w=800', description: '适合家庭入住', price: 59800, bedType: '大床+小床', capacity: 4, area: 40, floor: 2, facilities: JSON.stringify(['观景窗', '独立卫浴', '客厅', '空调']), stock: 2 },
      { name: '标准双人间', coverImage: 'https://images.pexels.com/photos/29702285/pexels-photo-29702285.jpeg?auto=compress&cs=tinysrgb&w=800', description: '经济实惠之选', price: 29800, bedType: '双床', capacity: 2, area: 20, floor: 1, facilities: JSON.stringify(['独立卫浴', '空调']), stock: 5 },
    ]},
    { hotelIdx: 1, rooms: [
      { name: '鼓楼景观房', coverImage: 'https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800', description: '可观鼓楼全景', price: 32800, bedType: '大床', capacity: 2, area: 22, floor: 2, facilities: JSON.stringify(['鼓楼景观', '独立卫浴']), stock: 4 },
      { name: '侗家特色房', coverImage: 'https://images.pexels.com/photos/4577673/pexels-photo-4577673.jpeg?auto=compress&cs=tinysrgb&w=800', description: '体验侗族文化', price: 24800, bedType: '大床', capacity: 2, area: 20, floor: 1, facilities: JSON.stringify(['侗族装饰', '独立卫浴']), stock: 6 },
      { name: '三人间', coverImage: 'https://images.pexels.com/photos/29702285/pexels-photo-29702285.jpeg?auto=compress&cs=tinysrgb&w=800', description: '朋友出行首选', price: 35800, bedType: '三床', capacity: 3, area: 28, floor: 1, facilities: JSON.stringify(['独立卫浴', '阳台']), stock: 3 },
    ]},
    { hotelIdx: 2, rooms: [
      { name: '日出观景套房', coverImage: 'https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800', description: '最佳日出观赏点', price: 68800, bedType: '大床', capacity: 2, area: 35, floor: 3, facilities: JSON.stringify(['超大观景台', '望远镜', '独立卫浴', '地暖']), stock: 2 },
      { name: '云海景观房', coverImage: 'https://images.pexels.com/photos/30835932/pexels-photo-30835932.jpeg?auto=compress&cs=tinysrgb&w=800', description: '云海奇观尽收眼底', price: 49800, bedType: '大床', capacity: 2, area: 28, floor: 2, facilities: JSON.stringify(['观景窗', '咖啡机', '独立卫浴']), stock: 3 },
      { name: '摄影主题房', coverImage: 'https://images.pexels.com/photos/776120/pexels-photo-776120.jpeg?auto=compress&cs=tinysrgb&w=800', description: '专为摄影爱好者设计', price: 42800, bedType: '双床', capacity: 2, area: 25, floor: 2, facilities: JSON.stringify(['摄影器材借用', '观景窗', '独立卫浴']), stock: 2 },
    ]},
    { hotelIdx: 3, rooms: [
      { name: '田园标准间', coverImage: 'https://images.pexels.com/photos/13872620/pexels-photo-13872620.jpeg?auto=compress&cs=tinysrgb&w=800', description: '亲近自然的体验', price: 19800, bedType: '双床', capacity: 2, area: 18, floor: 1, facilities: JSON.stringify(['田园景观', '独立卫浴']), stock: 8 },
      { name: '亲子家庭房', coverImage: 'https://images.pexels.com/photos/34645062/pexels-photo-34645062.jpeg?auto=compress&cs=tinysrgb&w=800', description: '带孩子体验农耕', price: 28800, bedType: '大床+小床', capacity: 3, area: 30, floor: 1, facilities: JSON.stringify(['儿童床', '玩具', '独立卫浴']), stock: 4 },
      { name: '阳光大床房', coverImage: 'https://images.pexels.com/photos/776120/pexels-photo-776120.jpeg?auto=compress&cs=tinysrgb&w=800', description: '阳光充沛的温馨房间', price: 21800, bedType: '大床', capacity: 2, area: 20, floor: 2, facilities: JSON.stringify(['阳光充足', '独立卫浴', '阳台']), stock: 5 },
    ]},
  ];

  for (const rd of roomsData) {
    for (const room of rd.rooms) {
      const entity = roomRepo.create({ ...room, hotelId: savedHotels[rd.hotelIdx].id });
      await roomRepo.save(entity);
      console.log(`房间已创建: ${room.name}`);
    }
  }

  console.log('\n住宿种子数据初始化完成！');
  console.log(`- 民宿: ${savedHotels.length} 个`);
  console.log(`- 房间: ${roomsData.reduce((sum, r) => sum + r.rooms.length, 0)} 种`);

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
