import { faker } from '@faker-js/faker';
import { Username } from '../../src/Contexts/Authentication/Users/domain/Username';

export class UsernameMother {
  public static create(value: string): Username {
    return new Username(value);
  }

  public static random(): Username {
    return new Username(faker.internet.username());
  }

  public static withLength(length: number): Username {
    return new Username(faker.string.alphanumeric(length));
  }

  public static withWhitespace(): { username: Username; original: string } {
    const value = faker.internet.username();
    const withSpaces = `  ${value}  `;
    return {
      username: new Username(withSpaces),
      original: value,
    };
  }

  public static randomValue(): string {
    return faker.internet.username();
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidTooShort(): string {
    return faker.string.alphanumeric(2); // Less than 3 chars
  }

  public static invalidTooLong(): string {
    return faker.string.alphanumeric(51); // More than 50 chars
  }
}
