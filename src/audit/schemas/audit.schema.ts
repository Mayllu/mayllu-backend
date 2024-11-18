import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ComplaintAudit {
  @Prop({ type: Types.ObjectId, ref: 'Complaint', required: true })
  complaintId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object })
  newValue: any;

  @Prop({ type: Object })
  oldValue: any;

  @Prop()
  traceId: string;

  @Prop()
  userId: string;
}

export type ComplaintAuditDocument = ComplaintAudit & Document;
export const ComplaintAuditSchema = SchemaFactory.createForClass(ComplaintAudit);