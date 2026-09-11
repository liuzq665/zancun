import { PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment', { comment: 'ID' })
  id: number;

  @Index()
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}
