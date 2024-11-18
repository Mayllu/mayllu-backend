import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class LogService {
  constructor(@Inject('businessLogger') private readonly logger: Logger) {}

  async findByTraceId(traceId: string) {
    try {
      const logs = await this.readLogs('complaints.log');
      const filteredLogs = logs.filter((log) => log.data?.traceId === traceId);
      if (!filteredLogs.length) {
        this.logger.error(`No logs found for traceId: ${traceId}`, {
          traceId,
          context: 'LogService',
        });
        throw new NotFoundException(`No logs found for traceId: ${traceId}`);
      }
      return filteredLogs;
    } catch (error) {
      this.logger.error(`Error reading logs`, {
        error: error.message,
        traceId,
        context: 'LogService',
      });
      throw error;
    }
  }

  async getPerformanceMetrics(complaintId: string) {
    const logs = await this.readLogs('performance.log');
    return logs.filter((log) => log.path?.includes(complaintId));
  }

  private async readLogs(filename: string): Promise<any[]> {
    const fs = require('fs');
    const readline = require('readline');
    const logs = [];

    const fileStream = fs.createReadStream(`logs/${filename}`);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) {
        logs.push(JSON.parse(line));
      }
    }

    return logs;
  }
}
