import { Injectable, Logger } from '@nestjs/common';
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
    private readonly categoryService: ComplaintCategoryService,
    private readonly geolocationService: GeolocationService,
  ) { }

  async findAllComplaints() {
    try {
      const complaints = await this.complaintModel
        .find()
        .populate({
          path: 'user',
          model: 'User',
          // Especificamos que el campo local 'user' contiene el DNI
          localField: 'user',
          foreignField: 'dni'
        })
        .populate('category')
        .populate('district')
        .sort({ createdAt: -1 })
        .exec();

      if (!complaints) {
        throw new Error('Error fetching complaints');
      }

      this.logger.log(`Found ${complaints.length} complaints`);
      return complaints;
    } catch (error) {
      this.logger.error(`Error finding complaints: ${error.message}`);
      throw new Error(`Error finding complaints: ${error.message}`);
    }
  }

  async findAllComplaintsFromUser(dni: string): Promise<ComplaintDocument[]> {
    return await this.complaintModel
      .find({ user: dni })
      .populate({
        path: 'user',
        model: 'User',
        localField: 'user',
        foreignField: 'dni'
      })
      .populate('category')
      .populate('district')
      .sort({ createdAt: -1 })
      .exec();
  }

  // complaints.service.ts
async create(createComplaintDto: CreateComplaintDto, file: FileUpload): Promise<ComplaintDocument> {
  try {
    const { latitude, longitude, userId, categoryName } = createComplaintDto;

    // Obtener la categoría completa
    const category = await this.categoryService.findByName(categoryName);
    if (!category) throw new Error(`Category with name ${categoryName} not found`);

    // Formatear ubicación y obtener detalles
    const formattedUbication = `(${latitude}, ${longitude})`;
    const locationDetails = await this.geolocationService.getLocationDetails(latitude, longitude);
    
    // Subir imagen
    const imageUrl = await this.storageService.uploadFile(file);

    // Crear la queja con los detalles completos de la categoría
    const complaint = new this.complaintModel({
      title: createComplaintDto.title,
      description: createComplaintDto.description,
      ubication: formattedUbication,
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
    return complaint;
  } catch (error) {
    throw new Error(`Error creating complaint: ${error.message}`);
  }
}

  async update(id: string, updateComplaintDto: UpdateComplaintDto): Promise<ComplaintDocument> {
    const { latitude, longitude, categoryId, description } = updateComplaintDto;
    const updateData: any = {};

    if (latitude && longitude) {
      updateData.ubication = `(${latitude}, ${longitude})`;

      // Actualizar información de ubicación
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
      } catch (error) {
        this.logger.error(`Error updating location details: ${error.message}`);
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
      throw new Error(`Complaint with ID ${id} not found`);
    }

    return complaint;
  }

  async findOneComplaint(id: string): Promise<ComplaintDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await this.complaintModel
      .findById(id).exec();

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

  async findByName(name: string): Promise<ComplaintDocument> {
    if (!name) {
      throw new Error('Invalid complaint name');
    }

    const complaint = await this.complaintModel.findOne({ name }).exec();
    if (!complaint) throw new Error(`Complaint with name ${name} not found`);

    return complaint;
  }
}