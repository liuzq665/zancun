import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppUserEntity } from '../modules/user/entity/user';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppUserEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 按正确顺序清理关联数据
  console.log('清理关联数据...');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE app_comment');
  await dataSource.query('TRUNCATE TABLE app_like');
  await dataSource.query('TRUNCATE TABLE app_favorite');
  await dataSource.query('TRUNCATE TABLE app_post');
  await dataSource.query('TRUNCATE TABLE app_user');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('旧数据已清理');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 10);

  const users = [
    { phone: '13800138000', password: hashedPassword, nickname: '乌东文旅小管家', role: 'admin', avatar: 'https://images.pexels.com/photos/7400017/pexels-photo-7400017.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13800138001', password: hashedPassword, nickname: '小满爱旅行', role: 'visitor', avatar: 'https://images.pexels.com/photos/9963637/pexels-photo-9963637.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13800138002', password: hashedPassword, nickname: '苗族姑娘阿朵', role: 'visitor', avatar: 'https://images.pexels.com/photos/6605133/pexels-photo-6605133.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13900139001', password: hashedPassword, nickname: '银饰匠人老吴', role: 'merchant', avatar: 'https://images.pexels.com/photos/11482126/pexels-photo-11482126.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13900139002', password: hashedPassword, nickname: '半山民宿老杨', role: 'merchant', avatar: 'https://images.pexels.com/photos/3290499/pexels-photo-3290499.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13800138003', password: hashedPassword, nickname: '追光者阿远', role: 'visitor', avatar: 'https://images.pexels.com/photos/1191488/pexels-photo-1191488.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13800138004', password: hashedPassword, nickname: '山野食客', role: 'visitor', avatar: 'https://images.pexels.com/photos/907862/pexels-photo-907862.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { phone: '13800138005', password: hashedPassword, nickname: '背包客小舟', role: 'visitor', avatar: 'https://images.pexels.com/photos/6137038/pexels-photo-6137038.jpeg?auto=compress&cs=tinysrgb&w=800' },
  ];

  const userRepo = dataSource.getRepository(AppUserEntity);

  for (const user of users) {
    const entity = userRepo.create(user);
    await userRepo.save(entity);
    console.log(`用户已创建: ${user.nickname} (手机号: ${user.phone}, 密码: 123456)`);
  }

  console.log('\n用户种子数据初始化完成！');
  console.log('测试账号（密码均为 123456）:');
  console.log('  管理员: 13800138000');
  console.log('  游客:   13800138001 / 13800138002 / 13800138003 / 13800138004 / 13800138005');
  console.log('  商家:   13900139001 / 13900139002');

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
