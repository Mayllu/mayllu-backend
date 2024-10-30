import { IsString, IsNotEmpty, IsEmail, IsUrl, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El DNI no puede estar vacío' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos' })
  dni: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  lastname: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  password: string;

  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsOptional()
  image_url?: string;

  @IsOptional()
  created_at?: Date = new Date();

  @IsOptional()
  updated_at?: Date = new Date();
}
