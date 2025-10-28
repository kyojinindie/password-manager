import { faker } from '@faker-js/faker';
import { Salt } from '../../src/Contexts/Authentication/Users/domain/Salt';

export class SaltMother {
  public static create(value: string): Salt {
    return new Salt(value);
  }

  public static random(): Salt {
    // Generate a bcrypt-like salt (29 chars)
    const salt = faker.string.alphanumeric(29);
    return new Salt(salt);
  }

  public static bcryptFormat(): Salt {
    // More realistic bcrypt salt format
    return new Salt(`$2b$12$${faker.string.alphanumeric(22)}`);
  }

  public static randomValue(): string {
    return faker.string.alphanumeric(29);
  }

  public static invalidEmpty(): string {
    return '';
  }
}
