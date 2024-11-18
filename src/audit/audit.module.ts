import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { LogService } from './log.service';
import { ComplaintAudit, ComplaintAuditSchema } from './schemas/audit.schema';
import { businessLogger } from 'src/logging/businessLogger';

@Module({
  imports: [MongooseModule.forFeature([{ name: ComplaintAudit.name, schema: ComplaintAuditSchema }])],
  controllers: [AuditController],
  providers: [
    AuditService,
    LogService,
    {
      provide: 'businessLogger',
      useValue: businessLogger,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
