import { v4 as uuid } from "uuid"
import { LogMetadata } from "./interfaces/loggerMetadata";

export function createLogContext(context: string) {
  const traceId = uuid();
  return (message: string, metadata: LogMetadata = {}) => ({
    context,
    message,
    metadata: {
      ...metadata,
      traceId,
      source: context
    }
  });
}
