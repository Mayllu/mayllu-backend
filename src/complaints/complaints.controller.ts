// complaints.controller.ts
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
import { logger, createLogContext } from '../logging/winston.config';
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

  @Get('user/:dni')
  async findAllComplaintsFromUser(@Param('dni') dni: string) {
    try {
      logger.info(this.logContext('Find all complaints from user request received', { dni }));

      const complaints = await this.complaintsService.findAllComplaintsFromUser(dni);
      if (!complaints) {
        logger.warn(this.logContext('No complaints found for user', { dni }));
        throw new NotFoundException(`Complaints with DNI ${dni} not found`);
      }

      logger.info(this.logContext('User complaints found successfully', {
        dni,
        count: complaints.length
      }));

      return complaints;
    } catch (error) {
      logger.error(this.logContext('Error in find all complaints from user endpoint', {
        error: error.message,
        dni,
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

  // Implementar sistema de recuperación
  @Post('recover/:id')
  async recoverComplaint(@Param('id') complaintId: string) {
    const audit = await this.complaintAuditModel.findOne({
      complaintId: new Types.ObjectId(complaintId),
      action: 'CREATE'
    }).sort({ createdAt: -1 }).exec();

    if (audit && audit.newValue) {
      // Restaurar la queja usando los datos del audit
      const recoveredComplaint = new this.complaintModel(audit.newValue);
      await recoveredComplaint.save();

      logger.info(this.logContext('Complaint recovered successfully', {
        complaintId,
        userId: audit.userId
      }));

      return recoveredComplaint;
    }
  }

  // Endpoint para investigar la queja específica
  @Get('audit/complaint/:id')
  async investigateComplaint(@Param('id') complaintId: string) {
    logger.info(this.logContext('Starting complaint investigation', { complaintId }));
    
    const auditTrail = await this.complaintAuditModel.find({
      complaintId: new Types.ObjectId(complaintId)
    }).sort({ createdAt: 1 }).exec();

    const complaint = await this.complaintModel.findById(complaintId).exec();
    
    return {
      exists: !!complaint,
      auditTrail,
      currentState: complaint || 'Not Found'
    };
  }

  // Método para buscar quejas potencialmente perdidas
  @Get('audit/lost/:dni')
  async findLostComplaints(@Param('dni') dni: string) {
    try {
      logger.info(this.logContext('Search for lost complaints request received', { dni }));

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Buscar en logs y auditoría
      const searchResults = {
        createdLast7Days: await this.complaintsService.findComplaintsByDni(dni),
        // Aquí podrías agregar más búsquedas en tus logs
      };

      logger.info(this.logContext('Lost complaints search completed', {
        dni,
        resultsFound: searchResults.createdLast7Days.length
      }));

      return searchResults;
    } catch (error) {
      logger.error(this.logContext('Error searching for lost complaints', {
        error: error.message,
        dni,
        stack: error.stack
      }));
      throw new HttpException(
        `Error searching for lost complaints: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}