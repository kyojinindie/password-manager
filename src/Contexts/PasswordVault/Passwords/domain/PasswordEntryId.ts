import { randomUUID } from 'crypto';
import { ValueObject } from '../../../Shared/domain/ValueObject';

export class PasswordEntryId extends ValueObject<string> {
  public constructor(value: string) {
    PasswordEntryId.ensureIsValid(value);
    super(value);
  }

  public static generate(): PasswordEntryId {
    return new PasswordEntryId(randomUUID());
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('PasswordEntryId cannot be empty');
    }
  }
}
