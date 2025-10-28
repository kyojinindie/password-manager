import { User } from './User';
import { UserId } from './UserId';
import { Email } from './Email';
import { Username } from './Username';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
}
