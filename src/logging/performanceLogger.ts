import * as winston from 'winston';
import * as path from 'path';

export const performanceLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.printf((info: any) => {
        if (info.message !== 'Request completed') return null;
        const { metadata } = info;
        return JSON.stringify({
          ts: info.timestamp,
          path: metadata?.url,
          mth: metadata?.method,
          dur: metadata?.duration,
          st: metadata?.statusCode,
          mem: metadata?.memoryUsage,
          size: metadata?.responseSize
        });
      })
    })
  ]
});