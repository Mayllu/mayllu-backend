import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ComplaintCategory, ComplaintCategoryDocument } from './schemas/complaint_category.schema';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { GeolocationService } from './geolocation.service';
import { ComplaintStateService } from './complaints-state.service';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private readonly complaintModel: Model<ComplaintDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ComplaintCategory.name) private readonly categoryModel: Model<ComplaintCategoryDocument>,
    private readonly geolocationService: GeolocationService,
    private readonly complaintStateService: ComplaintStateService,
  ) {}

  async findAllComplaints() {
    return await this.complaintModel
      .find()
      .populate('user')
      .populate('category')
      .populate('district')
      .exec();
  }

  async findAllComplaintsFromUser(dni: string): Promise<ComplaintDocument[]> {
    return await this.complaintModel
      .find({ user: dni })
      .populate('user')
      .populate('category')
      .populate('district')
      .exec();
  }

  async create(createComplaintDto: CreateComplaintDto): Promise<ComplaintDocument> {
    const { latitude, longitude, userId, categoryId } = createComplaintDto;
    const formattedUbication = `(${latitude}, ${longitude})`;

    const user = await this.userModel.findOne({ dni: userId }).exec();
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    const district = await this.geolocationService.findOrCreateDistrict(latitude, longitude);
    if (!district) {
      throw new Error(`District not found`);
    }

    const complaint = new this.complaintModel({
      user: user.dni,
      ubication: formattedUbication,
      category: new Types.ObjectId(categoryId),
      district: district._id,
      title: createComplaintDto.title,
      description: createComplaintDto.description,
      created_at: new Date(createComplaintDto.created_at),
      updated_at: new Date(createComplaintDto.updated_at),
    });

    const savedComplaint = await complaint.save();

    // Crear el estado inicial
    await this.complaintStateService.createInitialState(savedComplaint, user);

    return savedComplaint;
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto): Promise<ComplaintDocument> {
    const { latitude, longitude, categoryId, description } = updateComplaintDto;
    const updateData: any = {};

    if (latitude && longitude) {
      updateData.ubication = `(${latitude}, ${longitude})`;
    }

    if (categoryId) {
      updateData.category = new Types.ObjectId(categoryId);
    }

    if (description) {
      updateData.description = description;
    }

    updateData.updated_at = new Date();

    const complaint = await this.complaintModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!complaint) {
      throw new Error(`Complaint with ID ${id} not found`);
    }

    return complaint;
  }

  async findOneComplaint(id: string): Promise<ComplaintDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await this.complaintModel
      .findById(id)
      .populate('user')
      .populate('category')
      .populate('district')
      .exec();

    if (!complaint) {
      throw new Error(`Complaint with ID ${id} not found`);
    }

    return complaint;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await this.complaintModel.findById(id).exec();
    if (!complaint) {
      throw new Error(`Complaint with ID ${id} not found`);
    }

    await complaint.deleteOne();
  }
}
