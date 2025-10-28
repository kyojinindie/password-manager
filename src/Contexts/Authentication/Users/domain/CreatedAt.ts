import { ValueObject } from '../../../Shared/domain/ValueObject';

export class CreatedAt extends ValueObject<Date> {
  public constructor(value: Date) {
    CreatedAt.ensureIsValid(value);
    super(value);
  }

  private static ensureIsValid(value: Date): void {
    if (value === null || value === undefined) {
      throw new Error('CreatedAt cannot be null or undefined');
    }
  }
}
