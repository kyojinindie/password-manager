import { faker } from '@faker-js/faker';
import { CreatedAt } from '../../src/Contexts/Authentication/Users/domain/CreatedAt';

export class CreatedAtMother {
  public static create(value: Date): CreatedAt {
    return new CreatedAt(value);
  }

  public static random(): CreatedAt {
    return new CreatedAt(faker.date.recent());
  }

  public static now(): CreatedAt {
    return new CreatedAt(new Date());
  }

  public static past(): CreatedAt {
    return new CreatedAt(faker.date.past());
  }

  public static randomValue(): Date {
    return faker.date.recent();
  }
}
