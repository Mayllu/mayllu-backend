import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  latitude: string;

  @IsNotEmpty()
  longitude: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  categoryName: string;
}