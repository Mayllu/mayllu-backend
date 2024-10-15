import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Complaint } from './complaint.entity';

@Entity({ name: 'complaint_category' })
export class ComplaintCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'text' })
  icon: string;

  @OneToMany(() => Complaint, (complaint) => complaint.category)
  complaints: Complaint[];
}
