import { IsNotEmpty, IsString, IsNumber, IsLatitude, IsLongitude, IsDateString } from 'class-validator';

export class CreateComplaintDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @IsNotEmpty()
  @IsString() // Cambiado de IsNumber a IsString para MongoDB ObjectId
  categoryId: string;

  @IsNotEmpty()
  @IsDateString()
  created_at: Date | string;

  @IsNotEmpty()
  @IsDateString()
  updated_at: Date | string;
}
