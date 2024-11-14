import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ComplaintAuditDocument = ComplaintAudit & Document;

@Schema({ timestamps: true })
export class ComplaintAudit {
  @Prop({ required: true })
  complaintId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  action: string; // CREATE, READ, UPDATE, DELETE, STATE_CHANGE

  @Prop({ type: Object })
  oldValue: any;

  @Prop({ type: Object })
  newValue: any;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const ComplaintAuditSchema = SchemaFactory.createForClass(ComplaintAudit);
