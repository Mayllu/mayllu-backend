import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Comment } from './comment.entity';

@Entity({ name: 'comment_like' })
export class CommentLike {
  @PrimaryColumn()
  comment_id: number;
  @PrimaryColumn({ type: 'char', length: 8 })
  user_id: string;
  @Column({ type: 'enum', enum: ['PENDING', 'RESOLVED'] })
  state: string;

  @OneToMany(() => Comment, (comment) => comment.comment_like)
  comments: Comment[];
}
