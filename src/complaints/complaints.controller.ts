import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CreateComplaintDto, UpdateComplaintDto } from '../dto/complaint.dto';
import { ComplaintsService } from './complaints.service';
import { Complaint } from 'src/interfaces/complaint.interface';

@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}
  @Post()
  async create(@Body() createComplaintDto: CreateComplaintDto) {
    this.complaintsService.create(createComplaintDto);
  }
  @Get()
  async findAll(): Promise<Complaint[]> {
    return this.complaintsService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(+id);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateComplaintDto: UpdateComplaintDto) {
    return `This action updates a #${id} complaint with data: ${JSON.stringify(updateComplaintDto)}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.complaintsService.remove(+id);
  }
}
