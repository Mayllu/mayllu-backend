import { IsString } from 'class-validator';

export class CreateComplaintDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly status: string;
}

export class UpdateComplaintDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsString()
  status?: string;
}
