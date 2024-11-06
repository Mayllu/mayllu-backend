import { IsNotEmpty, IsString, IsNumber, IsLatitude, IsLongitude, IsOptional, IsDateString } from 'class-validator';

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
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsDateString()
  created_at?: Date | string;

  @IsOptional()
  @IsDateString()
  updated_at?: Date | string;
}
