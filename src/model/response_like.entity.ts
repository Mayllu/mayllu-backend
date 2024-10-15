import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Response } from './response.entity';

@Entity({ name: 'response_like' })
export class ResponseLike {
  @PrimaryColumn()
  response_id: number;
  @PrimaryColumn({ type: 'char', length: 8 })
  user_id: string;
  @Column({ type: 'enum', enum: ['PENDING', 'RESOLVED'] })
  state: string;

  @OneToMany(() => Response, (response) => response.response_like)
  responses: Response[];
}
