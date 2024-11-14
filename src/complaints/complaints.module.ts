// complaints.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { ComplaintStateService } from './complaints-state.service';
import { GeolocationService } from './geolocation.service';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ComplaintCategory, ComplaintCategorySchema } from './schemas/complaint_category.schema';
import { District, DistrictSchema } from './schemas/district.schema';
import { ComplaintState, ComplaintStateSchema } from './schemas/complaint_state.schema';
import { ComplaintCategoryService } from './complaint-category.service';
import { ComplaintCategoryController } from './complaint-category.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../logging/winston.config';

@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRoot(winstonConfig),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: Complaint.name, schema: ComplaintSchema },
      { name: User.name, schema: UserSchema },
      { name: ComplaintCategory.name, schema: ComplaintCategorySchema },
      { name: District.name, schema: DistrictSchema },
      { name: ComplaintState.name, schema: ComplaintStateSchema },
    ]),
  ],
  controllers: [ComplaintsController, ComplaintCategoryController],
  providers: [
    ComplaintsService,
    ComplaintStateService,
    StorageService,
    GeolocationService,
    ComplaintCategoryService,
  ],
})
export class ComplaintsModule {}