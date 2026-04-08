import { User } from './user.interface';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UsersRepository {
  findByEmail(email: string): User | undefined;
  findById(id: string): User | undefined;
  create(email: string, passwordHash: string): User;
}
