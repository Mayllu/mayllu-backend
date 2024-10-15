import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Complaint } from './complaint.entity';

@Entity({ name: 'complaint_image' })
export class ComplaintImage {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @ManyToOne(() => Complaint, (complaint) => complaint.id)
  complaint: number;
}
