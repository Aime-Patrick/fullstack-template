import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secretValue = configService.get<unknown>('JWT_SECRET');
        if (typeof secretValue !== 'string' || !secretValue) {
          throw new Error('JWT_SECRET is required');
        }

        const expiresInValue = configService.get<unknown>('JWT_EXPIRES_IN');
        const expiresIn: StringValue =
          typeof expiresInValue === 'string'
            ? (expiresInValue as StringValue)
            : '1d';

        const options: JwtModuleOptions = {
          secret: secretValue,
          signOptions: { expiresIn },
        };
        return options;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
