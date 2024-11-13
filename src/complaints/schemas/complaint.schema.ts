// schemas/complaint.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { District } from './district.schema';

interface CategoryDetails {
  _id: MongooseSchema.Types.ObjectId;
  name: string;
  color: string;
  icon: string;
}

@Schema({ timestamps: true })
export class Complaint {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  ubication: string;

  @Prop()
  formattedAddress: string;

  @Prop()
  street: string;

  @Prop()
  streetNumber: string;

  @Prop()
  neighborhood: string;

  @Prop({ type: String, ref: 'User', required: true })
  user: string;

  @Prop({
    type: {
      _id: { type: MongooseSchema.Types.ObjectId, ref: 'ComplaintCategory' },
      name: String,
      color: String,
      icon: String,
    },
    required: true,
  })
  category: CategoryDetails;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'District', required: true })
  district: District;

  @Prop({ type: String })
  imageUrl: string;
}

export type ComplaintDocument = Complaint & Document;
export const ComplaintSchema = SchemaFactory.createForClass(Complaint);