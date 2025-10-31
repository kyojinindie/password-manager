import { FailedLoginAttempts } from '../../src/Contexts/Authentication/Users/domain/FailedLoginAttempts';

export class FailedLoginAttemptsMother {
  public static create(value: number): FailedLoginAttempts {
    return new FailedLoginAttempts(value);
  }

  public static zero(): FailedLoginAttempts {
    return FailedLoginAttempts.zero();
  }

  public static random(): FailedLoginAttempts {
    const values = [0, 1, 2, 3, 4];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    return new FailedLoginAttempts(randomValue);
  }

  public static one(): FailedLoginAttempts {
    return new FailedLoginAttempts(1);
  }

  public static two(): FailedLoginAttempts {
    return new FailedLoginAttempts(2);
  }

  public static three(): FailedLoginAttempts {
    return new FailedLoginAttempts(3);
  }

  public static four(): FailedLoginAttempts {
    return new FailedLoginAttempts(4);
  }

  public static atLockThreshold(): FailedLoginAttempts {
    return new FailedLoginAttempts(5);
  }

  public static locked(): FailedLoginAttempts {
    return new FailedLoginAttempts(5);
  }

  public static invalidNegative(): number {
    return -1;
  }

  public static invalidExceedsMax(): number {
    return 6;
  }

  public static invalidNonInteger(): number {
    return 2.5;
  }
}
