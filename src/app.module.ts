import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplaintsModule } from './complaints/complaints.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    MongooseModule.forRoot(process.env.MAYLLU_MONGO_URI),
    ComplaintsModule,
  ],
})
export class AppModule {}
