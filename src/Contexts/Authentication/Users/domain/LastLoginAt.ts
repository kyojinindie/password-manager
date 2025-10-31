import { ValueObject } from '../../../Shared/domain/ValueObject';

export class LastLoginAt extends ValueObject<Date | null> {
  public constructor(value: Date | null) {
    LastLoginAt.ensureIsValid(value);
    super(value);
  }

  public static empty(): LastLoginAt {
    return new LastLoginAt(null);
  }

  public static now(): LastLoginAt {
    return new LastLoginAt(new Date());
  }

  public isEmpty(): boolean {
    return this._value === null;
  }

  public hasValue(): boolean {
    return this._value !== null;
  }

  public isBefore(date: Date): boolean {
    if (this._value === null) {
      return false;
    }
    return this._value < date;
  }

  public isAfter(date: Date): boolean {
    if (this._value === null) {
      return false;
    }
    return this._value > date;
  }

  public toDate(): Date | null {
    return this._value;
  }

  private static ensureIsValid(value: Date | null): void {
    if (value !== null && !(value instanceof Date)) {
      throw new Error('LastLoginAt must be a Date or null');
    }

    if (value !== null && isNaN(value.getTime())) {
      throw new Error('LastLoginAt must be a valid Date');
    }

    if (value !== null && value > new Date()) {
      throw new Error('LastLoginAt cannot be in the future');
    }
  }
}
