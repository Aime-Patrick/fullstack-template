import { User } from './user.interface';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UsersRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  create(email: string, passwordHash: string): Promise<User>;
}
