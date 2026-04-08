import { Injectable } from '@nestjs/common';
import { User } from './user.interface';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    });
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
