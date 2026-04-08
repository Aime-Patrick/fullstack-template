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

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }

  async create(email: string, passwordHash: string): Promise<User> {
    return this.usersRepository.create(email, passwordHash);
  }
}
