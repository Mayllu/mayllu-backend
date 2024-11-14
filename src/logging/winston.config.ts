// logging/winston.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Crear directorio de logs si no existe
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.printf(info => {
    return JSON.stringify({
      timestamp: info.timestamp,
      level: info.level,
      context: info.context,
      message: info.message,
      metadata: info.metadata || {}
    });
  })
);

export const winstonConfig = {
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'complaints.log'),
      format: customFormat,
      maxsize: 20 * 1024 * 1024, 
      maxFiles: 30,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
      format: customFormat,
      maxsize: 20 * 1024 * 1024,
      maxFiles: 30,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
};

export const logger = winston.createLogger(winstonConfig);

export function createLogContext(context: string) {
  return (message: string, metadata: any = {}) => {
    return {
      context,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  };
}