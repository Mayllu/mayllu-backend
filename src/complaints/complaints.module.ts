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

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Complaint.name, schema: ComplaintSchema },
      { name: User.name, schema: UserSchema },
      { name: ComplaintCategory.name, schema: ComplaintCategorySchema },
      { name: District.name, schema: DistrictSchema },
      { name: ComplaintState.name, schema: ComplaintStateSchema },
    ]),
  ],
  controllers: [ComplaintsController],
  providers: [
    ComplaintsService,
    ComplaintStateService,
    GeolocationService,
  ],
})
export class ComplaintsModule {}
