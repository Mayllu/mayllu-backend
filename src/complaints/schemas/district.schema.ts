import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Complaint } from './complaint.schema';

export type DistrictDocument = District & Document;

interface Location {
  type: string;
  coordinates: number[];
}

@Schema()
export class District {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  })
  location: Location;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Complaint' }] })
  complaints: Complaint[];
}

export const DistrictSchema = SchemaFactory.createForClass(District);

// Crear índice geoespacial
DistrictSchema.index({ location: '2dsphere' });
