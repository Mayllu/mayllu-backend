import { Controller, Get, HttpException, HttpStatus, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { LogService } from './log.service';

@Controller('audit')
@ApiTags('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly logService: LogService,
  ) {}

  @Get('logs/:traceId')
  async findLogsByTraceId(@Param('traceId') traceId: string) {
    try {
      const logs = await this.logService.findByTraceId(traceId);
      if (!logs.length) {
        throw new NotFoundException(`No logs found for traceId: ${traceId}`);
      }
      return logs;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Error searching logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('complaint/:id')
  async getComplaintAudit(@Param('id') id: string) {
    const auditTrail = await this.auditService.getAuditTrail(id);
    const performanceMetrics = await this.logService.getPerformanceMetrics(id);

    return {
      auditTrail,
      performanceMetrics,
    };
  }
}
