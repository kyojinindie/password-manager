import { UpdatedAt } from '../../src/Contexts/PasswordVault/Passwords/domain/UpdatedAt';

export class PasswordUpdatedAtMother {
  public static create(value: Date): UpdatedAt {
    return new UpdatedAt(value);
  }

  public static random(): UpdatedAt {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    );
    return new UpdatedAt(randomDate);
  }

  public static now(): UpdatedAt {
    return UpdatedAt.now();
  }

  public static withDate(date: Date): UpdatedAt {
    return new UpdatedAt(date);
  }

  public static yesterday(): UpdatedAt {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new UpdatedAt(yesterday);
  }

  public static lastWeek(): UpdatedAt {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return new UpdatedAt(lastWeek);
  }

  public static lastMonth(): UpdatedAt {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return new UpdatedAt(lastMonth);
  }

  public static afterCreatedAt(createdAt: Date): UpdatedAt {
    const updated = new Date(createdAt.getTime() + 1000 * 60 * 60); // 1 hour later
    return new UpdatedAt(updated);
  }
}
