import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/model/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async comparePassword(plainPassword, hashedPassword) {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  }

  async createJWT(createAuthDto: CreateAuthDto): Promise<{ access_token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: {
        dni: createAuthDto.dni,
      },
    });
    const existingPassword = await bcrypt.compare(createAuthDto.password, existingUser.password);

    if (!existingUser || !existingPassword) {
      throw new UnauthorizedException('No existe el usuario o la contraseña es incorrecta.');
    }

    const payload = {
      dni: existingUser.dni,
      name: existingUser.name,
      lastname: existingUser.lastname,
      email: existingUser.email,
      image_url: existingUser.image_url,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser1 = await this.userRepository.findOne({
      where: {
        dni: createUserDto.dni,
      },
    });
    const existingUser2 = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (existingUser1) {
      throw new ConflictException('El DNI ya está registrado.');
    }
    if (existingUser2) {
      throw new ConflictException('El Email ya está registrado.');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    await this.userRepository.insert({
      dni: createUserDto.dni,
      password: hashedPassword,
      name: createUserDto.name,
      lastname: createUserDto.lastname,
      email: createUserDto.email,
      image_url: createUserDto.image_url,
      created_at: Date(),
      updated_at: Date(),
    });

    const payload = {
      dni: createUserDto.dni,
      name: createUserDto.name,
      lastname: createUserDto.lastname,
      email: createUserDto.email,
      image_url: createUserDto.image_url,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
