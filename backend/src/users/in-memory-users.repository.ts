import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from './user.interface';
import { UsersRepository } from './users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  private users: User[] = [];

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email.toLowerCase());
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(email: string, passwordHash: string): User {
    const user: User = {
      id: randomUUID(),
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }
}
