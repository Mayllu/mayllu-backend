import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  NotFoundException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { businessLogger as logger, createLogContext } from '../logging';
import { Types } from 'mongoose';

@Controller('complaints')
@ApiTags('complaints')
export class ComplaintsController {
  private logContext = createLogContext('ComplaintsController');
  complaintAuditModel: any;
  complaintModel: any;

  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createComplaintDto: CreateComplaintDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      logger.info(this.logContext('Create complaint request received', {
        dto: createComplaintDto,
        fileInfo: {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }
      }));

      const result = await this.complaintsService.create(createComplaintDto, file);
      
      logger.info(this.logContext('Complaint created successfully', {
        complaintId: result._id,
        userId: createComplaintDto.userId
      }));

      return result;
    } catch (error) {
      logger.error(this.logContext('Error in create complaint endpoint', {
        error: error.message,
        stack: error.stack,
        dto: createComplaintDto
      }));
      throw new HttpException(
        `Error creating complaint: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    try {
      logger.info(this.logContext('Find all complaints request received'));
      
      const complaints = await this.complaintsService.findAllComplaints();
      
      logger.info(this.logContext('All complaints fetched successfully', {
        count: complaints.length
      }));
      
      return complaints;
    } catch (error) {
      logger.error(this.logContext('Error in find all complaints endpoint', {
        error: error.message,
        stack: error.stack
      }));
      throw new HttpException(
        `Error fetching complaints: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('user/:dni')
  async findAllComplaintsByDni(@Param('dni') dni: string) {
    try {
      logger.info(this.logContext('Find complaints by DNI request received', { dni }));

      const complaints = await this.complaintsService.findComplaintsByDni(dni);
      if (!complaints || complaints.length === 0) {
        logger.warn(this.logContext('No complaints found for user', { dni }));
        // complaints.controller.ts (continuación)
        throw new NotFoundException(`No complaints found for user with DNI ${dni}`);
      }

      logger.info(this.logContext('Complaints found for user', {
        dni,
        count: complaints.length
      }));

      return complaints;
    } catch (error) {
      logger.error(this.logContext('Error in find complaints by DNI endpoint', {
        error: error.message,
        dni,
        stack: error.stack
      }));
      throw new HttpException(
        `Error fetching complaints: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      logger.info(this.logContext('Find one complaint request received', { complaintId: id }));

      const complaint = await this.complaintsService.findOneComplaint(id.toString());
      if (!complaint) {
        logger.warn(this.logContext('Complaint not found', { complaintId: id }));
        throw new NotFoundException(`Complaint with ID ${id} not found`);
      }

      logger.info(this.logContext('Complaint found successfully', { complaintId: id }));
      return complaint;
    } catch (error) {
      logger.error(this.logContext('Error in find one complaint endpoint', {
        error: error.message,
        complaintId: id,
        stack: error.stack
      }));
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateComplaintDto: UpdateComplaintDto) {
    try {
      logger.info(this.logContext('Update complaint request received', {
        complaintId: id,
        updateData: updateComplaintDto
      }));

      const updatedComplaint = await this.complaintsService.update(id.toString(), updateComplaintDto);
      if (!updatedComplaint) {
        logger.warn(this.logContext('Complaint not found for update', { complaintId: id }));
        throw new NotFoundException(`Complaint with ID ${id} not found`);
      }

      logger.info(this.logContext('Complaint updated successfully', { complaintId: id }));
      return updatedComplaint;
    } catch (error) {
      logger.error(this.logContext('Error in update complaint endpoint', {
        error: error.message,
        complaintId: id,
        updateData: updateComplaintDto,
        stack: error.stack
      }));
      throw new HttpException(
        'Error updating complaint',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      logger.info(this.logContext('Delete complaint request received', { complaintId: id }));

      await this.complaintsService.remove(id.toString());
      
      logger.info(this.logContext('Complaint deleted successfully', { complaintId: id }));
      
      return { 
        message: `Complaint with ID ${id} has been deleted`,
        success: true
      };
    } catch (error) {
      logger.error(this.logContext('Error in delete complaint endpoint', {
        error: error.message,
        complaintId: id,
        stack: error.stack
      }));
      throw new NotFoundException(error.message);
    }
  }
}