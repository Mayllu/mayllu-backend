import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ComplaintCategory } from './complaint_category.entity';
import { District } from './district.entity';
import { ComplaintImage } from './complaint_image.entity';
import { ComplaintState } from './complaint_state.entity';
import { Comment } from './comment.entity';

@Entity({ name: 'complaint' })
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.dni)
  user: User;
  @Column({ type: 'text' })
  description: string;
  @Column({ type: 'point' })
  ubication: string;
  @ManyToOne(() => ComplaintCategory, (category) => category.id)
  category: number;
  @ManyToOne(() => District, (district) => district.id)
  district: number;
  @Column({ type: 'timestamp' })
  created_at: Date;
  @Column({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => ComplaintImage, (complaint_image) => complaint_image.complaint)
  complaints_image: ComplaintImage[];

  @OneToMany(() => Comment, (comment) => comment.complaint)
  comments: Comment[];

  @ManyToOne(() => ComplaintState, (complaintState) => complaintState.complaints)
  @JoinColumn([
    { name: 'id', referencedColumnName: 'complaint_id' },
    { name: 'userDni', referencedColumnName: 'user_id' },
  ])
  complaintState: ComplaintState;
}
