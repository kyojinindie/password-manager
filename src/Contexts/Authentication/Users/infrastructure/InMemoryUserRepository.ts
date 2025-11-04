import { UserRepository } from '../domain/UserRepository';
import { User } from '../domain/User';
import { UserId } from '../domain/UserId';
import { Email } from '../domain/Email';
import { Username } from '../domain/Username';

/**
 * In-Memory User Repository - Secondary Adapter
 *
 * In-memory implementation of UserRepository for development and testing.
 * This is a SECONDARY (driven/output) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - Implements the UserRepository port from domain layer
 * - Stores users in memory (Map data structure)
 * - No persistence - data is lost when process restarts
 * - Suitable for development, testing, and demos
 * - NOT suitable for production use
 *
 * Responsibilities:
 * - Persist User aggregates in memory
 * - Retrieve users by ID, email, or username
 * - Maintain data consistency within the process
 *
 * What this adapter DOES NOT do:
 * - Business logic (that's in domain layer)
 * - Validation (that's in domain layer)
 * - Password hashing (that's in domain layer)
 * - Authorization checks
 */
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  public save(user: User): Promise<void> {
    this.users.set(user.id.value, user);
    return Promise.resolve();
  }

  public findById(id: UserId): Promise<User | null> {
    return Promise.resolve(this.users.get(id.value) ?? null);
  }

  public findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  public findByUsername(username: Username): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username.equals(username)) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  public clear(): void {
    this.users.clear();
  }
}
