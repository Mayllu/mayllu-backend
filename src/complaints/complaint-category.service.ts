import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ComplaintCategory, ComplaintCategoryDocument } from './schemas/complaint_category.schema';

@Injectable()
export class ComplaintCategoryService implements OnModuleInit {
  private defaultCategories = [{ name: 'Infraestructura' }, { name: 'Seguridad' }, { name: 'Limpieza' }, { name: 'Transporte' }, { name: 'Ruido' }, { name: 'Otros' }];

  constructor(
    @InjectModel(ComplaintCategory.name)
    private readonly categoryModel: Model<ComplaintCategoryDocument>,
  ) {}

  async onModuleInit() {
    // Initialize default categories if they don't exist
    await this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    for (const category of this.defaultCategories) {
      const existingCategory = await this.categoryModel.findOne({ name: category.name }).exec();
      if (!existingCategory) {
        await new this.categoryModel(category).save();
      }
    }
  }

  async findAll(): Promise<ComplaintCategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<ComplaintCategoryDocument> {
    return this.categoryModel.findById(id).exec();
  }

  async findOrCreateDefault(): Promise<ComplaintCategoryDocument> {
    const defaultCategory = await this.categoryModel.findOne({ name: 'Otros' }).exec();
    if (!defaultCategory) {
      return await new this.categoryModel({ name: 'Otros' }).save();
    }
    return defaultCategory;
  }
}
