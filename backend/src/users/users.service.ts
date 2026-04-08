import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.interface';
import { USERS_REPOSITORY } from './users.repository';
import type { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  findByEmail(email: string): User | undefined {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): User | undefined {
    return this.usersRepository.findById(id);
  }

  create(email: string, passwordHash: string): User {
    return this.usersRepository.create(email, passwordHash);
  }
}
