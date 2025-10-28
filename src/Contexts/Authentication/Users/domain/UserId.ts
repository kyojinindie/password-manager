import { randomUUID } from 'crypto';
import { ValueObject } from '../../../Shared/domain/ValueObject';

export class UserId extends ValueObject<string> {
  public constructor(value: string) {
    UserId.ensureIsValid(value);
    super(value);
  }

  public static generate(): UserId {
    return new UserId(randomUUID());
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
  }
}
