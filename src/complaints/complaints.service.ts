import { Injectable } from '@nestjs/common';
import { Complaint } from '../interfaces/complaint.interface';

@Injectable()
export class ComplaintsService {
  private readonly complaints: Complaint[] = [];
  create(complaint: Complaint) {
    this.complaints.push(complaint);
  }
  findAll(): Complaint[] {
    return this.complaints;
  }
  findOne(id: number): Complaint {
    return this.complaints[id];
  }
  update(id: number, complaint: Complaint) {
    this.complaints[id] = complaint;
  }
  remove(id: number) {
    this.complaints.splice(id, 1);
  }
}
