import { UserRepository } from '../../../../../src/Contexts/Authentication/Users/domain/UserRepository';
import { User } from '../../../../../src/Contexts/Authentication/Users/domain/User';
import { UserId } from '../../../../../src/Contexts/Authentication/Users/domain/UserId';
import { Email } from '../../../../../src/Contexts/Authentication/Users/domain/Email';
import { Username } from '../../../../../src/Contexts/Authentication/Users/domain/Username';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  public async save(user: User): Promise<void> {
    this.users.set(user.id.value, user);
  }

  public async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.value) ?? null;
  }

  public async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user;
      }
    }
    return null;
  }

  public async findByUsername(username: Username): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username.equals(username)) {
        return user;
      }
    }
    return null;
  }

  public clear(): void {
    this.users.clear();
  }
}
