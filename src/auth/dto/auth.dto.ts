import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPayLoadDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}
