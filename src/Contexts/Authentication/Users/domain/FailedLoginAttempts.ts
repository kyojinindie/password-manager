import { ValueObject } from '../../../Shared/domain/ValueObject';

export class FailedLoginAttempts extends ValueObject<number> {
  private static readonly MIN_VALUE = 0;
  private static readonly MAX_VALUE = 5;
  private static readonly LOCK_THRESHOLD = 5;

  public constructor(value: number) {
    FailedLoginAttempts.ensureIsValid(value);
    super(value);
  }

  public static zero(): FailedLoginAttempts {
    return new FailedLoginAttempts(0);
  }

  public increment(): FailedLoginAttempts {
    const newValue = Math.min(this._value + 1, FailedLoginAttempts.MAX_VALUE);
    return new FailedLoginAttempts(newValue);
  }

  public reset(): FailedLoginAttempts {
    return FailedLoginAttempts.zero();
  }

  public isAccountLocked(): boolean {
    return this._value >= FailedLoginAttempts.LOCK_THRESHOLD;
  }

  public isZero(): boolean {
    return this._value === 0;
  }

  private static ensureIsValid(value: number): void {
    if (value === null || value === undefined) {
      throw new Error('FailedLoginAttempts cannot be null or undefined');
    }

    if (!Number.isInteger(value)) {
      throw new Error('FailedLoginAttempts must be an integer');
    }

    if (value < FailedLoginAttempts.MIN_VALUE) {
      throw new Error(
        `FailedLoginAttempts cannot be negative (minimum: ${FailedLoginAttempts.MIN_VALUE})`
      );
    }

    if (value > FailedLoginAttempts.MAX_VALUE) {
      throw new Error(
        `FailedLoginAttempts cannot exceed ${FailedLoginAttempts.MAX_VALUE}`
      );
    }
  }
}
