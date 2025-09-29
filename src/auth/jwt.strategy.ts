import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your_jwt_secret',
    });
  }

  validate(payload: User) {
    // This payload becomes req.user
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      firstname: payload.firstname,
      lastname: payload.lastname,
    };
  }
}
