import { Module } from '@nestjs/common';
import { InMemoryUsersRepository } from './in-memory-users.repository';
import { USERS_REPOSITORY } from './users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    InMemoryUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: InMemoryUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
