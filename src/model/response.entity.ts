import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from './user.entity';
import { ResponseLike } from './response_like.entity';

@Entity({ name: 'response' })
export class Response {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Comment, (comment) => comment.id)
  comment: number;
  @ManyToOne(() => User, (user) => user.dni)
  user: string;
  @Column({ type: 'text' })
  content: string;
  @Column({ type: 'bigint' })
  likes: number;
  @Column({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => ResponseLike, (response_like) => response_like.responses)
  @JoinColumn([
    { name: 'id', referencedColumnName: 'response_id' },
    { name: 'userDni', referencedColumnName: 'user_id' },
  ])
  response_like: ResponseLike;
}
