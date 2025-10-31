import { LastLoginAt } from '../../src/Contexts/Authentication/Users/domain/LastLoginAt';

export class LastLoginAtMother {
  public static create(value: Date | null): LastLoginAt {
    return new LastLoginAt(value);
  }

  public static empty(): LastLoginAt {
    return LastLoginAt.empty();
  }

  public static now(): LastLoginAt {
    return LastLoginAt.now();
  }

  public static random(): LastLoginAt {
    const date = new Date();
    // Random date within the last year
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    return new LastLoginAt(date);
  }

  public static yesterday(): LastLoginAt {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return new LastLoginAt(date);
  }

  public static oneHourAgo(): LastLoginAt {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return new LastLoginAt(date);
  }

  public static oneWeekAgo(): LastLoginAt {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return new LastLoginAt(date);
  }

  public static oneMonthAgo(): LastLoginAt {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return new LastLoginAt(date);
  }

  public static specific(date: Date): LastLoginAt {
    return new LastLoginAt(date);
  }

  public static invalidFutureDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }

  public static invalidDate(): Date {
    return new Date('invalid');
  }
}
