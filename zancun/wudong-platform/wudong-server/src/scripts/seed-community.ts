import { DataSource } from 'typeorm';
import { AppPostEntity, AppCommentEntity, AppLikeEntity } from '../modules/community/entity/community';
import { AppUserEntity } from '../modules/user/entity/user';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'wudong_platform',
  entities: [AppPostEntity, AppCommentEntity, AppLikeEntity, AppUserEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 清理旧数据（点赞要一起清，否则 likeCount 会和实际记录对不上）
  await dataSource.getRepository(AppLikeEntity).delete({});
  await dataSource.getRepository(AppCommentEntity).delete({});
  await dataSource.getRepository(AppPostEntity).delete({});
  console.log('旧数据已清理');

  const userRepo = dataSource.getRepository(AppUserEntity);
  const users = await userRepo.find();

  if (users.length === 0) {
    console.log('没有用户，跳过种子数据创建');
    await dataSource.destroy();
    return;
  }

  // 按手机号找用户，避免像以前那样所有内容都挂在 users[0]（管理员）名下
  const idOf = (phone: string) => {
    const u = users.find((x) => x.phone === phone);
    if (!u) throw new Error(`找不到用户 ${phone}，请先执行 seed-user`);
    return u.id;
  };

  // 帖子：不同作者，管理员不参与社区内容
  const posts = [
    {
      userId: idOf('13800138003'), // 追光者阿远
      content: '乌东梯田的日出真的太美了！清晨五点半登山，看到云海翻涌，太阳从山那边慢慢升起，金色的阳光洒在层层梯田上，简直像仙境一样。下次还要再来！',
      images: JSON.stringify([
        'https://images.pexels.com/photos/2161540/pexels-photo-2161540.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/34902075/pexels-photo-34902075.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      postType: 'photo',
      tags: JSON.stringify(['乌东梯田', '日出', '摄影']),
      location: '乌东村',
      viewCount: 156,
      isFeatured: 1,
    },
    {
      userId: idOf('13800138002'), // 苗族姑娘阿朵
      content: '今天在苗家体验了蜡染技艺，太有意思了！老师傅手把手教，从绘制图案到染色，每一步都很有讲究。做出了自己专属的蜡染方巾，带回家做纪念！',
      images: JSON.stringify([
        'https://images.pexels.com/photos/34161634/pexels-photo-34161634.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/37853658/pexels-photo-37853658.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      postType: 'photo',
      tags: JSON.stringify(['蜡染', '非遗体验', '苗族']),
      location: '苗家蜡染体验坊',
      viewCount: 89,
      isFeatured: 1,
    },
    {
      userId: idOf('13800138005'), // 背包客小舟
      content: '住在吊脚楼客栈的第一晚，听着窗外的蛙鸣和溪水声入睡，这种感觉太治愈了。远离城市的喧嚣，回归大自然，这就是向往的生活吧。',
      images: JSON.stringify([
        'https://images.pexels.com/photos/754186/pexels-photo-754186.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6550304/pexels-photo-6550304.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      postType: 'photo',
      tags: JSON.stringify(['吊脚楼', '民宿', '田园生活']),
      location: '乌东吊脚楼客栈',
      viewCount: 203,
      isFeatured: 1,
    },
    {
      userId: idOf('13800138004'), // 山野食客
      content: '苗家酸汤鱼，味道绝了！酸辣开胃，鱼肉鲜嫩，配上当地的野菜，一口气吃了两碗饭。强烈推荐大家来尝尝！',
      images: JSON.stringify([
        'https://images.pexels.com/photos/33471753/pexels-photo-33471753.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/36061263/pexels-photo-36061263.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      postType: 'photo',
      tags: JSON.stringify(['酸汤鱼', '苗族美食', '美食推荐']),
      location: '苗家酸汤鱼庄',
      viewCount: 78,
      isFeatured: 0,
    },
    {
      userId: idOf('13800138001'), // 小满爱旅行
      content: '篝火晚会上和当地苗族同胞一起跳舞，太欢乐了！他们都很热情好客，歌声嘹亮，舞姿优美。虽然动作笨拙，但是很开心！',
      images: JSON.stringify([
        'https://images.pexels.com/photos/34408549/pexels-photo-34408549.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4276087/pexels-photo-4276087.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      postType: 'photo',
      tags: JSON.stringify(['篝火晚会', '苗族歌舞', '文化体验']),
      location: '乌东村文化广场',
      viewCount: 245,
      isFeatured: 1,
    },
    {
      userId: idOf('13900139001'), // 银饰匠人老吴
      content: '乌东古寨真的太有历史感了！几百年的吊脚楼保存完好，斑驳的木墙诉说着岁月的故事。漫步在青石板路上，仿佛穿越到了过去。',
      images: JSON.stringify([
        'https://images.pexels.com/photos/5642978/pexels-photo-5642978.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/7146295/pexels-photo-7146295.jpeg?auto=compress&cs=tinysrgb&w=800',
      ]),
      postType: 'photo',
      tags: JSON.stringify(['古寨', '吊脚楼', '历史']),
      location: '乌东古寨',
      viewCount: 112,
      isFeatured: 0,
    },
  ];

  const postRepo = dataSource.getRepository(AppPostEntity);
  const commentRepo = dataSource.getRepository(AppCommentEntity);
  const likeRepo = dataSource.getRepository(AppLikeEntity);
  const savedPosts: AppPostEntity[] = [];
  const postUserIds: number[] = [];

  for (const post of posts) {
    const saved = await postRepo.save(postRepo.create(post));
    savedPosts.push(saved);
    postUserIds.push(post.userId);
    console.log(`帖子已创建: ${post.content.slice(0, 20)}...`);
  }

  // 评论：让不同的人来评论，且不自己评论自己的帖子（否则一眼假）
  const commentsData = [
    { postIdx: 0, comments: [
      { phone: '13800138001', content: '太美了！求攻略，下次也想去' },
      { phone: '13800138004', content: '请问几点起床合适？需要带什么装备吗？' },
      { phone: '13800138005', content: '这个角度拍得真好！' },
    ]},
    { postIdx: 1, comments: [
      { phone: '13800138003', content: '蜡染体验看起来很有趣！价格贵吗？' },
      { phone: '13800138001', content: '我也想体验！可以预约吗？' },
    ]},
    { postIdx: 4, comments: [
      { phone: '13800138002', content: '篝火晚会太好玩了！' },
      { phone: '13900139001', content: '每周都有吗？' },
      { phone: '13800138003', content: '能教教我那个舞步吗？' },
      { phone: '13800138005', content: '氛围太好了！' },
    ]},
  ];

  for (const cd of commentsData) {
    for (const comment of cd.comments) {
      await commentRepo.save(
        commentRepo.create({
          postId: savedPosts[cd.postIdx].id,
          userId: idOf(comment.phone),
          content: comment.content,
        })
      );
    }
    console.log(`评论已创建: ${savedPosts[cd.postIdx].content.slice(0, 16)}... x${cd.comments.length}`);
  }

  // 点赞：用真实用户生成记录，并据此回写 likeCount。
  // 以前 likeCount 是写死的 45/38/56…，但 app_like 里没有任何记录，
  // 导致用户第一次点赞时计数被重算成 1（数字突然跳水）。
  const likePlan = [6, 4, 5, 3, 7, 4];
  let likeTotal = 0;
  for (let i = 0; i < savedPosts.length; i++) {
    const post = savedPosts[i];
    const authorId = postUserIds[i];
    // 取非作者的用户，按计划数量点赞
    const likers = users.filter((u) => u.id !== authorId).slice(0, likePlan[i]);
    for (const liker of likers) {
      await likeRepo.save(
        likeRepo.create({ userId: liker.id, likeType: 'post', relatedId: post.id, status: 1 })
      );
    }
    await postRepo.update(post.id, {
      likeCount: likers.length,
      commentCount: await commentRepo.count({ where: { postId: post.id, status: 1 } }),
    });
    likeTotal += likers.length;
  }
  console.log(`点赞已创建: ${likeTotal} 条`);

  console.log('\n社区种子数据初始化完成！');
  console.log(`- 帖子: ${savedPosts.length} 个`);
  console.log(`- 评论: ${commentsData.reduce((sum, c) => sum + c.comments.length, 0)} 条`);
  console.log(`- 点赞: ${likeTotal} 条`);

  await dataSource.destroy();
}

if (require.main === module) seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
