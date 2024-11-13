// leaderboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Complaint, ComplaintDocument } from '../complaints/schemas/complaint.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<ComplaintDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getLeaderboard() {
    const leaderboard = await this.complaintModel.aggregate([
      {
        $group: {
          _id: '$user', // Agrupamos por el campo 'user' que contiene el DNI
          complaintsCount: { $count: {} },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id', // El campo 'user' en complaints que contiene el DNI
          foreignField: 'dni', // El campo 'dni' en la colección 'users'
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 0,
          userDni: '$_id',
          userName: '$userDetails.name',
          complaintsCount: 1,
        },
      },
      { $sort: { complaintsCount: -1 } }, // Ordenar por cantidad de complaints
    ]);

    return leaderboard;
  }
}
