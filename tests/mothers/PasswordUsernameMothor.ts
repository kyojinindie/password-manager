import { faker } from '@faker-js/faker';
import { Username } from '../../src/Contexts/PasswordVault/Passwords/domain/Username';

export class PasswordUsernameMother {
  public static create(value: string): Username {
    return new Username(value);
  }

  public static random(): Username {
    return new Username(faker.internet.username());
  }

  public static withValue(value: string): Username {
    return new Username(value);
  }

  public static email(): Username {
    return new Username(faker.internet.email());
  }

  public static simple(): Username {
    return new Username('john_doe');
  }

  public static withSpaces(): Username {
    return new Username('  user@example.com  ');
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidNull(): any {
    return null;
  }

  public static invalidUndefined(): any {
    return undefined;
  }
}
