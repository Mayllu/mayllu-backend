import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ComplaintCategory } from './complaint_category.schema';
import { District } from './district.schema';

export type ComplaintDocument = Complaint & Document;

@Schema({ timestamps: true })
export class Complaint {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  ubication: string;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;

  @Prop({ type: String, ref: 'User', required: true })
  user: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ComplaintCategory', required: true })
  category: ComplaintCategory;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'District', required: true })
  district: District;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);

