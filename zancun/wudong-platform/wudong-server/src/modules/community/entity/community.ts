import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppUserEntity } from '../../user/entity/user';

/**
 * 社区帖子
 */
@Entity('app_post')
export class AppPostEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Column({ comment: '帖子内容', type: 'text' })
  content: string;

  @Column({ comment: '图片(JSON)', type: 'text', nullable: true })
  images: string;

  @Column({ comment: '视频URL', length: 255, nullable: true })
  video: string;

  @Column({ comment: '帖子类型 photo-照片 video-视频', length: 20, default: 'photo' })
  postType: string;

  @Column({ comment: '标签(JSON)', type: 'text', nullable: true })
  tags: string;

  @Index()
  @Column({ comment: '点赞数量', default: 0 })
  likeCount: number;

  @Index()
  @Column({ comment: '评论数量', default: 0 })
  commentCount: number;

  @Column({ comment: '收藏数量', default: 0 })
  favoriteCount: number;

  @Column({ comment: '浏览量', default: 0 })
  viewCount: number;

  @Column({ comment: '地理位置', length: 100, nullable: true })
  location: string;

  @Column({ comment: '状态 0-隐藏 1-显示', default: 1 })
  status: number;

  @Column({ comment: '是否精华 0-否 1-是', default: 0 })
  isFeatured: number;
}

/**
 * 帖子评论
 */
@Entity('app_comment')
export class AppCommentEntity extends BaseEntity {
  @Index()
  @Column({ comment: '帖子ID' })
  postId: number;

  @ManyToOne(() => AppPostEntity)
  @JoinColumn({ name: 'postId' })
  post: AppPostEntity;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Column({ comment: '评论内容', type: 'text' })
  content: string;

  @Column({ comment: '回复目标用户ID', nullable: true })
  replyUserId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'replyUserId' })
  replyUser: AppUserEntity;

  @Column({ comment: '点赞数量', default: 0 })
  likeCount: number;

  @Column({ comment: '状态 0-隐藏 1-显示', default: 1 })
  status: number;
}

/**
 * 点赞记录
 * 唯一键 (userId, likeType, relatedId)：同一用户对同一目标只能有一条，
 * 否则并发点击会插入重复行、把点赞数刷上去。
 */
@Entity('app_like')
@Index(['userId', 'likeType', 'relatedId'], { unique: true })
export class AppLikeEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Column({ comment: '点赞类型 post-帖子 comment-评论', length: 20 })
  likeType: string;

  @Index()
  @Column({ comment: '关联ID(帖子或评论ID)' })
  relatedId: number;

  @Column({ comment: '状态 0-取消 1-点赞', default: 1 })
  status: number;
}

/**
 * 收藏记录
 * 唯一键 (userId, favoriteType, relatedId)：理由同 app_like
 */
@Entity('app_favorite')
@Index(['userId', 'favoriteType', 'relatedId'], { unique: true })
export class AppFavoriteEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Column({ comment: '收藏类型 post-帖子 product-商品 hotel-民宿 restaurant-餐厅', length: 20 })
  favoriteType: string;

  @Index()
  @Column({ comment: '关联ID' })
  relatedId: number;

  @Column({ comment: '状态 0-取消 1-收藏', default: 1 })
  status: number;
}
