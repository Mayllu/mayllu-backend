import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ComplaintCategory, ComplaintCategoryDocument } from './schemas/complaint_category.schema';

@Injectable()
export class ComplaintCategoryService implements OnModuleInit {
  private defaultCategories = [
    { name: 'Alumbrado', color: '#FF9500', icon: 'lightbulb', description: 'Problemas con el alumbrado público' },
    { name: 'Parques', color: '#34C759', icon: 'park', description: 'Mantenimiento de áreas verdes y parques' },
    { name: 'Seguridad', color: '#5856D6', icon: 'shield', description: 'Problemas de seguridad ciudadana' },
    { name: 'Residuos', color: '#FF3B30', icon: 'delete', description: 'Problemas con residuos y limpieza' },
    { name: 'Calles', color: '#78AEFF', icon: 'road', description: 'Mantenimiento de pistas y veredas' },
    { name: 'Otros', color: '#6B7280', icon: 'more-horiz', description: 'Otras incidencias' },
  ];

  constructor(
    @InjectModel(ComplaintCategory.name)
    private readonly categoryModel: Model<ComplaintCategoryDocument>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.categoryModel.countDocuments();
      
      if (count === 0) {
        console.log('Initializing default categories...');
        await this.categoryModel.insertMany(this.defaultCategories);
        console.log('Default categories created successfully');
      } else {
        console.log('Categories already exist, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing categories:', error);
      throw error;
    }
  }

  async findOrCreateDefault(): Promise<ComplaintCategoryDocument> {
    try {
      let defaultCategory = await this.categoryModel.findOne({
        name: 'Otros'
      });

      if (!defaultCategory) {
        console.log('Creating default "Otros" category...');
        defaultCategory = await this.categoryModel.create({
          name: 'Otros',
          color: '#78909C',
          icon: 'more-horiz',
          description: 'Otras incidencias'
        });
        console.log('Default category created successfully');
      }

      return defaultCategory;
    } catch (error) {
      console.error('Error in findOrCreateDefault:', error);
      throw error;
    }
  }

  async findAll(): Promise<ComplaintCategoryDocument[]> {
    try {
      return await this.categoryModel.find().sort({ name: 1 }).exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<ComplaintCategoryDocument> {
    try {
      const category = await this.categoryModel.findById(id).exec();
      if (!category) {
        throw new Error(`Category with id ${id} not found`);
      }
      return category;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<ComplaintCategoryDocument> {
    const category = await this.categoryModel.findOne({ name }).exec();
    if (!category) {
      throw new Error(`Category with name ${name} not found`);
    }
    return category;
  }
}
