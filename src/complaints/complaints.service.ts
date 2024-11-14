// complaints.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ComplaintCategory, ComplaintCategoryDocument } from './schemas/complaint_category.schema';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { GeolocationService } from './geolocation.service';
import { ComplaintCategoryService } from './complaint-category.service';
import { StorageService } from './storage.service';
import { logger, createLogContext } from '../logging/winston.config';

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
  private logContext = createLogContext('ComplaintsService');

  constructor(
    @InjectModel(Complaint.name) private readonly complaintModel: Model<ComplaintDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ComplaintCategory.name) private readonly categoryModel: Model<ComplaintCategoryDocument>,
    private readonly storageService: StorageService,
    private readonly categoryService: ComplaintCategoryService,
    private readonly geolocationService: GeolocationService,
  ) {}

  async findAllComplaints() {
    try {
      logger.info(this.logContext('Fetching all complaints'));

      const complaints = await this.complaintModel
        .find()
        .populate({
          path: 'user',
          model: 'User',
          localField: 'user',
          foreignField: 'dni',
        })
        .populate('category')
        .populate('district')
        .sort({ createdAt: -1 })
        .exec();

      if (!complaints) {
        logger.error(this.logContext('Error fetching complaints: No complaints found'));
        throw new Error('Error fetching complaints');
      }

      logger.info(this.logContext('Successfully fetched complaints', { count: complaints.length }));
      return complaints;
    } catch (error) {
      logger.error(this.logContext('Error finding complaints', {
        error: error.message,
        stack: error.stack
      }));
      throw new Error(`Error finding complaints: ${error.message}`);
    }
  }

  async findAllComplaintsFromUser(dni: string): Promise<ComplaintDocument[]> {
    try {
      logger.info(this.logContext('Fetching complaints for user', { dni }));

      const complaints = await this.complaintModel
        .find({ user: dni })
        .populate({
          path: 'user',
          model: 'User',
          localField: 'user',
          foreignField: 'dni',
        })
        .populate('category')
        .populate('district')
        .sort({ createdAt: -1 })
        .exec();

      logger.info(this.logContext('Successfully fetched user complaints', { 
        dni, 
        count: complaints.length 
      }));

      return complaints;
    } catch (error) {
      logger.error(this.logContext('Error fetching user complaints', {
        error: error.message,
        dni,
        stack: error.stack
      }));
      throw error;
    }
  }

  async findComplaintsByDni(dni: string): Promise<Complaint[]> {
    try {
      logger.info(this.logContext('Searching complaints by DNI', { dni }));
      
      const complaints = await this.complaintModel.find({ user: dni }).exec();
      
      logger.info(this.logContext('Found complaints by DNI', { 
        dni, 
        count: complaints.length 
      }));
      
      return complaints;
    } catch (error) {
      logger.error(this.logContext('Error fetching complaints by DNI', {
        error: error.message,
        dni,
        stack: error.stack
      }));
      throw new NotFoundException(`Error fetching complaints for DNI ${dni}: ${error.message}`);
    }
  }

  async create(createComplaintDto: CreateComplaintDto, file: FileUpload): Promise<ComplaintDocument> {
    try {
      logger.info(this.logContext('Starting complaint creation', { 
        userId: createComplaintDto.userId,
        categoryName: createComplaintDto.categoryName
      }));

      const { latitude, longitude, userId, categoryName } = createComplaintDto;

      const category = await this.categoryService.findByName(categoryName);
      if (!category) {
        logger.error(this.logContext('Category not found', { categoryName }));
        throw new Error(`Category with name ${categoryName} not found`);
      }

      const locationDetails = await this.geolocationService.getLocationDetails(latitude, longitude);
      logger.info(this.logContext('Location details retrieved', { 
        formattedAddress: locationDetails.formattedAddress 
      }));

      const imageUrl = await this.storageService.uploadFile(file);
      logger.info(this.logContext('File uploaded successfully', { imageUrl }));

      const complaint = new this.complaintModel({
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        ubication: `(${latitude}, ${longitude})`,
        formattedAddress: locationDetails.formattedAddress,
        street: locationDetails.street,
        streetNumber: locationDetails.streetNumber,
        neighborhood: locationDetails.neighborhood,
        user: userId,
        category: {
          _id: category._id,
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
        district: locationDetails.district._id,
        imageUrl,
      });

      await complaint.save();
      
      logger.info(this.logContext('Complaint created successfully', {
        complaintId: complaint._id,
        userId
      }));

      return complaint;
    } catch (error) {
      logger.error(this.logContext('Error creating complaint', {
        error: error.message,
        dto: createComplaintDto,
        stack: error.stack
      }));
      throw new Error(`Error creating complaint: ${error.message}`);
    }
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto): Promise<ComplaintDocument> {
    try {
      logger.info(this.logContext('Starting complaint update', { complaintId: id }));

      const { latitude, longitude, categoryId, description } = updateComplaintDto;
      const updateData: any = {};

      if (latitude && longitude) {
        updateData.ubication = `(${latitude}, ${longitude})`;
        try {
          const locationDetails = await this.geolocationService.getLocationDetails(
            latitude.toString(),
            longitude.toString()
          );

          updateData.formattedAddress = locationDetails.formattedAddress;
          updateData.street = locationDetails.street;
          updateData.streetNumber = locationDetails.streetNumber;
          updateData.neighborhood = locationDetails.neighborhood;
          updateData.district = locationDetails.district._id;

          logger.info(this.logContext('Location details updated', { 
            complaintId: id,
            newAddress: locationDetails.formattedAddress 
          }));
        } catch (error) {
          logger.error(this.logContext('Error updating location details', {
            error: error.message,
            complaintId: id
          }));
        }
      }

      if (categoryId) {
        updateData.category = new Types.ObjectId(categoryId);
      }

      if (description) {
        updateData.description = description;
      }

      const complaint = await this.complaintModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('user')
        .populate('category')
        .populate('district')
        .exec();

      if (!complaint) {
        logger.error(this.logContext('Complaint not found for update', { complaintId: id }));
        throw new Error(`Complaint with ID ${id} not found`);
      }

      logger.info(this.logContext('Complaint updated successfully', { complaintId: id }));
      return complaint;
    } catch (error) {
      logger.error(this.logContext('Error updating complaint', {
        error: error.message,
        complaintId: id,
        stack: error.stack
      }));
      throw error;
    }
  }

  async findOneComplaint(id: string): Promise<ComplaintDocument> {
    try {
      logger.info(this.logContext('Fetching single complaint', { complaintId: id }));

      if (!Types.ObjectId.isValid(id)) {
        logger.error(this.logContext('Invalid complaint ID format', { complaintId: id }));
        throw new Error('Invalid complaint ID');
      }

      const complaint = await this.complaintModel.findById(id).exec();

      if (!complaint) {
        logger.error(this.logContext('Complaint not found', { complaintId: id }));
        throw new Error(`Complaint with ID ${id} not found`);
      }

      logger.info(this.logContext('Complaint found successfully', { complaintId: id }));
      return complaint;
    } catch (error) {
      logger.error(this.logContext('Error finding complaint', {
        error: error.message,
        complaintId: id,
        stack: error.stack
      }));
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      logger.info(this.logContext('Attempting to delete complaint', { complaintId: id }));

      if (!Types.ObjectId.isValid(id)) {
        logger.error(this.logContext('Invalid complaint ID format', { complaintId: id }));
        throw new Error('Invalid complaint ID');
      }

      const complaint = await this.complaintModel.findById(id).exec();
      if (!complaint) {
        logger.error(this.logContext('Complaint not found for deletion', { complaintId: id }));
        throw new Error(`Complaint with ID ${id} not found`);
      }

      if (complaint.imageUrl) {
        try {
          await this.storageService.deleteFile(complaint.imageUrl);
          logger.info(this.logContext('Associated image deleted', { 
            complaintId: id,
            imageUrl: complaint.imageUrl 
          }));
        } catch (error) {
          logger.warn(this.logContext('Error deleting image file', {
            error: error.message,
            imageUrl: complaint.imageUrl
          }));
        }
      }

      await complaint.deleteOne();
      logger.info(this.logContext('Complaint deleted successfully', { complaintId: id }));
    } catch (error) {
      logger.error(this.logContext('Error removing complaint', {
        error: error.message,
        complaintId: id,
        stack: error.stack
      }));
      throw error;
    }
  }

  async findByName(name: string): Promise<ComplaintDocument> {
    try {
      logger.info(this.logContext('Searching complaint by name', { name }));

      if (!name) {
        logger.error(this.logContext('Invalid complaint name provided'));
        throw new Error('Invalid complaint name');
      }

      const complaint = await this.complaintModel.findOne({ name }).exec();
      if (!complaint) {
        logger.error(this.logContext('Complaint not found by name', { name }));
        throw new Error(`Complaint with name ${name} not found`);
      }

      logger.info(this.logContext('Complaint found by name', { 
        name,
        complaintId: complaint._id 
      }));
      
      return complaint;
    } catch (error) {
      logger.error(this.logContext('Error finding complaint by name', {
        error: error.message,
        name,
        stack: error.stack
      }));
      throw error;
    }
  }
}
