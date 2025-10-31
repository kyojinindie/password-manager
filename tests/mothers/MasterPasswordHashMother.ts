import { faker } from '@faker-js/faker';
import { MasterPasswordHash } from '../../src/Contexts/Authentication/Users/domain/MasterPasswordHash';

export class MasterPasswordHashMother {
  public static create(value: string): MasterPasswordHash {
    return new MasterPasswordHash(value);
  }

  public static random(): MasterPasswordHash {
    // Generate a bcrypt-like hash (60 chars)
    const hash = faker.string.alphanumeric(60);
    return new MasterPasswordHash(hash);
  }

  public static bcryptFormat(): MasterPasswordHash {
    // More realistic bcrypt hash format
    return new MasterPasswordHash(`$2b$12$${faker.string.alphanumeric(53)}`);
  }

  public static randomValue(): string {
    return faker.string.alphanumeric(60);
  }

  public static invalidEmpty(): string {
    return '';
  }
}
