import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Complaint } from './complaint.entity';

@Entity({ name: 'district' })
export class District {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Complaint, (complaint) => complaint.district)
  complaints: Complaint[];
}
