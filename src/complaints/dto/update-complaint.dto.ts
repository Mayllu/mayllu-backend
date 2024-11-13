import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateComplaintDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  latitude?: string;

  @IsOptional()
  @IsNumber()
  longitude?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
