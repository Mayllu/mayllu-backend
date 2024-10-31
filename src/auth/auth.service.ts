import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/model/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto): Promise<{ access_token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: {
        dni: createAuthDto.dni,
        password: createAuthDto.password,
      },
    });

    if (!existingUser) {
      throw new UnauthorizedException('No existe el usuario.');
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
}
