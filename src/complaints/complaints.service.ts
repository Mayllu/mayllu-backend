import { Injectable } from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@Injectable()
export class ComplaintsService {
  create(createComplaintDto: CreateComplaintDto) {
    console.log(createComplaintDto);
    return 'This action adds a new complaint';
  }

  findAll() {
    return `This action returns all complaints`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  update(id: number, updateComplaintDto: UpdateComplaintDto) {
    console.log(updateComplaintDto);
    return `This action updates a #${id} complaint`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}
