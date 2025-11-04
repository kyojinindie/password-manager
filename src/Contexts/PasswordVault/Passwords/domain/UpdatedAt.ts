import { ValueObject } from '../../../Shared/domain/ValueObject';

export class UpdatedAt extends ValueObject<Date> {
  public constructor(value: Date) {
    UpdatedAt.ensureIsValid(value);
    super(value);
  }

  public static now(): UpdatedAt {
    return new UpdatedAt(new Date());
  }

  private static ensureIsValid(value: Date): void {
    if (!value || !(value instanceof Date)) {
      throw new Error('UpdatedAt must be a valid Date');
    }

    if (isNaN(value.getTime())) {
      throw new Error('UpdatedAt must be a valid Date');
    }
  }

  public isAfter(other: UpdatedAt): boolean {
    return this._value.getTime() > other._value.getTime();
  }

  public isBefore(other: UpdatedAt): boolean {
    return this._value.getTime() < other._value.getTime();
  }
}
