import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InMemoryUsersRepository } from './in-memory-users.repository';
import { PrismaUsersRepository } from './prisma-users.repository';
import { USERS_REPOSITORY } from './users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    InMemoryUsersRepository,
    PrismaUsersRepository,
    {
      provide: USERS_REPOSITORY,
      inject: [ConfigService, InMemoryUsersRepository, PrismaUsersRepository],
      useFactory: (
        configService: ConfigService,
        inMemoryRepo: InMemoryUsersRepository,
        prismaRepo: PrismaUsersRepository,
      ) =>
        configService.get('DB_PROVIDER') === 'prisma'
          ? prismaRepo
          : inMemoryRepo,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
