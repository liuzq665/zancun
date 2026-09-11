import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppAdminEntity } from '../modules/admin/entity/admin';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppAdminEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 清理旧数据
  await dataSource.getRepository(AppAdminEntity).delete({});
  console.log('旧数据已清理');

  // 创建默认管理员
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admins = [
    { username: 'admin', password: hashedPassword, nickname: '超级管理员', role: 'admin', phone: '13800138000' },
    { username: 'manager', password: hashedPassword, nickname: '运营管理员', role: 'manager', phone: '13800138001' },
  ];

  const adminRepo = dataSource.getRepository(AppAdminEntity);

  for (const admin of admins) {
    const entity = adminRepo.create(admin);
    await adminRepo.save(entity);
    console.log(`管理员已创建: ${admin.username} (密码: admin123)`);
  }

  console.log('\n管理员种子数据初始化完成！');
  console.log('- admin / admin123 (超级管理员)');
  console.log('- manager / admin123 (运营管理员)');

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
