import { faker } from '@faker-js/faker';
import { Email } from '../../src/Contexts/Authentication/Users/domain/Email';

export class EmailMother {
  public static create(value: string): Email {
    return new Email(value);
  }

  public static random(): Email {
    return new Email(faker.internet.email());
  }

  public static withDomain(domain: string): Email {
    const username = faker.internet.username().toLowerCase();
    return new Email(`${username}@${domain}`);
  }

  public static uppercase(): Email {
    const email = faker.internet.email().toUpperCase();
    return new Email(email);
  }

  public static withWhitespace(): { email: Email; trimmed: string } {
    const value = faker.internet.email().toLowerCase();
    const withSpaces = `  ${value}  `;
    return {
      email: new Email(withSpaces),
      trimmed: value,
    };
  }

  public static randomValue(): string {
    return faker.internet.email().toLowerCase();
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidFormat(): string {
    return faker.lorem.word();
  }

  public static invalidWithoutAt(): string {
    return `${faker.lorem.word()}gmail.com`;
  }

  public static invalidWithoutDomain(): string {
    return `${faker.internet.username()}@`;
  }
}
