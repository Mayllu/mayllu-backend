import { Complaint } from 'src/model/complaint.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Response } from './response.entity';
import { CommentLike } from './comment_like.entity';

@Entity({ name: 'comment' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Complaint, (complaint) => complaint.id)
  complaint: number;
  @ManyToOne(() => User, (user) => user.dni)
  user: string;
  @Column({ type: 'text' })
  description: string;
  @Column({ type: 'text', nullable: true })
  image_url: string;
  @Column({ type: 'bigint' })
  likes: number;
  @Column({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => Response, (response) => response.comment)
  responses: Response[];
  @ManyToOne(() => CommentLike, (comment_like) => comment_like.comments)
  @JoinColumn([
    { name: 'id', referencedColumnName: 'comment_id' },
    { name: 'userDni', referencedColumnName: 'user_id' },
  ])
  comment_like: CommentLike;
}
