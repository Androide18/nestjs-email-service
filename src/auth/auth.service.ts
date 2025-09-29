import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserWithoutPassword } from 'src/users/users.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword> {
    const user = this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Incorrect password');

    const { password, ...result } = user;
    return result;
  }

  async login(user: UserWithoutPassword) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
