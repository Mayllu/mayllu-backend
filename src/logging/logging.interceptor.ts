import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performanceLogger } from './performanceLogger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          performanceLogger.info('Request completed', {
            metadata: {
              url: request.url,
              method: request.method,
              duration: `${duration}ms`,
              statusCode: context.switchToHttp().getResponse().statusCode,
              responseSize: JSON.stringify(response).length,
              memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
              requestPayload: request.body ? Object.keys(request.body).length : 0,
              ipAddress: request.ip
            }
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          performanceLogger.error('Request failed', {
            metadata: {
              url: request.url,
              method: request.method,
              duration: `${duration}ms`,
              error: error.message,
              stack: error.stack
            }
          });
        }
      })
    );
  }
}