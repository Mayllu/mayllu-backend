// schemas/complaint.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ComplaintCategory } from './complaint_category.schema';
import { District } from './district.schema';
import { User } from 'src/users/schemas/user.schema';

export type ComplaintDocument = Complaint & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Complaint {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  ubication: string;

  @Prop({ type: String, ref: 'User', required: true })
  user: User | string; // Referencia singular, no plural

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ComplaintCategory', required: true })
  category: ComplaintCategory; // Referencia singular

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'District', required: true })
  district: District; // Referencia singular

  @Prop({ type: String })
  imageUrl: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
