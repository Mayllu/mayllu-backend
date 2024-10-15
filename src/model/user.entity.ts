import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Complaint } from './complaint.entity';
import { Comment } from './comment.entity';
import { UserCategory } from './user_category.entity';
import { Response } from './response.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryColumn('char', { length: 8 })
  dni: string;
  @ManyToOne(() => UserCategory, (category) => category.id)
  user_category: number;
  @Column()
  name: string;
  @Column()
  lastname: string;
  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string;
  @Column({ type: 'varchar', length: 255 })
  password: string;
  @Column()
  image_url: string;
  @Column({ type: 'timestamp' })
  created_at: Date;
  @Column({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints: Complaint[];
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
  @OneToMany(() => Response, (response) => response.user)
  responses: Response[];
}
