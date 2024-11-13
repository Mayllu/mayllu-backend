import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ComplaintCategoryDocument = ComplaintCategory & Document;

@Schema()
export class ComplaintCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  icon: string;

  @Prop()
  description: string;
}

export const ComplaintCategorySchema = SchemaFactory.createForClass(ComplaintCategory);

