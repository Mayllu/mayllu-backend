// complaints-state.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComplaintState, ComplaintStateDocument } from './schemas/complaint_state.schema';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ComplaintStateService {
  constructor(
    @InjectModel(ComplaintState.name)
    private readonly complaintStateModel: Model<ComplaintStateDocument>,
  ) {}

  async createInitialState(complaint: ComplaintDocument, user: User): Promise<ComplaintStateDocument> {
    const complaintState = new this.complaintStateModel({
      complaint: complaint._id,
      user: user.dni,
      state: 'PENDING',
      created_at: new Date()
    });

    return await complaintState.save();
  }

  async findByComplaint(complaintId: string): Promise<ComplaintStateDocument[]> {
    return this.complaintStateModel
      .find({ complaint: new Types.ObjectId(complaintId) })
      .populate('complaint')
      .populate('user')
      .exec();
  }

  async updateState(complaintId: string, newState: string, user: User): Promise<ComplaintStateDocument> {
    const complaintState = new this.complaintStateModel({
      complaint: new Types.ObjectId(complaintId),
      user: user.dni,
      state: newState,
      created_at: new Date()
    });

    return await complaintState.save();
  }
}
