import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ComplaintCategory, ComplaintCategoryDocument } from './schemas/complaint_category.schema';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { GeolocationService } from './geolocation.service';
import { ComplaintStateService } from './complaints-state.service';
import { ComplaintCategoryService } from './complaint-category.service';
import { StorageService } from './storage.service';

interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);
  constructor(
    @InjectModel(Complaint.name) private readonly complaintModel: Model<ComplaintDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ComplaintCategory.name) private readonly categoryModel: Model<ComplaintCategoryDocument>,
    private readonly storageService: StorageService,
    private readonly categoryService: ComplaintCategoryService, // Add this line
    private readonly geolocationService: GeolocationService,
    private readonly complaintStateService: ComplaintStateService,
  ) { }

  async findAllComplaints() {
    try {
      const complaints = await this.complaintModel.find().exec();

      if (!complaints) {
        throw new Error('Error fetching complaints');
      }

      return complaints;
    } catch (error) {
      throw new Error(`Error finding complaints: ${error.message}`);
    }
  }

  async findAllComplaintsFromUser(dni: string): Promise<ComplaintDocument[]> {
    return await this.complaintModel.find({ user: dni }).populate('user').populate('category').populate('district').exec();
  }

  async create(createComplaintDto: CreateComplaintDto, file: FileUpload): Promise<ComplaintDocument> {
    try {
      const { latitude, longitude, userId, categoryId } = createComplaintDto;
      const formattedUbication = `(${latitude}, ${longitude})`;

      // Upload image to Backblaze
      const imageUrl = await this.storageService.uploadFile(file);

      const user = await this.userModel.findOne({ dni: createComplaintDto.userId });
      if (!user) {
        throw new Error(`User with DNI ${createComplaintDto.userId} not found`);
      }

      // Validate and get category
      let category;
      try {
        category = await this.categoryService.findById(categoryId);
        if (!category) {
          category = await this.categoryService.findOrCreateDefault();
        }
      } catch (error) {
        category = await this.categoryService.findOrCreateDefault();
      }

      const district = await this.geolocationService.findOrCreateDistrict(latitude, longitude);
      if (!district) {
        throw new Error(`District not found`);
      }

      // Create new complaint with current timestamps
      const now = new Date();
      const complaint = new this.complaintModel({
        user: user.dni,
        ubication: formattedUbication,
        category: category._id,
        district: district._id,
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        imageUrl: imageUrl,
        created_at: createComplaintDto.created_at || now,
        updated_at: createComplaintDto.updated_at || now,
      });

      const savedComplaint = await complaint.save();
      await this.complaintStateService.createInitialState(savedComplaint, user);

      return savedComplaint;
    } catch (error) {
      throw new Error(`Error creating complaint: ${error.message}`);
    }
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

    const complaint = await this.complaintModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!complaint) {
      throw new Error(`Complaint with ID ${id} not found`);
    }

    return complaint;
  }

  async findOneComplaint(id: string): Promise<ComplaintDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await this.complaintModel.findById(id).populate('user').populate('category').populate('district').exec();

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
