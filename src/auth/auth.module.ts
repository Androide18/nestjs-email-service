import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ Import this

@Module({
  imports: [
    UsersModule,
    ConfigModule, // ✅ This is REQUIRED so JwtStrategy can inject ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Needed for dynamic config
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your_jwt_secret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
