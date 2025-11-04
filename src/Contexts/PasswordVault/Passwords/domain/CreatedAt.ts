import { ValueObject } from '../../../Shared/domain/ValueObject';

export class CreatedAt extends ValueObject<Date> {
  public constructor(value: Date) {
    CreatedAt.ensureIsValid(value);
    super(value);
  }

  public static now(): CreatedAt {
    return new CreatedAt(new Date());
  }

  private static ensureIsValid(value: Date): void {
    if (!value || !(value instanceof Date)) {
      throw new Error('CreatedAt must be a valid Date');
    }

    if (isNaN(value.getTime())) {
      throw new Error('CreatedAt must be a valid Date');
    }
  }

  public isAfter(other: CreatedAt): boolean {
    return this._value.getTime() > other._value.getTime();
  }

  public isBefore(other: CreatedAt): boolean {
    return this._value.getTime() < other._value.getTime();
  }
}
