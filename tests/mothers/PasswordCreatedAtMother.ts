import { CreatedAt } from '../../src/Contexts/PasswordVault/Passwords/domain/CreatedAt';

export class PasswordCreatedAtMother {
  public static create(value: Date): CreatedAt {
    return new CreatedAt(value);
  }

  public static random(): CreatedAt {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    );
    return new CreatedAt(randomDate);
  }

  public static now(): CreatedAt {
    return new CreatedAt(new Date());
  }

  public static withDate(date: Date): CreatedAt {
    return new CreatedAt(date);
  }

  public static yesterday(): CreatedAt {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new CreatedAt(yesterday);
  }

  public static lastWeek(): CreatedAt {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return new CreatedAt(lastWeek);
  }

  public static lastMonth(): CreatedAt {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return new CreatedAt(lastMonth);
  }
}
