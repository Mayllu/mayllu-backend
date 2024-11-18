import * as winston from 'winston';
import * as path from 'path';

export const businessLogger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'complaints.log'),
      level: 'info',
      format: winston.format.printf((info: any) =>
        info.level === 'info'
          ? JSON.stringify({
              ts: info.timestamp,
              op: info.message,
              src: info.context,
              data: info.metadata,
            })
          : null,
      ),
    }),
    new winston.transports.File({
      filename: path.join('logs', 'errors.log'),
      level: 'error',
      format: winston.format.printf((info: any) =>
        info.level === 'error'
          ? JSON.stringify({
              ts: info.timestamp,
              level: info.level,
              msg: info.message,
              src: info.context,
              data: info.metadata,
            })
          : null,
      ),
    }),
  ],
});
