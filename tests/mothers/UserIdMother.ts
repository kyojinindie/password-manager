import { faker } from '@faker-js/faker';
import { UserId } from '../../src/Contexts/Authentication/Users/domain/UserId';

export class UserIdMother {
  public static create(value: string): UserId {
    return new UserId(value);
  }

  public static random(): UserId {
    return new UserId(faker.string.uuid());
  }

  public static randomValue(): string {
    return faker.string.uuid();
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidWhitespace(): string {
    return '   ';
  }
}
