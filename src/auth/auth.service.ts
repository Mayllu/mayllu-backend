import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayLoadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

// PlaceHolder
const testingUsers = [
  {
    id: 1,
    username: 'user1',
    password: '123',
  },
  {
    id: 2,
    username: 'user2',
    password: '1232',
  },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateUser({ username, password }: AuthPayLoadDto) {
    const curUser = testingUsers.find((user) => user.username === username);
    if (!curUser || password != curUser.password) throw new UnauthorizedException();
    if (password === curUser.password) {
      const { id, username } = curUser;
      return this.jwtService.sign({ id, username });
    }
  }
}
