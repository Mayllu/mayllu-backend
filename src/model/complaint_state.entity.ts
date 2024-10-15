import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Complaint } from './complaint.entity';

@Entity({ name: 'complaint_state' })
export class ComplaintState {
  @PrimaryColumn({ type: 'bigint' })
  complaint_id: number;
  @PrimaryColumn({ type: 'char', length: 8 })
  user_id: string;
  @Column({ type: 'enum', enum: ['PENDING', 'RESOLVED'] })
  state: string;

  @OneToMany(() => Complaint, (complaint) => complaint.complaintState)
  complaints: Complaint[];
}
