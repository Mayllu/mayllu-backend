import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_category' })
export class UserCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'bigint' })
  min_complaints: number;

  @OneToMany(() => User, (user) => user.user_category)
  users: User[];
}
