import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, HttpStatus, HttpException } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('complaints')
@ApiTags('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  async create(@Body() createComplaintDto: CreateComplaintDto) {
    try {
      return await this.complaintsService.create(createComplaintDto);
    } catch (error) {
      // Lanzar una excepción con el mensaje del error específico
      throw new HttpException(`Error creating complaint: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.complaintsService.findAllComplaints();
    } catch {
      throw new HttpException('Error fetching complaints', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const complaint = await this.complaintsService.findOneComplaint(id.toString());
      if (!complaint) {
        throw new NotFoundException(`Complaint with ID ${id} not found`);
      }
      return complaint;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('user/:dni')
  async findAllComplaintsFromUser(@Param('dni') dni: string) {
    try {
      const complaints = await this.complaintsService.findAllComplaintsFromUser(dni);
      if (!complaints) {
        throw new NotFoundException(`Complaints with DNI ${dni} not found`);
      }
      return complaints;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateComplaintDto: UpdateComplaintDto) {
    try {
      const updatedComplaint = await this.complaintsService.update(id.toString(), updateComplaintDto);
      if (!updatedComplaint) {
        throw new NotFoundException(`Complaint with ID ${id} not found`);
      }
      return updatedComplaint;
    } catch {
      throw new HttpException('Error updating complaint', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.complaintsService.remove(id.toString());
      return { message: `Complaint with ID ${id} has been deleted` };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
