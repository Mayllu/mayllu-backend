// complaints/controllers/complaint-category.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComplaintCategoryService } from './complaint-category.service';

@Controller('complaint-categories')
@ApiTags('complaint-categories')
export class ComplaintCategoryController {
  constructor(private readonly categoryService: ComplaintCategoryService) {}

  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }
}
