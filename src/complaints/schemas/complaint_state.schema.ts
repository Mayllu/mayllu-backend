import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ComplaintStateDocument = ComplaintState & Document;

@Schema({ timestamps: true })
export class ComplaintState {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Complaint', required: true })
  complaint: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, ref: 'User', required: true })
  user: string;

  @Prop({ required: true, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  state: string;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const ComplaintStateSchema = SchemaFactory.createForClass(ComplaintState);
