import { DataSource } from 'typeorm';
import { AppScenicEntity, AppRouteEntity } from '../modules/ticket/entity/ticket';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppScenicEntity, AppRouteEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 只清理票务相关数据
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE app_route');
  await dataSource.query('TRUNCATE TABLE app_scenic');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('旧数据已清理');

  // 创建景区 - 使用真实贵州山水和民族村寨图片
  const scenics = [
    {
      name: '乌东梯田',
      description: '层层叠叠的苗族梯田，四季变换不同美景，被誉为"挂在山间的天梯"，是摄影爱好者的天堂',
      coverImage: 'https://images.pexels.com/photos/7206100/pexels-photo-7206100.png?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/7206100/pexels-photo-7206100.png?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/36810327/pexels-photo-36810327.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村',
      longitude: 108.6835,
      latitude: 26.4885,
      phone: '0855-8234001',
      openTime: '全天开放',
      suggestedDuration: '2-4小时',
      scenicType: '自然风光',
      tags: JSON.stringify(['梯田', '摄影', '日出']),
      ticketPrice: 0,
      isRecommend: 1,
    },
    {
      name: '苗族博物馆',
      description: '展示苗族历史文化、服饰银饰、农耕文明的专题博物馆，了解苗族文化的窗口',
      coverImage: 'https://images.pexels.com/photos/30311888/pexels-photo-30311888.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/30311888/pexels-photo-30311888.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/20610602/pexels-photo-20610602.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村一组',
      longitude: 108.6845,
      latitude: 26.4875,
      phone: '0855-8234002',
      openTime: '08:30-17:30',
      suggestedDuration: '1-2小时',
      scenicType: '民族文化',
      tags: JSON.stringify(['苗族文化', '博物馆', '非遗']),
      ticketPrice: 0,
      isRecommend: 1,
    },
    {
      name: '乌东古寨',
      description: '百年历史的苗族古寨，保存完好的吊脚楼建筑群，是活着的苗族历史博物馆',
      coverImage: 'https://images.pexels.com/photos/36267610/pexels-photo-36267610.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/36267610/pexels-photo-36267610.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/10221253/pexels-photo-10221253.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村古寨区',
      longitude: 108.6855,
      latitude: 26.4895,
      phone: '0855-8234003',
      openTime: '全天开放',
      suggestedDuration: '2-3小时',
      scenicType: '历史遗迹',
      tags: JSON.stringify(['古建筑', '吊脚楼', '民俗']),
      ticketPrice: 0,
      isRecommend: 1,
    },
    {
      name: '侗族鼓楼',
      description: '侗族标志性建筑，节日集会的重要场所，展现侗族人民的建筑智慧',
      coverImage: 'https://images.pexels.com/photos/12357815/pexels-photo-12357815.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/12357815/pexels-photo-12357815.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/37705849/pexels-photo-37705849.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村二组',
      longitude: 108.6865,
      latitude: 26.4905,
      phone: '0855-8234004',
      openTime: '全天开放',
      suggestedDuration: '1小时',
      scenicType: '民族文化',
      tags: JSON.stringify(['侗族文化', '鼓楼', '非遗']),
      ticketPrice: 0,
      isRecommend: 0,
    },
    {
      name: '苗族歌舞表演',
      description: '每晚举行的苗族歌舞表演，体验苗族人民的热情，感受原生态民族艺术魅力',
      coverImage: 'https://images.pexels.com/photos/13460125/pexels-photo-13460125.jpeg?auto=compress&cs=tinysrgb&w=800',
      images: JSON.stringify([
        'https://images.pexels.com/photos/13460125/pexels-photo-13460125.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3996466/pexels-photo-3996466.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      address: '乌东村民族文化广场',
      longitude: 108.6848,
      latitude: 26.4888,
      phone: '0855-8234005',
      openTime: '19:30-21:00',
      suggestedDuration: '1.5小时',
      scenicType: '民族文化',
      tags: JSON.stringify(['歌舞表演', '篝火晚会', '互动体验']),
      ticketPrice: 5000,
      isRecommend: 1,
    },
  ];

  const scenicRepo = dataSource.getRepository(AppScenicEntity);
  const savedScenics: AppScenicEntity[] = [];

  for (const scenic of scenics) {
    const entity = scenicRepo.create(scenic);
    const saved = await scenicRepo.save(entity);
    savedScenics.push(saved);
    console.log(`景区已创建: ${saved.name}`);
  }

  // 创建路线 - 使用真实贵州山水和民族风情图片
  const routes = [
    {
      name: '乌东梯田日出游',
      description: '清晨登山观赏梯田日出，体验云海翻涌的壮观景象，留下最美的旅行记忆',
      coverImage: 'https://images.pexels.com/photos/14036107/pexels-photo-14036107.jpeg?auto=compress&cs=tinysrgb&w=800',
      routeType: '半日游',
      price: 19800,
      scenicId: savedScenics[0].id,
      spots: JSON.stringify(['观景台', '摄影点', '苗寨']),

      itinerary: JSON.stringify([
        { time: '05:30', activity: '酒店出发，前往观景台' },
        { time: '06:00', activity: '抵达观景台，等待日出' },
        { time: '06:30-07:30', activity: '观赏梯田日出云海，摄影' },
        { time: '08:00', activity: '下山，途经苗寨' },
        { time: '09:00', activity: '返回乌东村或用早餐' },
      ]),
      includes: JSON.stringify(['导游', '早餐', '摄影指导']),
      tips: '建议穿运动鞋，带外套，早晨较凉',
      meetingPoint: '乌东村文化广场',
      meetingTime: '05:30',
      minPeople: 5,
      maxPeople: 15,
      isRecommend: 1,
    },
    {
      name: '苗族文化深度体验一日游',
      description: '深入了解苗族文化，参观博物馆，体验蜡染、刺绣等非遗项目',
      coverImage: 'https://images.pexels.com/photos/8776825/pexels-photo-8776825.jpeg?auto=compress&cs=tinysrgb&w=800',
      routeType: '一日游',
      price: 39800,
      scenicId: savedScenics[1].id,
      spots: JSON.stringify(['苗族博物馆', '蜡染体验坊', '银饰工坊', '苗家午餐']),

      itinerary: JSON.stringify([
        { time: '09:00', activity: '乌东村集合，参观苗族博物馆' },
        { time: '10:30', activity: '前往蜡染体验坊，学习蜡染技艺' },
        { time: '12:00', activity: '苗家特色午餐' },
        { time: '13:30', activity: '参观银饰工坊，了解银饰制作' },
        { time: '15:00', activity: '自由活动/购物' },
        { time: '17:00', activity: '返回' },
      ]),
      includes: JSON.stringify(['全程导游', '午餐', '蜡染体验', '银饰工坊参观']),
      tips: '可购买自制蜡染作品带走，需提前预约',
      meetingPoint: '乌东村文化广场',
      meetingTime: '09:00',
      minPeople: 8,
      maxPeople: 25,
      isRecommend: 1,
    },
    {
      name: '古寨探秘两日游',
      description: '两天时间深度游览乌东古寨，体验原生态苗寨生活，感受千年民族文化',
      coverImage: 'https://images.pexels.com/photos/15255679/pexels-photo-15255679.jpeg?auto=compress&cs=tinysrgb&w=800',
      routeType: '两日游',
      price: 79800,
      scenicId: savedScenics[2].id,
      spots: JSON.stringify(['古寨游览', '吊脚楼', '农田体验', '篝火晚会']),

      itinerary: JSON.stringify([
        { day: 1, content: [
          { time: '10:00', activity: '抵达乌东村，入住民宿' },
          { time: '11:00', activity: '古寨深度游览' },
          { time: '12:30', activity: '苗家午餐' },
          { time: '14:00', activity: '农田体验/农耕活动' },
          { time: '18:00', activity: '苗家晚餐' },
          { time: '19:30', activity: '篝火晚会/歌舞表演' },
          { time: '21:30', activity: '住宿休息' },
        ]},
        { day: 2, content: [
          { time: '07:00', activity: '早餐' },
          { time: '08:00', activity: '梯田日出观光' },
          { time: '10:00', activity: '自由活动/购物' },
          { time: '12:00', activity: '告别午餐' },
          { time: '14:00', activity: '返程' },
        ]},
      ]),
      includes: JSON.stringify(['1晚住宿', '3正1早', '篝火晚会', '导游服务', '农田体验']),
      tips: '住宿为当地民宿，体验原汁原味的苗寨生活',
      meetingPoint: '从江高铁站/黎平机场',
      meetingTime: '10:00',
      minPeople: 6,
      maxPeople: 20,
      isRecommend: 1,
    },
    {
      name: '侗苗文化双体验周末游',
      description: '周末两日，兼具体验苗族和侗族两种民族文化，收获双倍的文化体验',
      coverImage: 'https://images.pexels.com/photos/7494233/pexels-photo-7494233.jpeg?auto=compress&cs=tinysrgb&w=800',
      routeType: '两日游',
      price: 69800,
      scenicId: savedScenics[3].id,
      spots: JSON.stringify(['侗族鼓楼', '苗族博物馆', '蜡染体验', '侗族大歌']),

      itinerary: JSON.stringify([
        { day: 1, content: [
          { time: '10:00', activity: '抵达乌东村' },
          { time: '11:00', activity: '参观侗族鼓楼' },
          { time: '12:30', activity: '侗家午餐' },
          { time: '14:00', activity: '苗族博物馆深度参观' },
          { time: '16:00', activity: '蜡染体验' },
          { time: '18:30', activity: '苗家晚餐' },
          { time: '20:00', activity: '侗族大歌表演' },
        ]},
        { day: 2, content: [
          { time: '08:00', activity: '早餐' },
          { time: '09:00', activity: '梯田日出/古寨游览' },
          { time: '12:00', activity: '告别午餐' },
          { time: '14:00', activity: '返程' },
        ]},
      ]),
      includes: JSON.stringify(['1晚住宿', '3正1早', '蜡染体验', '侗族大歌']),
      tips: '周末团期固定，请提前预约',
      meetingPoint: '从江高铁站',
      meetingTime: '10:00',
      minPeople: 10,
      maxPeople: 30,
      isRecommend: 1,
    },
  ];

  const routeRepo = dataSource.getRepository(AppRouteEntity);

  for (const route of routes) {
    const entity = routeRepo.create(route);
    await routeRepo.save(entity);
    console.log(`路线已创建: ${route.name}`);
  }

  console.log('\n线路订票种子数据初始化完成！');
  console.log(`- 景区: ${savedScenics.length} 个`);
  console.log(`- 路线: ${routes.length} 条`);

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
